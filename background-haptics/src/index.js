import { Platform, Vibration } from 'react-native';

let BackgroundHapticsModule = null;
if (Platform.OS === 'ios') {
  BackgroundHapticsModule = require('./module').default;
}

export function impact(style = 'medium') {
  if (Platform.OS === 'android') {
    const durations = { light: 20, medium: 35, heavy: 50 };
    Vibration.vibrate(durations[style] ?? durations.medium);
    return Promise.resolve();
  }
  if (Platform.OS !== 'ios') {
    return Promise.resolve();
  }
  return BackgroundHapticsModule.impact(style);
}

export default { impact };
