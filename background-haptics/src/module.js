import { Platform } from 'react-native';
import { requireNativeModule } from 'expo-modules-core';

export default Platform.OS === 'ios'
  ? requireNativeModule('BackgroundHaptics')
  : { impact: () => {} };
