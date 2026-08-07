# Sonic Compass - Development Notes

## Project Overview

React Native (Expo SDK 54, RN 0.81) app that helps users develop an intuitive sense of magnetic North through spatial audio cues and haptic feedback. iOS (App Store: `ms.contact.compass`) and Android (Play: `ms.contact.compass`, targets API 36).

## Architecture

**Single-file app**: All UI and logic lives in `App.js` (~1200 lines). No router, no state management library.

**Onboarding**: a six-slide carousel (`OnboardingCarousel` in App.js, assets in `assets/onboarding/`) shown as a full-screen Modal on first launch (AsyncStorage key `sonic_compass_onboarding_seen`), skippable, replayable via Advanced → View intro. Design/copy iterated at data.claude.ms/sonic-onboarding/ (spec in `docs/superpowers/specs/2026-08-07-onboarding-carousel-design.md`). Uses safe-area constants `SAFE_TOP`/`SAFE_BOTTOM` from `initialWindowMetrics`.

**Native module**: `background-haptics/` is a local Expo module (Swift, iOS-only native code) that provides haptic feedback when the app is backgrounded, using `AudioServicesPlaySystemSound`. On Android, the module falls back to a no-op; background vibration uses `Vibration.vibrate()` directly instead.

## Key Files

| File | Purpose |
|------|---------|
| `App.js` | Entire app: audio generation, compass logic, UI, settings |
| `app.json` | Expo config, iOS permissions, bundle ID |
| `background-haptics/ios/BackgroundHapticsModule.swift` | Native haptics via AudioToolbox |
| `background-haptics/src/index.js` | JS bridge for the native module |
| `android-foreground-service/` | Expo native module (Kotlin/Android) that starts a foreground service with mediaPlayback type to keep background audio alive on Android. Includes a config plugin that injects service declaration and permissions into AndroidManifest.xml. |

## How It Works

1. `react-native-compass-heading` provides magnetometer heading updates
2. Audio is generated programmatically as WAV buffers (sine waves with stereo panning)
3. 121 pre-generated directional sounds provide fine-grained spatial audio
4. A silent looping sound keeps the audio session active in background
5. "Learning mode" plays a centered cue tone 1s before the directional sound

## Conventions

- **Styling**: All styles in a single `StyleSheet.create()` at bottom of App.js
- **Scaling**: Adaptive UI via `scale()`, `verticalScale()`, `fontScale()` helpers (design ref: iPhone 13 Pro Max 428x926)
- **State**: React `useState` + `useRef` for values needed in callbacks/intervals
- **Audio**: Generated at init, stored as `Audio.Sound` instances in refs
- **Settings persistence**: Uses `@react-native-async-storage/async-storage`

## Build & Test

```bash
# Dev build (requires Apple Developer Account + EAS for iOS)
eas build --platform ios --profile development
eas build --platform android --profile development
npx expo start --tunnel

# Production
eas build --platform ios --profile production
eas build --platform android --profile production
eas submit --platform ios
```

## Platform Notes

### iOS
- Background audio requires `UIBackgroundModes: ["audio"]` in Info.plist
- Uses `InterruptionModeIOS.MixWithOthers` to not interrupt other audio
- Background haptics use AudioToolbox SystemSoundIDs (works reliably)

### Android
- **Background audio** uses a foreground service with a persistent notification ("Sonic Compass is running"). The service holds a partial wakelock so sensors and timers keep running with the screen off. It returns `START_NOT_STICKY` (a restarted service without JS would be a zombie), stops everything in `onTaskRemoved` (swipe-away = quit, matching iOS), and its notification opens the app on tap.
- **JS timers freeze when the screen is off**: React Native's `setTimeout`/`setInterval` are Choreographer (vsync) driven on Android and stop firing when the display sleeps — even with a foreground service. All timing that must survive screen-off (direction-sound interval, question-cue delay, calibration timeout, north debounce) goes through the `bgSetTimeout`/`bgSetInterval` helpers in App.js, which call native `Handler`-based timers in `android-foreground-service`. UI-only timeouts can stay as plain JS timers.
- **All Android playback goes through a native SoundPool** (in `android-foreground-service`), NOT expo-av. SoundPool never requests audio focus, so cues mix on top of other apps' audio (the Android equivalent of iOS `MixWithOthers`) instead of ducking it. Panning is continuous, applied per play via left/right channel volumes using the same constant-power law `sineBuffer` bakes into the iOS files. Only 3 unpanned samples are loaded (dir/north/question); there is no silent keepalive loop on Android — the foreground service keeps the process alive.
- `setHeading` is skipped while backgrounded (sensor events arrive ~50×/s; rendering an invisible UI wastes battery)
- Background vibration uses `Vibration.vibrate()` directly (only works while process is alive)
- `FOREGROUND_SERVICE`, `FOREGROUND_SERVICE_MEDIA_PLAYBACK`, `POST_NOTIFICATIONS`, `WAKE_LOCK`, and `VIBRATE` permissions are declared; `RECORD_AUDIO` (pulled in by expo-av) is blocked via `blockedPermissions`
- `POST_NOTIFICATIONS` is requested at runtime (Android 13+) before starting the foreground service; if denied, a hint to enable it in Settings is shown under the status line
- **Edge-to-edge is mandatory** (target API 36): Android draws behind the status/nav bars like iOS, so the iOS design margins apply as-is. `ANDROID_TOP_INSET`/`ANDROID_BOTTOM_INSET` (from `initialWindowMetrics`, both 0 on iOS) provide a floor for the header margin and bottom nav-bar clearance. Do NOT subtract the status bar height from margins — that was only correct pre-edge-to-edge.
- The generated `android/`/`ios/` directories are gitignored (CNG); regenerate with `npx expo prebuild`

### Google-Play-Services-free builds
- `expo-dev-client` is deliberately NOT in package.json (PR #53): its Android dev-launcher is not debug-gated and pulls GMS + MLKit into release builds. The default dependency tree is GMS-free so source builds work on de-Googled devices.
- **Development builds: use `npm run dev:build` (optionally `npm run dev:build ios`)**, NOT `eas build --profile development` directly — eas-cli refuses a dev-profile build without expo-dev-client installed locally. The wrapper (`scripts/eas-dev-build.sh`) temporarily installs it, submits (the project uploads with it, so the EAS builder gets it too), then restores package.json/lockfile/node_modules even on failure.
- For a local dev-launcher build, run `npx expo install expo-dev-client` first and don't commit the package.json change. Plain `npx expo run:android` debug builds work without it (Metro still connects; you just lose the launcher UI).
- `expo-location` was removed as unused; don't re-add location deps without checking the manifest for GMS fallout.

### SDK upgrade notes
- SDK 54 keeps `expo-av` (16.0.8, deprecated) — iOS audio is unchanged. SDK 55+ removes it; upgrading past 54 requires migrating iOS playback to `expo-audio`.
- `expo-file-system` is imported from `expo-file-system/legacy` (SDK 54 changed the default API).
- Google Play requires target API within one year of the latest Android release — plan SDK upgrades accordingly.

### Audio file caching
- `writeWav(name, makeFloatBuf)` takes a **thunk** and caches generated WAVs in `FileSystem.cacheDirectory`, keyed by `SOUND_CACHE_VERSION` — bump that constant whenever sound generation changes (frequencies, durations, pan law) or stale cached files will be reused

## General Notes

- No test suite exists; changes must be verified manually on device
- Compass calibration offset is persisted; raw heading is adjusted at read time
- The `vibrationModeRef` pattern (ref synced to state) is needed because interval callbacks capture stale state closures
