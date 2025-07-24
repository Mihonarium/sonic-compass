import { Platform } from 'react-native';

let BackgroundHapticsModule = null;
if (Platform.OS === 'ios') {
  BackgroundHapticsModule = require('./module').default;
}

export function impact(style = 'medium') {
  if (!BackgroundHapticsModule) {
    // Resolve immediately on unsupported platforms
    return Promise.resolve();
  }
  return BackgroundHapticsModule.impact(style);
}

export default { impact };
