import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet, View, Text, TouchableOpacity,
  Alert, AppState, Dimensions, ScrollView, Switch, Modal,
  Vibration
} from 'react-native';
import { Audio, InterruptionModeIOS, InterruptionModeAndroid } from 'expo-av';
// import * as Battery from 'expo-battery';
import CompassHeading from 'react-native-compass-heading';
import * as Haptics from 'expo-haptics';
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
  //{ label: '0.5s', value: 500 },
  { label: '1s', value: 1000 },
  { label: '2s', value: 2000 },
  { label: '5s', value: 5000 },
  { label: '10s', value: 10000 },
  { label: '30s', value: 30000 },
  { label: '60s', value: 60000 },
  { label: '300s', value: 300000 }
];
const SAMPLE_RATE = 44100;
const QUESTION_SOUND_DELAY = 1000; // 1 second before directional sound

////////////////////////////////////////////////////////////////////////////////
// 2. AUDIO HELPERS /////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
// Generate a stereo buffer for a tone coming from an azimuth angle in degrees
// 0 degrees is directly in front, 90 right, 180 back, 270 left.
// This is a simplified 3D panning approach which adds interaural time
// difference and a basic front/back filter in addition to level panning.
const directionalBuffer = (freq, durSec, angleDeg = 0) => {
  const frames = Math.floor(durSec * SAMPLE_RATE);
  const base = new Float32Array(frames);
  const buf = new Float32Array(frames * 2); // stereo

  const rad = angleDeg * Math.PI / 180;
  const pan = Math.sin(rad); // left/right component
  const fb = Math.cos(rad);  // front/back component

  // Equal-power panning for ILD
  const leftGain = Math.cos((pan + 1) * Math.PI / 4);
  const rightGain = Math.sin((pan + 1) * Math.PI / 4);

  // Simple front/back attenuation (very rough approximation)
  const fbGain = fb >= 0 ? 1 : 0.7;

  // Interaural time difference - max around 0.6ms
  const ITD_MAX = 0.0006;
  const itd = ITD_MAX * Math.sin(rad);
  const delayL = itd > 0 ? itd : 0;
  const delayR = itd < 0 ? -itd : 0;
  const delayLFrames = Math.round(delayL * SAMPLE_RATE);
  const delayRFrames = Math.round(delayR * SAMPLE_RATE);

  // Precompute base tone (mono)
  for (let i = 0; i < frames; i++) {
    const t = i / SAMPLE_RATE;
    const fade = Math.min(1, t / 0.02, (durSec - t) / 0.02); // 20ms fade in/out
    base[i] = fbGain * fade * Math.sin(2 * Math.PI * freq * t) * 0.3;
  }

  for (let i = 0; i < frames; i++) {
    const idxL = i - delayLFrames;
    const idxR = i - delayRFrames;
    const leftSample = idxL >= 0 ? base[idxL] : 0;
    const rightSample = idxR >= 0 ? base[idxR] : 0;
    buf[i * 2] = leftSample * leftGain;
    buf[i * 2 + 1] = rightSample * rightGain;
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
  const [freq, setFreq] = useState(0); // Start with Off
  const [north, setNorth] = useState(false);
  const [lastDir, setLastDir] = useState(0);
  const [status, setStatus] = useState('Initializing...');
  const [showDropdown, setShowDropdown] = useState(false);
  const [questionSoundEnabled, setQuestionSoundEnabled] = useState(false);
  const [calibrationOffset, setCalibrationOffset] = useState(0);
  const [calibrating, setCalibrating] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [vibrationMode, setVibrationMode] = useState(false);
  //const [lowPower, setLowPower] = useState(false);

  // ----- REFS ----------------------------------------------------------------
  const rotRef = useRef(0);
  const northSound = useRef(null);
  const dirSounds = useRef({});
  const questionSound = useRef(null);
  const lastDirectionalSoundTime = useRef(0);
  const lastNorthSoundTime = useRef(0);
  const directionSoundInterval = useRef(null);
  const currentHeading = useRef(0);
  const northSoundPlaying = useRef(false);
  const pulseRef = useRef(null);
  const questionTimeoutRef = useRef(null);
  const rawHeadingRef = useRef(0);
  const calibrationOffsetRef = useRef(0);
  const calibrationStartRef = useRef(0);
  const calibrationTimeoutRef = useRef(null);
  const vibrationModeRef = useRef(false);
  const isBackground = useRef(false);

  const triggerVibration = async () => {
    try {
      if(isBackground.current) {
        Vibration.vibrate(200);
      } else {
        //const state = await Battery.getPowerStateAsync();
        //const low = state?.lowPowerMode;
        //if (low) {
        //  await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        //} else {
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        //}
      }
    } catch (err) {
      Vibration.vibrate(200);
    }
  };

  // ----- AUDIO FUNCTIONS -----------------------------------------------------
  const initAudio = async () => {
    try {
      setStatus('Initializing audio...');
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: true,
        playsInSilentModeIOS: true,
        interruptionModeIOS: InterruptionModeIOS.MixWithOthers,
        interruptionModeAndroid: InterruptionModeAndroid.DoNotMix,
        shouldDuckAndroid: false,
        playThroughEarpieceAndroid: false,
      });

      // Create north sound (celebratory tone)
      const northURI = await writeWav('north.wav', directionalBuffer(880, 0.3, 0));
      northSound.current = (await Audio.Sound.createAsync(
        { uri: northURI }, 
        { shouldPlay: false, volume: 0.8 }
      )).sound;

      // Create question sound (neutral tone, centered)
      const questionURI = await writeWav('question.wav', directionalBuffer(660, 0.2, 0));
      questionSound.current = (await Audio.Sound.createAsync(
        { uri: questionURI }, 
        { shouldPlay: false, volume: 0.5 }
      )).sound;

      // Create directional sounds for all 360 degrees
      for (let angle = 0; angle < 360; angle++) {
        const dirURI = await writeWav(`dir_${angle}.wav`, directionalBuffer(440, 0.25, angle));
        dirSounds.current[angle] = (
          await Audio.Sound.createAsync(
            { uri: dirURI },
            { shouldPlay: false, volume: 0.5 }
          )
        ).sound;
      }

      // Create silent sound for background activity
      const silentURI = await writeWav('silent.wav', directionalBuffer(0, 0.1, 0));
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
    lastNorthSoundTime.current = Date.now();
    try {
      if (vibrationModeRef.current) {
        await triggerVibration();
      } else if (!northSoundPlaying.current) {
        northSoundPlaying.current = true;
        setTimeout(() => {
          northSoundPlaying.current = false;
        }, 300);
        await northSound.current?.replayAsync();

      }
    } catch (error) {
      console.error('North sound error:', error);
      northSoundPlaying.current = false;
    }
  };

  const playQuestionSound = async () => {
    try {
      await questionSound.current?.replayAsync();
    } catch (error) {
      console.error('Question sound error:', error);
    }
  };

  const playDir = async () => {
    try {
      // Compute azimuth angle of north relative to current heading
      const hdg = currentHeading.current;
      const angle = ((360 - hdg) % 360);
      const soundIndex = Math.round(angle) % 360; // Use pre-generated sound for this azimuth

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
    
    // Clear any pending question sound timeout
    if (questionTimeoutRef.current) {
      clearTimeout(questionTimeoutRef.current);
      questionTimeoutRef.current = null;
    }
    
    // Only start timer if frequency is not Off (> 0)
    if (freq > 0) {
      // Play immediately on start
      const playDirectionalSequence = () => {
        const hdg = currentHeading.current;
        const northNow = hdg <= 5 || hdg >= 355;
        
        // Only play if not facing north or when vibration mode is on
        if (!northNow || vibrationModeRef.current) {
          if (questionSoundEnabled) {
            // Play question sound first
            playQuestionSound();
            
            // Schedule directional sound after delay
            questionTimeoutRef.current = setTimeout(() => {
              playDir(); // Will get current heading at time of playing
              lastDirectionalSoundTime.current = Date.now();
              setLastDir(Date.now());
            }, QUESTION_SOUND_DELAY);
          } else {
            // Play directional sound immediately
            playDir();
            lastDirectionalSoundTime.current = Date.now();
            setLastDir(Date.now());
          }
        }
      };
      
      // Play first sound immediately
      playDirectionalSequence();
      
      // Then set interval for subsequent sounds
      directionSoundInterval.current = setInterval(playDirectionalSequence, freq);
    }
  };

  const stopDirectionSoundTimer = () => {
    if (directionSoundInterval.current) {
      clearInterval(directionSoundInterval.current);
      directionSoundInterval.current = null;
    }
    if (questionTimeoutRef.current) {
      clearTimeout(questionTimeoutRef.current);
      questionTimeoutRef.current = null;
    }
  };

  // ----- COMPASS FUNCTIONS ---------------------------------------------------
  const updateCompass = (hdg) => {
    rawHeadingRef.current = hdg;
    const calibrated = (hdg - calibrationOffsetRef.current + 360) % 360;
    const roundedHeading = Math.round(calibrated * 10) / 10;
    currentHeading.current = roundedHeading;
    
    const target = -roundedHeading;
    let diff = target - rotRef.current;
    
    while (diff > 180) diff -= 360;
    while (diff < -180) diff += 360;
    
    rotRef.current += diff;
    setHeading(roundedHeading);

    const northNow = roundedHeading <= 5 || roundedHeading >= 355;
    
    if (northNow && !north) {
      setNorth(true);
      if (pulseRef.current) {
        pulseRef.current.setNativeProps({ style: { opacity: 0.4 } });
        setTimeout(() => {
          if (pulseRef.current) {
            pulseRef.current.setNativeProps({ style: { opacity: 0 } });
          }
        }, 1000);
      }
      stopSilentSound();
      playNorth();
    } else if (!northNow && north) {
      setNorth(false);
      if (pulseRef.current) {
        pulseRef.current.setNativeProps({ style: { opacity: 0 } });
      }
      
      //if (freq > 0) {
        startSilentSound();
      //}
    }

    //if (freq === 0) {
    //  stopSilentSound();
    //} else if (!northNow && freq > 0) {
    if (!northNow || vibrationModeRef.current) {
      const timeSinceLastSound = Date.now() - lastDirectionalSoundTime.current;
      const timeSinceLastNorthSound = Date.now() - lastNorthSoundTime.current;
      if (timeSinceLastSound > 1000 && timeSinceLastNorthSound > 1000) {
        startSilentSound();
      }
    }
    //}
  };

  const startCompass = async () => {
    try {
      setStatus('Starting compass...');
      
      CompassHeading.start(1, ({ heading, accuracy }) => {
        updateCompass(heading);
      });
      
      lastDirectionalSoundTime.current = 0;
      lastNorthSoundTime.current = 0;
      if (freq > 0) {
        startDirectionSoundTimer();
      }
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
      await startCompass();
      await initAudio();
      setStatus('Ready');
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
  
  const selectFrequency = (newFreq) => {
    setFreq(newFreq);
    setShowDropdown(false);
    
    // Stop everything first
    stopDirectionSoundTimer();
    stopSilentSound();
    
    // Restart with new frequency if not Off
    if (newFreq > 0) {
      startDirectionSoundTimer();
    }
  };


  const resetCalibration = () => {
    calibrationOffsetRef.current = 0;
    setCalibrationOffset(0);
    setStatus('Calibration reset');
  };
  
  const startCalibration = () => {
    if (calibrating) return;
    setCalibrating(true);
    setStatus('Put the phone in your pocket now...');
    calibrationStartRef.current = rawHeadingRef.current;
    if (calibrationTimeoutRef.current) {
      clearTimeout(calibrationTimeoutRef.current);
    }
    calibrationTimeoutRef.current = setTimeout(() => {
      const end = rawHeadingRef.current;
      let diff = end - calibrationStartRef.current;
      diff = (diff + 360) % 360;
      calibrationOffsetRef.current = diff;
      setCalibrationOffset(diff);
      setCalibrating(false);
      setStatus('Added offset!');
    }, 5000);
  };

  // ----- SIDE-EFFECTS --------------------------------------------------------
  useEffect(() => {
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
  }, []);

  useEffect(() => {
    initializeApp();
  }, []);

  // Keep ref in sync with latest vibration mode
  useEffect(() => {
    vibrationModeRef.current = vibrationMode;
  }, [vibrationMode]);

  useEffect(() => {
    return () => {
      stopCompass();
      stopDirectionSoundTimer();
      stopSilentSound();
      
      northSound.current?.unloadAsync();
      questionSound.current?.unloadAsync();
      Object.values(dirSounds.current).forEach(sound => sound?.unloadAsync());
      if (calibrationTimeoutRef.current) {
        clearTimeout(calibrationTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const sub = AppState.addEventListener('change', state => {
      isBackground.current = state !== 'active';
      if (state === 'background') {
        setStatus('Running in background');
      } else if (state === 'active') {
        setStatus('Ready');
      }
    });
    return () => sub?.remove();
  }, []);

  /*useEffect(() => {
    const check = async () => {
      try {
        const p = await Battery.getPowerStateAsync();
        setLowPower(p.lowPowerMode ?? false);
      } catch {}
    };
    check();
    const sub = Battery.addLowPowerModeListener(({ lowPowerMode }) => setLowPower(lowPowerMode));
    return () => sub.remove();
  }, []);*/

  // Restart timer when freq changes
  useEffect(() => {
    if (freq > 0) {
      startDirectionSoundTimer();
    }
  }, [freq, vibrationMode]);

  // Restart timer when questionSoundEnabled changes
  useEffect(() => {
    if (freq > 0) {
      startDirectionSoundTimer();
    }
  }, [questionSoundEnabled, vibrationMode]);

  // Stop sounds when vibration mode toggles on
  useEffect(() => {
    if (freq > 0) {
      startDirectionSoundTimer();
    }
  }, [vibrationMode]);

  // ----- RENDER --------------------------------------------------------------
  const compassSize = Math.min(screenWidth * 0.8, 300);
  const radius = compassSize / 2;

  return (
    <LinearGradient colors={['#0f1a2b', '#253b56']} style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Sonic Compass</Text>
      </View>

      {/* Compass */}
      <View style={[styles.compassWrap, { width: compassSize, height: compassSize }]}>
        <View 
          ref={pulseRef}
          style={[styles.pulse, { 
            width: compassSize + 20, 
            height: compassSize + 20,
            borderRadius: (compassSize + 20) / 2,
            opacity: 0
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

            <SvgText x={compassSize - 55} y={radius + 7} textAnchor="middle" fill="#fff" fontSize="18">E</SvgText>
            <SvgText x={radius} y={compassSize - 40} textAnchor="middle" fill="#fff" fontSize="18">S</SvgText>
            <SvgText x={55} y={radius + 7} textAnchor="middle" fill="#fff" fontSize="18">W</SvgText>
          </G>

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
            <Polygon
              points={`${radius},${25} ${radius-8},${45} ${radius+8},${45}`}
              fill="#FCA5A5"
              opacity="0.3"
            />
            
            <SvgText x={radius} y={70} textAnchor="middle" fill="#000" fontSize="20" fontWeight="bold" stroke="#000" strokeWidth="3">N</SvgText>
            <SvgText x={radius} y={70} textAnchor="middle" fill="#EF4444" fontSize="20" fontWeight="bold">N</SvgText>
          </G>

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
      <View style={styles.settingsContainer}>
        <View style={styles.settingBox}>
          <Text style={styles.settingLabel}>🎧 Direction Sound Frequency</Text>
          
          <TouchableOpacity 
            style={styles.dropdownButton} 
            onPress={() => setShowDropdown(!showDropdown)}
          >
            <Text style={styles.dropdownButtonText}>{freqTxt()}</Text>
            <Text style={styles.dropdownArrow}>{showDropdown ? '▲' : '▼'}</Text>
          </TouchableOpacity>
        </View>

        {/* Learning Mode Toggle */}
        <View style={styles.settingBox}>
          <View style={styles.switchRow}>
            <View>
              <Text style={styles.settingLabel}>Learning Mode</Text>
              <Text style={styles.settingDescription}>
                Plays a cue sound 1s before direction
              </Text>
            </View>
            <Switch
              value={questionSoundEnabled}
              onValueChange={setQuestionSoundEnabled}
              trackColor={{ false: '#475569', true: '#3B82F6' }}
              thumbColor={questionSoundEnabled ? '#fff' : '#f4f4f4'}
              disabled={freq === 0}
            />
          </View>
        </View>
        
        <TouchableOpacity
          style={styles.advancedButton}
          onPress={() => setShowAdvanced(true)}
        >
          <Text style={styles.advancedButtonText}>Advanced</Text>
        </TouchableOpacity>
      </View>

      {/* Status */}
      <Text style={styles.status}>{status}</Text>

      {/* Dropdown Modal */}
      <Modal
        visible={showDropdown}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowDropdown(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowDropdown(false)}
        >
          <View style={styles.modalContent}>
            <ScrollView style={styles.dropdownMenu} nestedScrollEnabled={true}>
              {FREQ_OPTS.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.dropdownItem,
                    freq === option.value && styles.dropdownItemSelected
                  ]}
                  onPress={() => selectFrequency(option.value)}
                >
                  <Text style={[
                    styles.dropdownItemText,
                    freq === option.value && styles.dropdownItemTextSelected
                  ]}>
                    {option.label}
                  </Text>
                  {freq === option.value && (
                    <Text style={styles.checkmark}>✓</Text>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
      <Modal
        visible={showAdvanced}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowAdvanced(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowAdvanced(false)}
        >
          

          {/* Vibration Mode Toggle */}
          <View style={styles.modalContent}>
            <View style={styles.settingBox}>
              <View style={styles.switchRow}>
                <View>
                  <Text style={styles.settingLabel}>Vibration Mode</Text>
                  <Text style={styles.settingDescription}>
                    Vibrate on North.
                  </Text>
                </View>
                <Switch
                  value={vibrationMode}
                  onValueChange={setVibrationMode}
                  trackColor={{ false: '#475569', true: '#3B82F6' }}
                  thumbColor={vibrationMode ? '#fff' : '#f4f4f4'}
                />
              </View>
            </View>
          </View>

          

          <View style={styles.modalContent}>
            <View style={styles.settingBox}>
              <Text style={styles.settingLabel}>Calibrate Compass</Text>
              <View style={styles.switchRow}>
                <View>
                  <Text style={styles.settingDescription}>
                    To improve the calibration of the compass, slowly rotate your phone along all three axis multiple times. 
                  </Text>
                </View>
              </View>
            </View>
          </View>

          
          {/* Offset Calibration */}
          <View style={styles.modalContent}>
            <View style={styles.settingBox}>
              <Text style={styles.settingLabel}>Add Offset</Text>
              <View style={styles.switchRow}>
                <View>
                    <Text style={styles.settingDescription}>
                      If you want to keep the phone in a pocket. Hold the phone in front of you, facing exactly forward; press Add Offset; then you'll have 5s to put the phone in a pocket.
                    </Text>
                  {calibrationOffset > 0 && !calibrating && (
                    <Text style={styles.settingDescriptionBold}>
                      Offset: {calibrationOffset.toFixed(1)}°
                    </Text>
                  )}
                  {(calibrating) && (
                    <Text style={styles.settingDescriptionBold}>
                      Place the phone where you'll keep it, then don't move for 5s.
                    </Text>
                  )}
                </View>
              </View>
              <TouchableOpacity
                style={[
                  styles.calibrateButton,
                  calibrating && styles.calibrateButtonDisabled,
                ]}
                onPress={startCalibration}
                disabled={calibrating}
              >
                <Text style={styles.calibrateButtonText}>
                  {calibrating ? 'Put the phone in a pocket...' : 'Add Offset'}
                </Text>
              </TouchableOpacity>
              {!calibrating && calibrationOffset !== 0 && <TouchableOpacity
                style={[
                  styles.calibrateButton,
                  styles.closeButton,
                ]}
                onPress={resetCalibration}
                disabled={calibrationOffset === 0}
              >
                <Text style={styles.calibrateButtonText}>
                  Reset Offset
                </Text>
              </TouchableOpacity> }
            </View>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowAdvanced(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
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
  settingsContainer: {
    width: '90%',
    gap: 12,
  },
  settingBox: {
    width: '100%',
    padding: 15,
    backgroundColor: 'rgba(30,45,70,0.5)',
    borderRadius: 8,
    alignItems: 'center',
  },
  switchRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingLabel: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 4,
  },
  settingDescription: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 13,
    marginTop: 2,
  },
  settingDescriptionBold: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 13,
    marginTop: 2,
    fontWeight: 'bold',
  },
  dropdownButton: {
    backgroundColor: 'rgba(248,250,252,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.3)',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: 200,
    marginTop: 10,
  },
  dropdownButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  dropdownArrow: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  modalContent: {
    width: '80%',
    maxWidth: 300,
  },
  dropdownMenu: {
    backgroundColor: 'rgba(15,23,42,0.98)',
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.3)',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 20,
    maxHeight: 300,
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(148,163,184,0.1)',
  },
  dropdownItemSelected: {
    backgroundColor: 'rgba(59,130,246,0.2)',
  },
  dropdownItemText: {
    color: '#fff',
    fontSize: 16,
  },
  dropdownItemTextSelected: {
    color: '#3B82F6',
    fontWeight: '600',
  },
  checkmark: {
    color: '#3B82F6',
    fontSize: 16,
    fontWeight: 'bold',
  },
  calibrateButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 6,
  },
  calibrateButtonDisabled: {
    backgroundColor: '#475569',
  },
  calibrateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  status: {
    position: 'absolute',
    bottom: 40,
    width: '90%',
    textAlign: 'center',
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
  },
  advancedButton: {
    backgroundColor: '#64748B',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 10,
    alignItems: 'center',
  },
  advancedButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  closeButton: {
    backgroundColor: '#475569',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 16,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
