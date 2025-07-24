# Acquire a New Sense: The Direction of North.

Sonic Compass is a tool for perceptual learning. It uses spatial audio and predictive feedback to help you build an intuitive, persistent sense of direction that works even when the app is off.

You'll continuously be able to feel that North is *right there*.

[<img width="220" height="75" alt="image" src="https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg" />](https://apps.apple.com/gb/app/sonic-compass/id6746952992)

## How It Works: A Feedback Loop for Your Brain

**1. The Cue (A Question)**

A neutral, centered sound plays, prompting your brain with a subconscious question: "Where is North?"

**2. The Prediction**

In the brief moment after the cue, your brain makes an automatic prediction: you start to expect where the next sound will be.

**3. The Feedback (The Answer)**

One second later, a sound plays from the actual direction of North, providing immediate feedback and building the feeling that North is right there.

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
- [x] Nicer vibration when the app is on the background: it should be possible in principle, I have no idea how to do that
  - [x] Yay, we did that! Gemini made five failed builds, codex made two failed builds, but I was able to ignore its incorrect suggestions for how to fix it and fixed them myself! 
  - [ ] Even nicer vibrations in-app and on the background (maybe only on north/when crossing it instead of each of five degrees around 0*?)
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
- [ ] Apple Watch version
- [ ] Android version
- [ ] Save generated sounds to not have to generate them every time
  - [ ] or just generate them in advance and distribute with the app?
- [ ] Only vibrate exactly on North/when passing it, not on each of the nearby degrees
- [ ] Add a mode when nothing happens if the phone points north
- [ ] Remember settings

## Setup Instructions

### Prerequisites

- Apple Developer Account
- Expo account (free at expo.dev)

### 1. Configure Expo/EAS Build

1. Sign up at [expo.dev](https://expo.dev)
2. Install EAS CLI: `npm install -g eas-cli`
3. Login: `eas login`
4. Configure project: `eas build:configure`
5. Update `app.json` with your bundle identifier

### 2. Build Commands

```bash
# Preview build (for testing)
# Ask o3 to help you figure out how to get all the signed things and/or follow Expo instructions.
# This command will show a QR code. Scan it with your phone. (The QR code is also available in Builds on Expo.)
eas build --platform ios --profile development

# Run this and scan the QR code. You can now test the app!
npx expo start --tunnel

# Production build (for App Store)
eas build --platform ios --profile production

# Submit to App Store
eas submit --platform ios
```

## File Structure

```
/
├── App.js               # Main application component
├── package.json         # Dependencies and scripts
├── app.json             # Expo configuration
├── eas.json             # EAS Build configuration
├── assets/              # Images & audio files
├── background-haptics/  # A background haptics module for iOS
└── README.md            # This file
```

## Usage

1. Open the app
2. Point the device north to hear a sound
3. Configure the directional sound frequency
4. Turn on the Learning mode
5. App continues to work when backgrounded or when other apps are open

## Notes

- Requires iOS device with magnetometer
- Audio will mix with other apps (doesn't interrupt music/calls)
- No location permissions required
- Complies with App Store guidelines for background audio
