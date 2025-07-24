import { Platform } from 'react-native';
import BackgroundHapticsModule from './module';

export function impact(style = 'medium') {
  if (Platform.OS !== 'ios') {
    return Promise.resolve();
  }
  return BackgroundHapticsModule.impact(style);
}

export default { impact };
