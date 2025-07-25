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
import BackgroundHaptics from "background-haptics";

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

////////////////////////////////////////////////////////////////////////////////
// 0. ADAPTIVE UI SCALING UTILITIES ///////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

// Design reference screen dimensions (iPhone 13 Pro Max)
const DESIGN_WIDTH = 428;
const DESIGN_HEIGHT = 926;

// Scaling functions
const scale = (size) => (screenWidth / DESIGN_WIDTH) * size;
const verticalScale = (size) => (screenHeight / DESIGN_HEIGHT) * size;
const fontScale = (size, factor = 0.5) => size + (scale(size) - size) * factor;

// Small screen detection for adaptive UI changes
const IS_SMALL_SCREEN = screenHeight < 750;

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
  const [freq, setFreq] = useState(0); // Start with Off
  const [north, setNorth] = useState(false);
  const [lastDir, setLastDir] = useState(0);
  const [status, setStatus] = useState('Initializing...');
  const [showDropdown, setShowDropdown] = useState(false);
  const [questionSoundEnabled, setQuestionSoundEnabled] = useState(false);
  const [calibrationOffset, setCalibrationOffset] = useState(0);
  const [calibrating, setCalibrating] = useState(false);
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
  const scrollRef = useRef(null);
  const questionTimeoutRef = useRef(null);
  const rawHeadingRef = useRef(0);
  const calibrationOffsetRef = useRef(0);
  const calibrationStartRef = useRef(0);
  const calibrationTimeoutRef = useRef(null);
  const vibrationModeRef = useRef(false);
  const isBackground = useRef(false);

  const triggerVibration = async () => {
    try {
      if (isBackground.current) {
        await BackgroundHaptics.impact('heavy');
      } else {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
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

      // Create silent sound for background activity
      const silentURI = await writeWav('silent.wav', sineBuffer(0, 0.1));
      dirSounds.current.silent = (await Audio.Sound.createAsync(
        { uri: silentURI }, 
        { shouldPlay: false, volume: 0.01, isLooping: true }
      )).sound;
      

      // Create north sound (celebratory tone)
      const northURI = await writeWav('north.wav', sineBuffer(880, 0.3));
      northSound.current = (await Audio.Sound.createAsync(
        { uri: northURI }, 
        { shouldPlay: false, volume: 0.8 }
      )).sound;

      // Create question sound (neutral tone, centered)
      const questionURI = await writeWav('question.wav', sineBuffer(660, 0.2, 0));
      questionSound.current = (await Audio.Sound.createAsync(
        { uri: questionURI }, 
        { shouldPlay: false, volume: 0.5 }
      )).sound;

      // Create directional sounds with MANY pan values for extremely precise directionality
      const panValues = [];
      for (let i = 0; i <= 120; i++) {
        panValues.push(-1.0 + (i * (2 / 120)));
      }
      
      for (let i = 0; i < panValues.length; i++) {
        const panValue = panValues[i];
        const dirURI = await writeWav(`dir_${i}.wav`, sineBuffer(440, 0.25, panValue));
        dirSounds.current[i] = (await Audio.Sound.createAsync(
          { uri: dirURI }, 
          { shouldPlay: false, volume: 0.5 }
        )).sound;
      }

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
        await startSilentSound();
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
      // Get current heading at time of playing directional sound
      const hdg = currentHeading.current;
      const panValue = Math.sin(hdg * Math.PI / 180);
      const correctedPan = -panValue;
      
      // Map pan value (-1 to 1) to sound index (0 to 120) for 121 different positions
      const index = Math.round((correctedPan + 1) * 60);
      const soundIndex = Math.max(0, Math.min(120, index));
      
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
        const status = await silentSound.getStatusAsync();
        if (!status.isPlaying) {
          await silentSound.setPositionAsync(0);
          await silentSound.playAsync();
        }
      }
    } catch (error) {
      console.error('Silent sound error:', error);
    }
  };

  const stopSilentSound = async () => {
    try {
      const silentSound = dirSounds.current.silent;
      if (silentSound) {
        const status = await silentSound.getStatusAsync();
        if (status.isLoaded && status.isPlaying) {
          await silentSound.stopAsync();
        } else if (status.isLoaded) {
          await silentSound.setPositionAsync(0);
        }
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
      if (!vibrationModeRef.current) {
        // Keep silent audio running in vibration mode so the app stays active
        stopSilentSound();
      }
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
    Haptics.selectionAsync();
    
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
    Haptics.selectionAsync();
  };
  
  const startCalibration = () => {
    if (calibrating) return;
    setCalibrating(true);
    setStatus('Put the phone in your pocket now...');
    Haptics.selectionAsync();
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
      setStatus('Offset added!');
    }, 5000);
  };

  const scrollToAdvanced = () => {
    scrollRef.current?.scrollTo({ y: screenHeight, animated: true });
    Haptics.selectionAsync();
  };

  const scrollToTop = () => {
    scrollRef.current?.scrollTo({ y: 0, animated: true });
    Haptics.selectionAsync();
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
  const advancedButtonText = IS_SMALL_SCREEN ? 'More ▼' : 'Advanced ▼';
  const advancedTitleText = IS_SMALL_SCREEN ? 'More' : 'Advanced';
  
  // --- HYBRID SIZING LOGIC ---
  let compassSize;

  // 1. Define the ideal compass size for large screens.
  const idealCompassSize = Math.min(screenWidth * 0.9, 300);

  // 2. Calculate the total height required by all non-compass elements.
  const pageVerticalPadding = verticalScale(20) * 2;
  const headerHeight = styles.header.marginTop + styles.header.marginBottom + styles.header.minHeight;
  const readoutHeight = styles.readout.marginVertical * 2 + fontScale(48) + fontScale(24) + styles.dir.marginTop;
  const gridContainerHeight = styles.gridContainer.marginTop + styles.gridItem.marginBottom + (styles.gridItem.paddingVertical * 2) + fontScale(14) + fontScale(16) + styles.gridValue.marginTop;
  const gridInfoHeight = !IS_SMALL_SCREEN ? (styles.gridInfo.marginTop + (fontScale(12) * 1.4 * 7)) : 0;
  const advancedToggleHeight = styles.advancedToggle.marginTop + (styles.advancedToggle.paddingVertical * 2) + fontScale(16);
  const footerSpacerHeight = styles.footerSpacer.height;
  const compassMargin = styles.compassWrap.marginVertical * 2;

  const nonCompassSpace = pageVerticalPadding + headerHeight + readoutHeight + gridContainerHeight + gridInfoHeight + advancedToggleHeight + footerSpacerHeight + compassMargin + 0.6;
  
  // 3. Check if the ideal layout would overflow the screen.
  const requiredTotalHeight = nonCompassSpace + idealCompassSize;

  if (requiredTotalHeight > screenHeight) {
    // Fallback for small screens: calculate a size that fits.
    const availableHeight = screenHeight - nonCompassSpace;
    compassSize = Math.max(220, Math.min(availableHeight, screenWidth * 0.9));
  } else {
    // Default for large screens: use the ideal size.
    compassSize = idealCompassSize;
  }
  // --- END OF SIZING LOGIC ---

  const radius = compassSize / 2;
  const cscale = (val) => val * (compassSize / 300); // Scale SVG elements relative to max size

  return (
    <LinearGradient colors={['#0f1a2b', '#253b56']} style={styles.container}>
      <ScrollView
        ref={scrollRef}
        pagingEnabled
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.page, { height: screenHeight }]}>
      {/* Header */}
      <View style={styles.header}>
        {!IS_SMALL_SCREEN && <Text style={styles.title}>Sonic Compass</Text>}
      </View>

      {/* Compass */}
      <View style={[styles.compassWrap, { width: compassSize, height: compassSize }]}>
        <View 
          ref={pulseRef}
          style={[styles.pulse, { 
            width: compassSize + scale(20), 
            height: compassSize + scale(20),
            borderRadius: (compassSize + scale(20)) / 2,
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
              r={radius - cscale(5)} 
              fill="url(#compassGrad)" 
              stroke="rgba(59, 130, 246, 0.3)" 
              strokeWidth={cscale(1.5)} 
            />
            
            <Circle 
              cx={radius} 
              cy={radius} 
              r={radius - cscale(25)} 
              fill="url(#innerGrad)" 
              stroke="rgba(148, 163, 184, 0.2)" 
              strokeWidth={cscale(1)} 
            />

            {Array.from({ length: 72 }, (_, i) => {
              const angle = i * 5;
              const isMajor = angle % 90 === 0;
              const isMinor = angle % 30 === 0;
              const isSmall = angle % 10 === 0;
              
              const length = isMajor ? cscale(20) : isMinor ? cscale(15) : isSmall ? cscale(10) : cscale(6);
              const width = isMajor ? cscale(3) : isMinor ? cscale(2) : 1;
              const opacity = isMajor ? 1 : isMinor ? 0.8 : isSmall ? 0.6 : 0.4;
              
              const outerRadius = radius - cscale(15);
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

            <SvgText x={compassSize - cscale(55)} y={radius + cscale(7)} textAnchor="middle" fill="#fff" fontSize={cscale(18)}>E</SvgText>
            <SvgText x={radius} y={compassSize - cscale(40)} textAnchor="middle" fill="#fff" fontSize={cscale(18)}>S</SvgText>
            <SvgText x={cscale(55)} y={radius + cscale(7)} textAnchor="middle" fill="#fff" fontSize={cscale(18)}>W</SvgText>
          </G>

          <G opacity="0.6">
            <Polygon
              points={`${radius},${cscale(25)} ${radius-cscale(6)},${cscale(42)} ${radius+cscale(6)},${cscale(42)}`}
              fill="#9CA3AF"
              stroke="#6B7280"
              strokeWidth="0.5"
            />
            <Line 
              x1={radius} y1={cscale(42)} 
              x2={radius} y2={compassSize - cscale(65)} 
              stroke="#9CA3AF" 
              strokeWidth={cscale(2.5)} 
              strokeLinecap="round"
              opacity="0.8"
            />
          </G>

          <G transform={`rotate(${rotRef.current} ${radius} ${radius})`}>
            <Polygon
              points={`${radius},${cscale(25)} ${radius-cscale(8)},${cscale(45)} ${radius+cscale(8)},${cscale(45)}`}
              fill="#EF4444"
              stroke="#DC2626"
              strokeWidth="1"
            />
            <Line 
              x1={radius} y1={cscale(45)} 
              x2={radius} y2={radius + cscale(35)} 
              stroke="#EF4444" 
              strokeWidth={cscale(3.5)}
              strokeLinecap="round" 
            />
            <Polygon
              points={`${radius},${cscale(25)} ${radius-cscale(8)},${cscale(45)} ${radius+cscale(8)},${cscale(45)}`}
              fill="#FCA5A5"
              opacity="0.3"
            />
            
            <SvgText x={radius} y={cscale(70)} textAnchor="middle" fill="#000" fontSize={cscale(20)} fontWeight="bold" stroke="#000" strokeWidth={cscale(3)}>N</SvgText>
            <SvgText x={radius} y={cscale(70)} textAnchor="middle" fill="#EF4444" fontSize={cscale(20)} fontWeight="bold">N</SvgText>
          </G>

          <Circle cx={radius} cy={radius} r={cscale(12)} fill="#F8FAFC" stroke="#334155" strokeWidth={cscale(1.5)} />
          <Circle cx={radius} cy={radius} r={cscale(6)} fill="#64748B" />
          <Circle cx={radius} cy={radius} r={cscale(3)} fill="#F1F5F9" opacity="0.8" />
        </Svg>
      </View>

      {/* Readout */}
      <View style={styles.readout}>
        <Text style={styles.deg}>{heading.toFixed(1)}°</Text>
        <Text style={styles.dir}>{dirTxt(heading)}</Text>
      </View>

      {/* Quick Settings Grid */}
      <View style={styles.gridContainer}>
        <TouchableOpacity
          style={[styles.gridItem, freq > 0 && styles.gridItemActive]}
          onPress={() => {
            setShowDropdown(true);
            Haptics.selectionAsync();
          }}
        >
          <Text style={styles.gridLabel}>Frequency</Text>
          <Text style={styles.gridValue}>{freqTxt()}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.gridItem, questionSoundEnabled && styles.gridItemActive, freq === 0 && styles.gridItemDisabled]}
          onPress={() => {
            if (freq === 0) return;
            setQuestionSoundEnabled(!questionSoundEnabled);
            Haptics.selectionAsync();
          }}
        >
          <Text style={styles.gridLabel}>Learning</Text>
          <Text style={styles.gridValue}>{questionSoundEnabled ? 'On' : 'Off'}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.gridItem, vibrationMode && styles.gridItemActive]}
          onPress={() => {
            setVibrationMode(!vibrationMode);
            Haptics.selectionAsync();
          }}
        >
          <Text style={styles.gridLabel}>Vibration</Text>
          <Text style={styles.gridValue}>{vibrationMode ? 'On' : 'Off'}</Text>
        </TouchableOpacity>
      </View>
      
      {!IS_SMALL_SCREEN && (
        <View style={styles.gridInfo}>
          <Text style={styles.gridInfoText}>Set the <Text style={styles.gridInfoTitle}>Frequency</Text> of directional North sounds.</Text>
          <Text style={styles.gridInfoText}>Start small. Requires 🎧.</Text>
          <Text style={styles.gridInfoText}></Text>
          <Text style={styles.gridInfoText}>The <Text style={styles.gridInfoTitle}>Learning</Text> mode plays a cue 1s before every North sound.</Text>
          <Text style={styles.gridInfoText}>When you hear it, quickly guess where's North.</Text>
          <Text style={styles.gridInfoText}></Text>
          <Text style={styles.gridInfoText}>Replace sounds with <Text style={styles.gridInfoTitle}>Vibration</Text> when your phone is pointing North.</Text>
        </View>
      )}

      <TouchableOpacity style={styles.advancedToggle} onPress={scrollToAdvanced}>
        <Text style={styles.advancedToggleText}>{advancedButtonText}</Text>
      </TouchableOpacity>
      
      <View style={styles.footerSpacer} />

      <Text style={styles.status}>{status}</Text>
    </View>



    <View style={[styles.page, { height: screenHeight }]}>
      <View style={styles.advancedContainer}>
      {!IS_SMALL_SCREEN && (<Text style={styles.advancedTitle}>{advancedTitleText}</Text>)}
        
        {IS_SMALL_SCREEN && (
          <View style={styles.settingBox}>
            <View style={{width: '100%', paddingTop: verticalScale(5)}}>
                <Text style={styles.settingDescription}>
                  Set the <Text style={styles.settingDescriptionWhite}>Frequency</Text> of directional sounds. Start small. Requires 🎧.
                </Text>
                <Text style={styles.settingDescription}>
                  The <Text style={styles.settingDescriptionWhite}>Learning</Text> mode plays a cue before the sound, helping you anticipate the direction.
                </Text>
                <Text style={styles.settingDescription}>
                  Use <Text style={styles.settingDescriptionWhite}>Vibration</Text> mode for silent, tactile feedback when you face North.
                </Text>
            </View>
          </View>
        )}

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

        <View style={styles.settingBox}>
          <Text style={styles.settingLabel}>Add Offset</Text>
          <View style={styles.switchRow}>
            <View>
              <Text style={styles.settingDescription}>
                Use this if you want to keep the phone at a constant angle: for example, in a pocket.
              </Text>
              <Text style={styles.settingDescription}>
                Hold the phone in front of you, <Text style={styles.settingDescriptionWhite}>facing exactly forward</Text>; press Add Offset; you'll then have 5s to put the phone where you'll keep it. Don't rotate your body while doing that.
              </Text>
              {calibrationOffset > 0 && !calibrating && (
                <Text></Text> && 
                <Text style={styles.settingDescriptionBold}>
                  Offset: {calibrationOffset.toFixed(1)}°
                </Text>
              )}
              {calibrating && (
                <Text style={styles.settingDescriptionBold}>
                  Place the phone where you'll keep it, then don't move for 5s.
                </Text>
              )}
            </View>
          </View>
          <TouchableOpacity
            style={[styles.calibrateButton, calibrating && styles.calibrateButtonDisabled]}
            onPress={() => {
              startCalibration();
            }}
            disabled={calibrating}
          >
            <Text style={styles.calibrateButtonText}>
              {calibrating ? 'Put the phone in a pocket...' : 'Add Offset'}
            </Text>
          </TouchableOpacity>
          {!calibrating && calibrationOffset !== 0 && (
            <TouchableOpacity
              style={[styles.calibrateButton, styles.resetButton]}
              onPress={() => {
                resetCalibration();
              }}
              disabled={calibrationOffset === 0}
            >
              <Text style={styles.calibrateButtonText}>Reset Offset</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <TouchableOpacity style={styles.advancedToggle} onPress={scrollToTop}>
        <Text style={styles.advancedToggleText}>▲ Back</Text>
      </TouchableOpacity>
    </View>

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
      </ScrollView>
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
    paddingHorizontal: scale(20),
  },
  page: {
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingVertical: verticalScale(20),
  },
  header: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: IS_SMALL_SCREEN ? verticalScale(30) : verticalScale(60),
    marginBottom: verticalScale(20),
    minHeight: IS_SMALL_SCREEN ? 0 : fontScale(24) * 1.2, // Reserve space to prevent jump
  },
  title: {
    fontSize: fontScale(24),
    color: '#fff',
    fontWeight: 'bold',
  },
  compassWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: verticalScale(20),
    position: 'relative',
  },
  pulse: {
    position: 'absolute',
    borderWidth: scale(2),
    borderColor: '#EF4444',
    opacity: 0.4,
    backgroundColor: 'transparent',
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: scale(8),
  },
  readout: {
    alignItems: 'center',
    marginVertical: verticalScale(20),
  },
  deg: {
    fontSize: fontScale(48),
    color: '#fff',
    fontWeight: 'bold',
    textShadowColor: 'rgba(0,126,255,0.5)',
    textShadowRadius: scale(10),
  },
  dir: {
    fontSize: fontScale(24),
    color: 'rgba(255,255,255,0.8)',
    marginTop: verticalScale(8),
  },
  gridContainer: {
    width: '90%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: verticalScale(10),
  },
  gridItem: {
    width: '32%',
    marginBottom: verticalScale(10),
    paddingVertical: verticalScale(12),
    backgroundColor: 'rgba(30,45,70,0.5)',
    borderRadius: scale(8),
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.3)',
    alignItems: 'center',
  },
  gridItemActive: {
    borderColor: '#22c55e',
  },
  gridItemDisabled: {
    opacity: 0.5,
  },
  gridLabel: {
    color: '#fff',
    fontSize: fontScale(14),
  },
  gridValue: {
    color: '#fff',
    fontSize: fontScale(16),
    fontWeight: '600',
    marginTop: verticalScale(4),
  },
  gridInfo: {
    width: '100%',
    paddingHorizontal: scale(5),
    marginTop: verticalScale(4),
  },
  gridInfoText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: fontScale(12),
    textAlign: 'center',
    lineHeight: fontScale(12) * 1.4,
  },
  gridInfoTitle: {
    color: 'rgba(255,255,255,1)',
    fontWeight: 'bold',
  },
  advancedToggle: {
    marginTop: verticalScale(16),
    paddingVertical: verticalScale(8),
    width: '90%',
    alignItems: 'center',
  },
  advancedToggleText: {
    color: '#fff',
    fontSize: fontScale(16),
  },
  advancedContainer: {
    width: '90%',
    gap: verticalScale(12),
    marginTop: verticalScale(20),
  },
  advancedTitle: {
    color: '#fff',
    fontSize: fontScale(18),
    fontWeight: '600',
    marginBottom: verticalScale(6),
    marginTop: verticalScale(30),
    textAlign: 'center',
  },
  settingBox: {
    width: '100%',
    padding: scale(15),
    backgroundColor: 'rgba(30,45,70,0.5)',
    borderRadius: scale(8),
    alignItems: 'center',
  },
  settingLabel: {
    color: '#fff',
    fontSize: fontScale(16),
    marginBottom: verticalScale(4),
    alignSelf: 'flex-start',
    fontWeight: '600'
  },
  switchRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingDescription: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: fontScale(13.5),
    marginTop: verticalScale(4),
    lineHeight: fontScale(13.5) * 1.4,
  },
  settingDescriptionWhite: {
    color: 'rgba(255,255,255,1)',
    fontWeight: 'bold',
  },
  settingDescriptionBold: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: fontScale(13),
    marginTop: verticalScale(8),
    fontWeight: 'bold',
  },
  calibrateButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: verticalScale(10),
    paddingHorizontal: scale(20),
    borderRadius: scale(8),
    marginTop: verticalScale(12),
  },
  calibrateButtonDisabled: {
    backgroundColor: '#475569',
  },
  calibrateButtonText: {
    color: '#fff',
    fontSize: fontScale(16),
    fontWeight: '600',
  },
  resetButton: {
    backgroundColor: '#475569',
    marginTop: verticalScale(6),
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: scale(20),
  },
  modalContent: {
    width: '90%',
    maxWidth: scale(320),
  },
  dropdownMenu: {
    backgroundColor: 'rgba(15,23,42,0.98)',
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.3)',
    borderRadius: scale(8),
    maxHeight: screenHeight * 0.5,
  },
  dropdownItem: {
    paddingVertical: verticalScale(14),
    paddingHorizontal: scale(16),
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
    fontSize: fontScale(16),
  },
  dropdownItemTextSelected: {
    color: '#3B82F6',
    fontWeight: '600',
  },
  checkmark: {
    color: '#3B82F6',
    fontSize: fontScale(16),
    fontWeight: 'bold',
  },
  status: {
    position: 'absolute',
    bottom: verticalScale(25),
    width: '100%',
    textAlign: 'center',
    color: 'rgba(255,255,255,0.7)',
    fontSize: fontScale(14),
  },
  footerSpacer: {
    height: verticalScale(40) + fontScale(14) + verticalScale(15),
  },
});
