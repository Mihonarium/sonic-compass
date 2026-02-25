import { Platform } from 'react-native';
import { requireNativeModule } from 'expo-modules-core';

let BackgroundHapticsModule;
if (Platform.OS === 'ios') {
  BackgroundHapticsModule = requireNativeModule('BackgroundHaptics');
} else {
  BackgroundHapticsModule = { impact: () => Promise.resolve() };
}

export default BackgroundHapticsModule;
