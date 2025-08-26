import { Platform, Vibration } from 'react-native';
import BackgroundHapticsModule from './module';

/**
 * Trigger a haptic impact even when the app is in the background.
 *
 * The custom native module only exists on iOS.  For Android we fall back to
 * the platform vibration API which works while the app is backgrounded.
 */
export function impact(style = 'medium') {
  if (Platform.OS === 'android') {
    // Rough mapping of iOS styles to vibration durations
    const duration = style === 'light' ? 10 : style === 'heavy' ? 40 : 20;
    Vibration.vibrate(duration);
    return Promise.resolve();
  }

  if (Platform.OS !== 'ios') {
    return Promise.resolve();
  }

  return BackgroundHapticsModule.impact(style);
}

export default { impact };
