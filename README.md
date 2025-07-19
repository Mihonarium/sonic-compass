# Develop an Effortless Sense of Direction

Your brain will learn to anticipate the direction of North, building an intuitive sense of North.

Test the preview of the app:

[<img width="220" height="75" alt="image" src="https://github.com/user-attachments/assets/e1a7b56e-e7be-4bee-9bf5-7af56c1e7770" />](https://testflight.apple.com/join/sUKCjAyP)



## Features

- Real-time compass with smooth rotation
- Audio notifications when facing north
- Directional audio cues with configurable frequency
- Background audio playback (works when app is backgrounded)
- Optional offset calibration for using the phone at an angle (including in a pocket)
- No location tracking required
- Accessibility-friendly design
- Optional vibration mode when facing north

## ToDo

(uhm feel free to fork the repo and ask claude/codex/gemini to do these things and open PRs?)

- [x] Offsets for where's forward
- [x] Vibration mode
- [ ] Spatial audio for supporting headphones?
- [ ] Presets:
  - Start preset(s): sound every second?
  - Train: sound every 2 seconds with cues -> sound every 10 seconds with cues -> every 60 seconds with cues
  - Stealth sense: vibration only, no sounds
- [ ] Step-by-step instructions for offsets
- [ ] Onboarding
- [ ] Compass UI (a pointer at the top of the screen? nicer needle?)
- [ ] Add a setting for true north
- [ ] Better directional sound: ask LLMs about all the wonderful ways directional sound can be made more realistic!
- [ ] Better sounds: chimes? bells? drums? there are all sorts of sounds potentially more pleasant than what the app uses
- [ ] Nicer vibration when the app is on the background: it should be possible in principle, I have no idea how to do that
- [ ] Apple Watch version

## Setup Instructions

### Prerequisites

- Apple Developer Account
- GitHub account
- Expo account (free at expo.dev)

### 1. Required Assets (Only Images Now)

You only need these image files in `/assets/` folder:
- `icon.png` (1024x1024) - App icon
- `splash.png` - Splash screen 
- `adaptive-icon.png` - Android icon
- `favicon.png` - Web favicon

**No audio files needed!** The app generates all sounds programmatically.

### 2. Quick Start with Placeholder Images

Create simple placeholder images or use the Expo defaults:

```bash
# Create basic assets (or use any square images)
# icon.png - 1024x1024 square image
# splash.png - any size, will be resized
# adaptive-icon.png - 1024x1024 square
# favicon.png - 32x32 or larger square
```

### 2. Configure Expo/EAS Build

1. Sign up at [expo.dev](https://expo.dev)
2. Install EAS CLI: `npm install -g eas-cli`
3. Login: `eas login`
4. Configure project: `eas build:configure`
5. Update `app.json` with your bundle identifier

### 3. Build Commands

```bash
# Preview build (for testing)
eas build --platform ios --profile development

# Production build (for App Store)
eas build --platform ios --profile production

# Submit to App Store
eas submit --platform ios
```

### 4. Testing

- Use TestFlight for beta testing

## File Structure

```
/
├── App.js              # Main application component
├── package.json        # Dependencies and scripts
├── app.json           # Expo configuration
├── eas.json           # EAS Build configuration
├── .github/workflows/build.yml  # GitHub Actions
├── assets/            # Audio files and images
└── README.md          # This file
```

## Usage

1. Open app
2. Point device north to hear a sound
3. Configure the directional sounds frequency
4. Turn on the Learning mode
5. App continues to work when backgrounded or when other apps are open

## Notes

- Requires iOS device with magnetometer
- Audio will mix with other apps (doesn't interrupt music/calls)
- No location permissions required
- Complies with App Store guidelines for background audio
