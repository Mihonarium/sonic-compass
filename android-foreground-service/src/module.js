import { Platform } from 'react-native';
import { requireNativeModule } from 'expo-modules-core';

let AndroidForegroundServiceModule;
if (Platform.OS === 'android') {
  AndroidForegroundServiceModule = requireNativeModule('AndroidForegroundService');
} else {
  // No-op on iOS — iOS uses UIBackgroundModes audio instead
  AndroidForegroundServiceModule = {
    startService: () => Promise.resolve(),
    stopService: () => Promise.resolve(),
    updateNotification: () => Promise.resolve(),
  };
}

export default AndroidForegroundServiceModule;
