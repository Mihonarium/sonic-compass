import { Platform } from 'react-native';
import { requireNativeModule } from 'expo-modules-core';

let AndroidForegroundServiceModule;
if (Platform.OS === 'android') {
  AndroidForegroundServiceModule = requireNativeModule('AndroidForegroundService');
} else {
  // No-op on iOS — iOS uses UIBackgroundModes audio instead, and JS timers
  // keep running in background there, so the native timer API isn't needed
  AndroidForegroundServiceModule = {
    startService: () => Promise.resolve(),
    stopService: () => Promise.resolve(),
    updateNotification: () => Promise.resolve(),
    startInterval: () => Promise.resolve(),
    stopInterval: () => Promise.resolve(),
    setTimeout: () => Promise.resolve(),
    clearTimeout: () => Promise.resolve(),
    addListener: () => ({ remove: () => {} }),
    loadSound: () => Promise.resolve(null),
    playSound: () => Promise.resolve(),
  };
}

export default AndroidForegroundServiceModule;
