# Onboarding carousel — design

Approved via iterated visual previews at data.claude.ms/sonic-onboarding/ (rounds 1–2c).

## What

A six-slide, swipeable, full-screen onboarding carousel ("The Walker" direction),
shown once on first launch, skippable, and replayable from Advanced → View intro.

Slides (copy final, from the preview):

1. **Acquire a new sense.** — kicker SONIC COMPASS; walker cutout with the animated
   red North blob; "Your brain can learn to feel where North is."; headphones note.
2. **How it works** — loop scene background; steps ①: cue = question "where's
   North?", ②: one second to guess, ③: sound from where North actually is = answer;
   tag "Predicting the answer is what turns North into a sense."
3. **First: immerse** — walk scene; "Set the frequency to [1s] and just walk."
   (inline badge); "Do it for 30 minutes to a couple of hours — over a few days is
   fine. Lower the frequency over time, as you become used to the feeling."
4. **Then: predict** — predict scene (red beacon on horizon); steps 2s Learning
   mode / 5s anticipate / increase interval / "until North is simply there — even
   with the app off."
5. **Potential issues** — plain background; Q&A: compass wrong (calibration,
   MagSafe/magnets), crossing-North sound (Vibration mode), wrong direction
   (hold straight; pocket → offset in Advanced, reset after), sunscreen joke.
6. **That's it.** — walker + blob high; background/no-music-interruption note +
   pocket → Advanced; CTA **Start walking**; "Learned to feel North? Please tell
   @Mihonarium what it feels like." (links to x.com/Mihonarium).

## How

- Single-file convention: `OnboardingCarousel` component in App.js, rendered as a
  full-screen `Modal`. Horizontal paged ScrollView, width = window width per slide.
- Page dots from scroll position; Skip (top-right) on all but the last slide;
  Next scrolls forward; Start walking (and Skip) call `onDone`.
- First-launch: `AsyncStorage` key `sonic_compass_onboarding_seen`; unset → show.
  `onDone` sets the key. Existing users see it once after updating (intended).
- Advanced page gains a "View intro" button that re-opens the carousel (does not
  clear the seen flag).
- North blob: `Animated.Image` with the `north_blob.png` sprite (asymmetric glow so
  rotation reads); two native-driver loops — scale 1→1.22 @ ~1.05s ease-in-out,
  rotation 360° @ 3.5s linear. Runs only while the carousel is visible.
- Scene slides: absolute `Image` `resizeMode:cover` + `expo-linear-gradient` scrim
  (transparent → #101c30) + bottom-anchored text. Slide 1/5/6 use the app gradient.
- Assets in `assets/onboarding/` (~180 KB total): walker.webp (alpha cutout),
  loop.webp, walk.webp, predict.webp, north_blob.png. Added to
  assetBundlePatterns.
- Twitter line opens `https://x.com/Mihonarium` via `Linking`.

## Screen-size behavior

- All type via existing `fontScale`; spacing via `scale`/`verticalScale`.
- Art areas are flex (`flex:1, minHeight:0`) so slides degrade gracefully on short
  screens; scene backgrounds are cover-scaled by nature.
- Top padding = safe-area top inset (+10) so Skip clears notches/status bars on
  both platforms; bottom padding = max(design padding, bottom inset + 8) so the
  dots clear home indicators and Android nav bars.
- Longest slide (Potential issues) verified to fit ~640 dp tall screens at
  design font sizes.

## Not doing

- No per-slide parallax/animation beyond the blob (YAGNI).
- No "don't show again" checkbox — Skip + one-time flag suffices.
- No localization pass (app is English-only today).
