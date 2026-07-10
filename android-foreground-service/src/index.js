import AndroidForegroundServiceModule from './module';

export function startService(title, body) {
  return AndroidForegroundServiceModule.startService(title ?? null, body ?? null);
}

export function stopService() {
  return AndroidForegroundServiceModule.stopService();
}

export function updateNotification(title, body) {
  return AndroidForegroundServiceModule.updateNotification(title ?? null, body ?? null);
}

// Background-safe timers: RN's JS timers are Choreographer-driven and freeze
// while the Android screen is off; these run on a native HandlerThread instead.
export function startInterval(intervalMs) {
  return AndroidForegroundServiceModule.startInterval(intervalMs);
}

export function stopInterval() {
  return AndroidForegroundServiceModule.stopInterval();
}

export function setTimeoutNative(id, delayMs) {
  return AndroidForegroundServiceModule.setTimeout(id, delayMs);
}

export function clearTimeoutNative(id) {
  return AndroidForegroundServiceModule.clearTimeout(id);
}

// Listeners receive: onTick → (), onTimeout → ({ id })
export function addTickListener(listener) {
  return AndroidForegroundServiceModule.addListener('onTick', listener);
}

export function addTimeoutListener(listener) {
  return AndroidForegroundServiceModule.addListener('onTimeout', listener);
}

// SoundPool-backed playback: never requests audio focus, so cues mix on top
// of other apps' audio instead of ducking it. Volumes are 0–1 per channel.
export function loadSound(fileUri) {
  return AndroidForegroundServiceModule.loadSound(fileUri);
}

export function playSound(soundId, leftVolume, rightVolume) {
  return AndroidForegroundServiceModule.playSound(soundId, leftVolume, rightVolume);
}

export default {
  startService,
  stopService,
  updateNotification,
  startInterval,
  stopInterval,
  setTimeoutNative,
  clearTimeoutNative,
  addTickListener,
  addTimeoutListener,
  loadSound,
  playSound,
};
