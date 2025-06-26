# Background Compass iOS App

A React Native Expo app that provides compass functionality with background audio capabilities for iOS.

## Features

- Real-time compass with smooth rotation
- Audio notifications when facing north
- Directional audio cues with configurable frequency
- Calibration mode to align with how you carry the phone
- Background audio playback (works when app is backgrounded)
- No location tracking required
- Accessibility-friendly design

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

### 3. GitHub Actions Setup

1. Go to your GitHub repository settings
2. Add repository secret: `EXPO_TOKEN` (from expo.dev profile)
3. Push code to trigger build

### 4. Build Commands

```bash
# Preview build (for testing)
eas build --platform ios --profile preview

# Production build (for App Store)
eas build --platform ios --profile production

# Submit to App Store
eas submit --platform ios
```

### 5. Testing

- Use TestFlight for beta testing
- Install on device via Expo Go for development

## Key iOS Background Features

- **Audio Session**: Configured for background playback
- **Background Modes**: Audio background mode enabled
- **Sensor Access**: Magnetometer works in background with active audio session
- **No Location**: Uses device sensors only, no GPS required

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

1. Open app and toggle the switch to start compass
2. Point device north to hear notification sound
3. Configure direction sound frequency in settings
4. App continues to work when backgrounded or when other apps are open

## Notes

- Requires iOS device with magnetometer
- Works best when device is held flat
- Audio will mix with other apps (doesn't interrupt music/calls)
- No location permissions required
- Complies with App Store guidelines for background audio
