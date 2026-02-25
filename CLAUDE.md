# Sonic Compass - Development Notes

## Project Overview

React Native (Expo SDK 53) app that helps users develop an intuitive sense of magnetic North through spatial audio cues and haptic feedback. iOS (App Store: `ms.contact.compass`) and Android.

## Architecture

**Single-file app**: All UI and logic lives in `App.js` (~1200 lines). No router, no state management library.

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
- **Background audio** uses a foreground service with a persistent notification ("Sonic Compass is running") for reliable background audio. This prevents Android from killing the audio process under Doze mode.
- Uses `InterruptionModeAndroid.DuckOthers` to briefly lower other apps' audio during compass cues
- Background vibration uses `Vibration.vibrate()` directly (only works while process is alive)
- `FOREGROUND_SERVICE`, `FOREGROUND_SERVICE_MEDIA_PLAYBACK`, `POST_NOTIFICATIONS`, and `VIBRATE` permissions are declared

## General Notes

- No test suite exists; changes must be verified manually on device
- Compass calibration offset is persisted; raw heading is adjusted at read time
- The `vibrationModeRef` pattern (ref synced to state) is needed because interval callbacks capture stale state closures
