import { Platform } from 'react-native';
import TrackPlayer, { Capability, AppKilledPlaybackBehavior } from 'react-native-track-player';
import * as FileSystem from 'expo-file-system';
import { Buffer } from 'buffer';

const SAMPLE_RATE = 44100;

// Generate a silent WAV buffer
const generateSilentWav = (durationSec) => {
  const frames = durationSec * SAMPLE_RATE;
  const buf = new Float32Array(frames * 2); // Stereo silence
  // All zeros = silence
  return buf;
};

const pcm16Stereo = (float32) => {
  const out = new Int16Array(float32.length);
  for (let i = 0; i < float32.length; i++) {
    out[i] = Math.max(-1, Math.min(1, float32[i])) * 0x7FFF;
  }
  return out;
};

const makeWavBytesStereo = (floatBuf) => {
  const pcm = pcm16Stereo(floatBuf);
  const byteLen = 44 + pcm.length * 2;
  const dv = new DataView(new ArrayBuffer(byteLen));
  let o = 0;
  const str = s => { for (let i = 0; i < s.length; i++) dv.setUint8(o++, s.charCodeAt(i)); };

  str('RIFF'); dv.setUint32(o, byteLen - 8, true); o += 4;
  str('WAVEfmt '); dv.setUint32(o, 16, true); o += 4;
  dv.setUint16(o, 1, true); o += 2; // PCM
  dv.setUint16(o, 2, true); o += 2; // Stereo
  dv.setUint32(o, SAMPLE_RATE, true); o += 4;
  dv.setUint32(o, SAMPLE_RATE * 4, true); o += 4; // byte rate for stereo 16-bit
  dv.setUint16(o, 4, true); o += 2; // block align for stereo 16-bit
  dv.setUint16(o, 16, true); o += 2; // bits per sample
  str('data'); dv.setUint32(o, pcm.length * 2, true); o += 4;
  new Uint8Array(dv.buffer).set(new Uint8Array(pcm.buffer), 44);
  return new Uint8Array(dv.buffer);
};

let isInitialized = false;
let silentTrackUri = null;

// Initialize TrackPlayer for Android background audio
export async function initBackgroundAudio() {
  if (Platform.OS !== 'android') {
    return; // iOS uses expo-av background modes
  }

  if (isInitialized) {
    return;
  }

  try {
    // Generate silent audio file
    const silentBuffer = generateSilentWav(30); // 30 seconds of silence
    const wavBytes = makeWavBytesStereo(silentBuffer);
    const b64 = Buffer.from(wavBytes).toString('base64');
    silentTrackUri = FileSystem.cacheDirectory + 'background_silent.wav';
    await FileSystem.writeAsStringAsync(silentTrackUri, b64, { encoding: FileSystem.EncodingType.Base64 });

    // Setup TrackPlayer
    await TrackPlayer.setupPlayer({
      autoHandleInterruptions: true,
    });

    await TrackPlayer.updateOptions({
      capabilities: [
        Capability.Play,
        Capability.Pause,
        Capability.Stop,
      ],
      compactCapabilities: [Capability.Play, Capability.Pause],
      android: {
        appKilledPlaybackBehavior: AppKilledPlaybackBehavior.ContinuePlayback,
      },
      notificationCapabilities: [
        Capability.Play,
        Capability.Pause,
      ],
      // Minimal notification
      progressUpdateEventInterval: 0,
    });

    isInitialized = true;
  } catch (error) {
    console.error('Failed to initialize background audio:', error);
  }
}

// Start background audio service (Android only)
export async function startBackgroundService() {
  if (Platform.OS !== 'android' || !isInitialized) {
    return;
  }

  try {
    const queue = await TrackPlayer.getQueue();
    if (queue.length === 0) {
      await TrackPlayer.add({
        id: 'silent-background',
        url: silentTrackUri,
        title: 'Sonic Compass',
        artist: 'Running in background',
        duration: 30,
      });
    }

    await TrackPlayer.setVolume(0.01); // Nearly silent
    await TrackPlayer.setRepeatMode(1); // Repeat track
    await TrackPlayer.play();
  } catch (error) {
    console.error('Failed to start background service:', error);
  }
}

// Stop background audio service
export async function stopBackgroundService() {
  if (Platform.OS !== 'android' || !isInitialized) {
    return;
  }

  try {
    await TrackPlayer.stop();
    await TrackPlayer.reset();
  } catch (error) {
    console.error('Failed to stop background service:', error);
  }
}

// Check if background service is running
export async function isBackgroundServiceRunning() {
  if (Platform.OS !== 'android' || !isInitialized) {
    return false;
  }

  try {
    const state = await TrackPlayer.getPlaybackState();
    return state.state === 'playing' || state.state === 'buffering';
  } catch {
    return false;
  }
}
