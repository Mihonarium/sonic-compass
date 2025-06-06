// File: App.js
import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet, View, Text, TouchableOpacity,
  Alert, AppState, Dimensions
} from 'react-native';
import { Audio, InterruptionModeIOS, InterruptionModeAndroid } from 'expo-av';
import CompassHeading from 'react-native-compass-heading';
import * as FileSystem from 'expo-file-system';
import * as ScreenOrientation from 'expo-screen-orientation';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle, Line, Text as SvgText, G, Defs, RadialGradient, Stop, Polygon } from 'react-native-svg';
import { Buffer } from 'buffer';

const { width: screenWidth } = Dimensions.get('window');

////////////////////////////////////////////////////////////////////////////////
// 1. STATIC CONFIGURATION //////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
const FREQ_OPTS = [
  { label: 'Off', value: 0 },
  { label: '0.5s', value: 500 },
  { label: '1s', value: 1000 },
  { label: '2s', value: 2000 },
  { label: '5s', value: 5000 },
  { label: '10s', value: 10000 },
  { label: '20s', value: 20000 },
  { label: '30s', value: 30000 },
  { label: '60s', value: 60000 }
];
const SAMPLE_RATE = 44100;

////////////////////////////////////////////////////////////////////////////////
// 2. AUDIO HELPERS /////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
const sineBuffer = (freq, durSec, panValue = 0) => {
  const frames = durSec * SAMPLE_RATE;
  const buf = new Float32Array(frames * 2); // Stereo
  
  for (let i = 0; i < frames; i++) {
    const t = i / SAMPLE_RATE;
    const fade = Math.min(1, t / 0.02, (durSec - t) / 0.02); // 20ms fade
    const sample = fade * Math.sin(2 * Math.PI * freq * t) * 0.3; // Lower volume
    
    // Apply stereo panning
    const leftGain = Math.cos((panValue + 1) * Math.PI / 4);
    const rightGain = Math.sin((panValue + 1) * Math.PI / 4);
    
    buf[i * 2] = sample * leftGain;     // Left channel
    buf[i * 2 + 1] = sample * rightGain; // Right channel
  }
  return buf;
};

const pcm16Stereo = float32 => {
  const out = new Int16Array(float32.length);
  for (let i = 0; i < float32.length; i++) {
    out[i] = Math.max(-1, Math.min(1, float32[i])) * 0x7FFF;
  }
  return out;
};

const makeWavBytesStereo = floatBuf => {
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

const writeWav = async (name, floatBuf) => {
  const b64 = Buffer.from(makeWavBytesStereo(floatBuf)).toString('base64');
  const uri = FileSystem.cacheDirectory + name;
  await FileSystem.writeAsStringAsync(uri, b64, { encoding: FileSystem.EncodingType.Base64 });
  return uri;
};

////////////////////////////////////////////////////////////////////////////////
// 3. MAIN COMPONENT ////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
export default function App() {
  // ----- STATE ---------------------------------------------------------------
  const [heading, setHeading] = useState(0);
  const [freq, setFreq] = useState(1000);
  const [north, setNorth] = useState(false);
  const [lastDir, setLastDir] = useState(0);
  const [status, setStatus] = useState('Initializing...');

  // ----- REFS ----------------------------------------------------------------
  const rotRef = useRef(0);
  const northSound = useRef(null);
  const dirSounds = useRef({});
  const lastDirectionalSoundTime = useRef(0);
  const directionSoundInterval = useRef(null);
  const currentHeading = useRef(0);
  const northSoundPlaying = useRef(false);
  const pulseRef = useRef(null); // Direct ref to pulse element

  // ----- AUDIO FUNCTIONS -----------------------------------------------------
  const initAudio = async () => {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: true,
        playsInSilentModeIOS: true,
        interruptionModeIOS: InterruptionModeIOS.MixWithOthers,
        interruptionModeAndroid: InterruptionModeAndroid.DoNotMix,
        shouldDuckAndroid: false,
        playThroughEarpieceAndroid: false,
      });

      // Create north sound (mono)
      const northURI = await writeWav('north.wav', sineBuffer(880, 0.3));
      northSound.current = (await Audio.Sound.createAsync(
        { uri: northURI }, 
        { shouldPlay: false, volume: 0.8 }
      )).sound;

      // Create directional sounds with MANY pan values for extremely precise directionality
      const panValues = [];
      // Generate 41 pan values from -1.0 to +1.0 in 0.05 increments
      for (let i = 0; i <= 40; i++) {
        panValues.push(-1.0 + (i * 0.05));
      }
      // Result: [-1.0, -0.95, -0.9, -0.85, ..., 0.85, 0.9, 0.95, 1.0]
      
      for (let i = 0; i < panValues.length; i++) {
        const panValue = panValues[i];
        const dirURI = await writeWav(`dir_${i}.wav`, sineBuffer(440, 0.25, panValue));
        dirSounds.current[i] = (await Audio.Sound.createAsync(
          { uri: dirURI }, 
          { shouldPlay: false, volume: 0.4 }
        )).sound;
      }

      // Create silent sound for background activity
      const silentURI = await writeWav('silent.wav', sineBuffer(0, 0.1));
      dirSounds.current.silent = (await Audio.Sound.createAsync(
        { uri: silentURI }, 
        { shouldPlay: false, volume: 0.01, isLooping: true }
      )).sound;

      setStatus('Audio initialized');
    } catch (error) {
      console.error('Audio init error:', error);
      setStatus('Audio init failed');
    }
  };

  const playNorth = async () => {
    try {
      // Only play if not already playing
      if (!northSoundPlaying.current) {
        northSoundPlaying.current = true;
        await northSound.current?.replayAsync();
        
        // Reset flag after sound duration (300ms for north sound)
        setTimeout(() => {
          northSoundPlaying.current = false;
        }, 300);
      }
    } catch (error) {
      console.error('North sound error:', error);
      northSoundPlaying.current = false;
    }
  };

  const playDir = async (panValue) => {
    try {
      const correctedPan = -panValue; // Invert for correct left/right
      
      // Map pan value (-1 to 1) to sound index (0 to 40) for 41 different positions
      const index = Math.round((correctedPan + 1) * 20); // Maps -1->0, 0->20, 1->40
      const soundIndex = Math.max(0, Math.min(40, index));
      
      const sound = dirSounds.current[soundIndex];
      if (sound) {
        const status = await sound.getStatusAsync();
        if (!status?.isPlaying) {
          await sound.setPositionAsync(0);
          await sound.playAsync();
        }
      }
    } catch (error) {
      console.error('Direction sound error:', error);
    }
  };

  const startSilentSound = async () => {
    try {
      const silentSound = dirSounds.current.silent;
      if (silentSound) {
        await silentSound.playAsync();
      }
    } catch (error) {
      console.error('Silent sound error:', error);
    }
  };

  const stopSilentSound = async () => {
    try {
      const silentSound = dirSounds.current.silent;
      if (silentSound) {
        await silentSound.stopAsync();
      }
    } catch (error) {
      console.error('Silent sound stop error:', error);
    }
  };

  // ----- TIMER FUNCTIONS -----------------------------------------------------
  const startDirectionSoundTimer = () => {
    // Clear any existing timer
    if (directionSoundInterval.current) {
      clearInterval(directionSoundInterval.current);
      directionSoundInterval.current = null;
    }
    
    if (freq > 0) {
      directionSoundInterval.current = setInterval(() => {
        const hdg = currentHeading.current;
        const northNow = hdg <= 5 || hdg >= 355;
        
        if (!northNow) {
          const panValue = Math.sin(hdg * Math.PI / 180);
          playDir(panValue);
          lastDirectionalSoundTime.current = Date.now();
          setLastDir(Date.now());
        }
      }, freq);
    }
  };

  const stopDirectionSoundTimer = () => {
    if (directionSoundInterval.current) {
      clearInterval(directionSoundInterval.current);
      directionSoundInterval.current = null;
    }
  };

  // ----- COMPASS FUNCTIONS ---------------------------------------------------
  const updateCompass = (hdg) => {
    const roundedHeading = Math.round(hdg * 10) / 10;
    currentHeading.current = roundedHeading;
    
    const target = -roundedHeading;
    let diff = target - rotRef.current;
    
    while (diff > 180) diff -= 360;
    while (diff < -180) diff += 360;
    
    rotRef.current += diff;
    setHeading(roundedHeading);

    const northNow = roundedHeading <= 5 || roundedHeading >= 355;
    
    // Direct manipulation of pulse visibility
    if (northNow && !north) {
      // Just entered north zone
      setNorth(true);
      if (pulseRef.current) {
        pulseRef.current.setNativeProps({ style: { opacity: 0.4 } });
      }
      playNorth();
      stopSilentSound();
    } else if (!northNow && north) {
      // Just left north zone
      setNorth(false);
      if (pulseRef.current) {
        pulseRef.current.setNativeProps({ style: { opacity: 0 } });
      }
      
      if (freq > 0) {
        startSilentSound();
      }
    }

    if (freq === 0) {
      stopSilentSound();
    } else if (!northNow && freq > 0) {
      const timeSinceLastSound = Date.now() - lastDirectionalSoundTime.current;
      if (timeSinceLastSound > 1000) {
        startSilentSound();
      }
    }
  };

  const startCompass = async () => {
    try {
      setStatus('Starting compass...');
      
      CompassHeading.start(1, ({ heading, accuracy }) => {
        updateCompass(heading);
      });
      
      lastDirectionalSoundTime.current = 0;
      startDirectionSoundTimer();
      
      setStatus('Compass active');
    } catch (error) {
      throw new Error(`Compass error: ${error.message}`);
    }
  };

  const stopCompass = () => {
    CompassHeading.stop();
    stopDirectionSoundTimer();
    stopSilentSound();
    setStatus('Compass stopped');
  };

  // ----- UI FUNCTIONS --------------------------------------------------------
  const initializeApp = async () => {
    try {
      setStatus('Initializing...');
      await initAudio();
      await startCompass();
      setStatus('Compass active');
    } catch (error) {
      console.error('Initialization error:', error);
      setStatus(`Error: ${error.message}`);
    }
  };

  const dirTxt = (deg) => {
    const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    return dirs[Math.round(deg / 45) % 8];
  };

  const freqTxt = () => FREQ_OPTS.find(o => o.value === freq)?.label || 'Unknown';
  
  const cycle = () => {
    const currentIndex = FREQ_OPTS.findIndex(o => o.value === freq);
    const nextIndex = (currentIndex + 1) % FREQ_OPTS.length;
    const newFreq = FREQ_OPTS[nextIndex].value;
    setFreq(newFreq);
    startDirectionSoundTimer(); // Restart timer with new frequency
  };

  // ----- SIDE-EFFECTS --------------------------------------------------------
  useEffect(() => {
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
  }, []);

  useEffect(() => {
    initializeApp();
  }, []);

  useEffect(() => {
    return () => {
      stopCompass();
      stopDirectionSoundTimer();
      stopSilentSound();
      
      northSound.current?.unloadAsync();
      Object.values(dirSounds.current).forEach(sound => sound?.unloadAsync());
    };
  }, []);

  useEffect(() => {
    const sub = AppState.addEventListener('change', state => {
      if (state === 'background') {
        setStatus('Running in background');
      } else if (state === 'active') {
        setStatus('Compass active');
      }
    });
    return () => sub?.remove();
  }, []);

  // ----- RENDER --------------------------------------------------------------
  const compassSize = Math.min(screenWidth * 0.8, 300);
  const radius = compassSize / 2;

  return (
    <LinearGradient colors={['#0f1a2b', '#253b56']} style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>North Compass</Text>
      </View>

      {/* Compass */}
      <View style={[styles.compassWrap, { width: compassSize, height: compassSize }]}>
        <View 
          ref={pulseRef}
          style={[styles.pulse, { 
            width: compassSize + 20, 
            height: compassSize + 20,
            borderRadius: (compassSize + 20) / 2,
            opacity: 0 // Start hidden
          }]} 
        />
        
        <Svg width={compassSize} height={compassSize}>
          <Defs>
            <RadialGradient id="compassGrad" cx="50%" cy="50%" r="50%">
              <Stop offset="0%" stopColor="#1E293B" />
              <Stop offset="70%" stopColor="#0F172A" />
              <Stop offset="100%" stopColor="#020617" />
            </RadialGradient>
            <RadialGradient id="innerGrad" cx="50%" cy="50%" r="50%">
              <Stop offset="0%" stopColor="#334155" />
              <Stop offset="100%" stopColor="#1E293B" />
            </RadialGradient>
          </Defs>
          
          <G transform={`rotate(${rotRef.current} ${radius} ${radius})`}>
            <Circle 
              cx={radius} 
              cy={radius} 
              r={radius - 5} 
              fill="url(#compassGrad)" 
              stroke="rgba(59, 130, 246, 0.3)" 
              strokeWidth="1.5" 
            />
            
            <Circle 
              cx={radius} 
              cy={radius} 
              r={radius - 25} 
              fill="url(#innerGrad)" 
              stroke="rgba(148, 163, 184, 0.2)" 
              strokeWidth="1" 
            />

            {Array.from({ length: 72 }, (_, i) => {
              const angle = i * 5;
              const isMajor = angle % 90 === 0;
              const isMinor = angle % 30 === 0;
              const isSmall = angle % 10 === 0;
              
              const length = isMajor ? 20 : isMinor ? 15 : isSmall ? 10 : 6;
              const width = isMajor ? 3 : isMinor ? 2 : 1;
              const opacity = isMajor ? 1 : isMinor ? 0.8 : isSmall ? 0.6 : 0.4;
              
              const outerRadius = radius - 15;
              const innerRadius = outerRadius - length;
              const angleRad = (angle - 90) * Math.PI / 180;
              
              const x1 = radius + outerRadius * Math.cos(angleRad);
              const y1 = radius + outerRadius * Math.sin(angleRad);
              const x2 = radius + innerRadius * Math.cos(angleRad);
              const y2 = radius + innerRadius * Math.sin(angleRad);

              return (
                <Line
                  key={i}
                  x1={x1} y1={y1} x2={x2} y2={y2}
                  stroke="#fff"
                  strokeWidth={width}
                  opacity={opacity}
                />
              );
            })}

            {/* Cardinal directions - E, S, W only (N will be rendered on top later) */}
            <SvgText x={compassSize - 55} y={radius + 7} textAnchor="middle" fill="#fff" fontSize="18">E</SvgText>
            <SvgText x={radius} y={compassSize - 40} textAnchor="middle" fill="#fff" fontSize="18">S</SvgText>
            <SvgText x={55} y={radius + 7} textAnchor="middle" fill="#fff" fontSize="18">W</SvgText>
          </G>

          {/* Modern semi-transparent gray arrow pointing up (shows device orientation) */}
          <G opacity="0.6">
            <Polygon
              points={`${radius},${25} ${radius-6},${42} ${radius+6},${42}`}
              fill="#9CA3AF"
              stroke="#6B7280"
              strokeWidth="0.5"
            />
            <Line 
              x1={radius} y1={42} 
              x2={radius} y2={compassSize - 65} 
              stroke="#9CA3AF" 
              strokeWidth="2.5" 
              strokeLinecap="round"
              opacity="0.8"
            />
          </G>

          {/* Modern red arrow pointing toward north (rotates with compass) */}
          <G transform={`rotate(${rotRef.current} ${radius} ${radius})`}>
            <Polygon
              points={`${radius},${25} ${radius-8},${45} ${radius+8},${45}`}
              fill="#EF4444"
              stroke="#DC2626"
              strokeWidth="1"
            />
            <Line 
              x1={radius} y1={45} 
              x2={radius} y2={radius + 35} 
              stroke="#EF4444" 
              strokeWidth="3.5" 
              strokeLinecap="round" 
            />
            {/* Modern arrow tip glow effect */}
            <Polygon
              points={`${radius},${25} ${radius-8},${45} ${radius+8},${45}`}
              fill="#FCA5A5"
              opacity="0.3"
            />
            
            {/* N label attached to red arrow - rotates with it */}
            <SvgText x={radius} y={70} textAnchor="middle" fill="#000" fontSize="20" fontWeight="bold" stroke="#000" strokeWidth="3">N</SvgText>
            <SvgText x={radius} y={70} textAnchor="middle" fill="#EF4444" fontSize="20" fontWeight="bold">N</SvgText>
          </G>

          {/* Modern center pin with depth */}
          <Circle cx={radius} cy={radius} r="12" fill="#F8FAFC" stroke="#334155" strokeWidth="1.5" />
          <Circle cx={radius} cy={radius} r="6" fill="#64748B" />
          <Circle cx={radius} cy={radius} r="3" fill="#F1F5F9" opacity="0.8" />
        </Svg>
      </View>

      {/* Readout */}
      <View style={styles.readout}>
        <Text style={styles.deg}>{heading.toFixed(1)}°</Text>
        <Text style={styles.dir}>{dirTxt(heading)}</Text>
      </View>

      {/* Settings */}
      <View style={styles.settings}>
        <Text style={styles.settingLabel}>Direction Sound Frequency</Text>
        <TouchableOpacity style={styles.freqBtn} onPress={cycle}>
          <Text style={styles.freqTxt}>{freqTxt()}</Text>
          <Text style={styles.hint}>tap to change</Text>
        </TouchableOpacity>
      </View>

      {/* Status */}
      <Text style={styles.status}>{status}</Text>
    </LinearGradient>
  );
}

////////////////////////////////////////////////////////////////////////////////
// 4. STYLES ////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  header: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 60,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
  },
  compassWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
    position: 'relative',
  },
  pulse: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: '#EF4444',
    opacity: 0.4,
    backgroundColor: 'transparent',
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
  },
  readout: {
    alignItems: 'center',
    marginVertical: 20,
  },
  deg: {
    fontSize: 48,
    color: '#fff',
    fontWeight: 'bold',
    textShadowColor: 'rgba(0,126,255,0.5)',
    textShadowRadius: 10,
  },
  dir: {
    fontSize: 24,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 8,
  },
  settings: {
    width: '90%',
    padding: 15,
    backgroundColor: 'rgba(30,45,70,0.5)',
    borderRadius: 8,
    alignItems: 'center',
  },
  settingLabel: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 10,
  },
  freqBtn: {
    backgroundColor: 'rgba(20,30,50,0.8)',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    marginBottom: 10,
  },
  freqTxt: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  hint: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
    marginTop: 2,
  },
  status: {
    position: 'absolute',
    bottom: 40,
    width: '90%',
    textAlign: 'center',
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
  },
});
