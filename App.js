import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Switch,
  Alert,
  AppState,
  Dimensions
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Audio } from 'expo-av';
import { Magnetometer } from 'expo-sensors';
import * as ScreenOrientation from 'expo-screen-orientation';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle, Line, Text as SvgText, G } from 'react-native-svg';

const { width, height } = Dimensions.get('window');

export default function App() {
  // State management
  const [heading, setHeading] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [frequency, setFrequency] = useState(1000);
  const [isFacingNorth, setIsFacingNorth] = useState(false);
  const [lastDirectionSound, setLastDirectionSound] = useState(0);
  
  // Audio refs
  const northSound = useRef(null);
  const directionSound = useRef(null);
  const audioContext = useRef(null);
  
  // Compass rotation tracking
  const displayRotation = useRef(0);
  const previousHeading = useRef(0);
  
  // Magnetometer subscription
  const magnetometerSubscription = useRef(null);

  // Generate audio buffer for tones
  const generateToneBuffer = (frequency, duration, sampleRate = 44100) => {
    const samples = duration * sampleRate;
    const buffer = new Float32Array(samples);
    
    for (let i = 0; i < samples; i++) {
      const t = i / sampleRate;
      // Generate sine wave with fade in/out to prevent clicks
      const fadeLength = 0.01; // 10ms fade
      let amplitude = 1;
      
      if (t < fadeLength) {
        amplitude = t / fadeLength;
      } else if (t > duration - fadeLength) {
        amplitude = (duration - t) / fadeLength;
      }
      
      buffer[i] = amplitude * Math.sin(2 * Math.PI * frequency * t);
    }
    
    return buffer;
  };

  // Convert audio buffer to base64 data URI (WAV format)
  const audioBufferToWav = (buffer, sampleRate = 44100) => {
    const length = buffer.length;
    const arrayBuffer = new ArrayBuffer(44 + length * 2);
    const view = new DataView(arrayBuffer);
    
    // WAV header
    const writeString = (offset, string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };
    
    writeString(0, 'RIFF');
    view.setUint32(4, 36 + length * 2, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeString(36, 'data');
    view.setUint32(40, length * 2, true);
    
    // Convert float samples to 16-bit PCM
    let offset = 44;
    for (let i = 0; i < length; i++) {
      const sample = Math.max(-1, Math.min(1, buffer[i]));
      view.setInt16(offset, sample * 0x7FFF, true);
      offset += 2;
    }
    
    // Convert to base64
    const bytes = new Uint8Array(arrayBuffer);
    let binary = '';
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    
    return `data:audio/wav;base64,${btoa(binary)}`;
  };

  // Initialize audio system
  const initializeAudio = async () => {
    try {
      // Configure audio for background playback
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: true,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: false,
        playThroughEarpieceAndroid: false,
        interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_MIX_WITH_OTHERS,
        interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DUCK_OTHERS,
      });

      // Generate north notification sound (A5 - 880Hz for 300ms)
      const northBuffer = generateToneBuffer(880, 0.3);
      const northWav = audioBufferToWav(northBuffer);
      
      const { sound: northAudio } = await Audio.Sound.createAsync(
        { uri: northWav },
        { 
          shouldPlay: false,
          isLooping: false,
          volume: 0.3
        }
      );
      northSound.current = northAudio;

      // Generate direction sound (A4 - 440Hz for 200ms)
      const directionBuffer = generateToneBuffer(440, 0.2);
      const directionWav = audioBufferToWav(directionBuffer);
      
      const { sound: dirAudio } = await Audio.Sound.createAsync(
        { uri: directionWav },
        { 
          shouldPlay: false,
          isLooping: false,
          volume: 0.2
        }
      );
      directionSound.current = dirAudio;

      console.log('Audio initialized with generated tones');
    } catch (error) {
      console.error('Failed to initialize audio:', error);
      Alert.alert('Audio Error', 'Failed to initialize audio system');
    }
  };

  // Start magnetometer
  const startMagnetometer = () => {
    if (magnetometerSubscription.current) {
      magnetometerSubscription.current.remove();
    }

    Magnetometer.setUpdateInterval(100); // 10Hz updates

    magnetometerSubscription.current = Magnetometer.addListener((data) => {
      const { x, y, z } = data;
      
      // Calculate heading from magnetometer data
      let calculatedHeading = Math.atan2(y, x) * (180 / Math.PI);
      calculatedHeading = (calculatedHeading + 360) % 360;
      
      updateCompass(calculatedHeading);
    });
  };

  // Stop magnetometer
  const stopMagnetometer = () => {
    if (magnetometerSubscription.current) {
      magnetometerSubscription.current.remove();
      magnetometerSubscription.current = null;
    }
  };

  // Update compass with smooth rotation
  const updateCompass = (newHeading) => {
    // Round to one decimal place
    newHeading = Math.round(newHeading * 10) / 10;
    
    // Calculate shortest rotation path
    let targetRotation = -newHeading;
    let diff = targetRotation - displayRotation.current;
    
    // Normalize difference to shortest path
    while (diff <= -180) diff += 360;
    while (diff > 180) diff -= 360;
    
    displayRotation.current += diff;
    
    // Update state
    setHeading(newHeading);
    
    // Check if facing north (within 5 degrees)
    const isWithinNorthRange = (newHeading <= 5 || newHeading >= 355);
    
    if (isWithinNorthRange) {
      if (!isFacingNorth) {
        setIsFacingNorth(true);
        playNorthSound();
      }
    } else {
      if (isFacingNorth) {
        setIsFacingNorth(false);
      }
      
      // Play directional sound based on frequency setting
      if (frequency > 0) {
        const now = Date.now();
        if (now - lastDirectionSound > frequency) {
          playDirectionSound(newHeading);
          setLastDirectionSound(now);
        }
      }
    }
    
    previousHeading.current = newHeading;
  };

  // Play north notification sound
  const playNorthSound = async () => {
    try {
      if (northSound.current) {
        await northSound.current.replayAsync();
      }
    } catch (error) {
      console.error('Error playing north sound:', error);
    }
  };

  // Play directional sound with stereo positioning
  const playDirectionSound = async (heading) => {
    try {
      if (directionSound.current) {
        // Calculate pan value (-1 to 1, where -1 is left, 1 is right)
        const panValue = -Math.sin(heading * Math.PI / 180);
        
        // Set pan position
        await directionSound.current.setPositionAsync(0);
        await directionSound.current.playAsync();
        
        // Note: React Native doesn't have built-in audio panning
        // You might need expo-audio or react-native-sound for advanced audio features
      }
    } catch (error) {
      console.error('Error playing direction sound:', error);
    }
  };

  // Get direction name
  const getDirectionName = (heading) => {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    const index = Math.round(heading / 45) % 8;
    return directions[index];
  };

  // Toggle compass on/off
  const toggleCompass = async () => {
    if (!isActive) {
      // Starting compass
      await initializeAudio();
      startMagnetometer();
      setIsActive(true);
    } else {
      // Stopping compass
      stopMagnetometer();
      setIsActive(false);
    }
  };

  // Handle app state changes
  useEffect(() => {
    const handleAppStateChange = (nextAppState) => {
      if (nextAppState === 'background' && isActive) {
        // App is going to background - keep magnetometer running for audio
        console.log('App backgrounded, maintaining compass functionality');
      } else if (nextAppState === 'active' && isActive) {
        // App is coming to foreground
        console.log('App foregrounded');
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription?.remove();
  }, [isActive]);

  // Lock screen orientation to portrait
  useEffect(() => {
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopMagnetometer();
      if (northSound.current) {
        northSound.current.unloadAsync();
      }
      if (directionSound.current) {
        directionSound.current.unloadAsync();
      }
    };
  }, []);

  // Render compass SVG
  const renderCompass = () => {
    const compassSize = 200;
    const center = compassSize / 2;
    
    return (
      <Svg width={compassSize} height={compassSize} style={styles.compass}>
        {/* Compass background circle */}
        <Circle
          cx={center}
          cy={center}
          r={center - 10}
          fill="none"
          stroke="#ffffff"
          strokeWidth="2"
          opacity="0.3"
        />
        
        {/* Degree marks */}
        {Array.from({ length: 36 }, (_, i) => {
          const angle = i * 10;
          const isMainDirection = angle % 90 === 0;
          const isSubDirection = angle % 30 === 0;
          const length = isMainDirection ? 15 : isSubDirection ? 10 : 5;
          const strokeWidth = isMainDirection ? 2 : 1;
          
          const x1 = center + (center - 20) * Math.cos((angle - 90) * Math.PI / 180);
          const y1 = center + (center - 20) * Math.sin((angle - 90) * Math.PI / 180);
          const x2 = center + (center - 20 - length) * Math.cos((angle - 90) * Math.PI / 180);
          const y2 = center + (center - 20 - length) * Math.sin((angle - 90) * Math.PI / 180);
          
          return (
            <Line
              key={i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="#ffffff"
              strokeWidth={strokeWidth}
              opacity="0.6"
            />
          );
        })}
        
        {/* Cardinal direction labels */}
        <SvgText x={center} y={25} textAnchor="middle" fill="#ff5252" fontSize="18" fontWeight="bold">N</SvgText>
        <SvgText x={compassSize - 15} y={center + 5} textAnchor="middle" fill="#ffffff" fontSize="16">E</SvgText>
        <SvgText x={center} y={compassSize - 10} textAnchor="middle" fill="#ffffff" fontSize="16">S</SvgText>
        <SvgText x={15} y={center + 5} textAnchor="middle" fill="#ffffff" fontSize="16">W</SvgText>
        
        {/* Compass needle */}
        <G transform={`rotate(${displayRotation.current} ${center} ${center})`}>
          <Line
            x1={center}
            y1={center}
            x2={center}
            y2={30}
            stroke="#ff5252"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <Line
            x1={center}
            y1={center}
            x2={center}
            y2={compassSize - 30}
            stroke="#cccccc"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </G>
        
        {/* Center pin */}
        <Circle cx={center} cy={center} r="8" fill="#ffffff" />
        <Circle cx={center} cy={center} r="4" fill="#333333" />
      </Svg>
    );
  };

  return (
    <LinearGradient colors={['#0f1a2b', '#253b56']} style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Background Compass</Text>
        <Switch
          value={isActive}
          onValueChange={toggleCompass}
          trackColor={{ false: '#767577', true: '#81b0ff' }}
          thumbColor={isActive ? '#f5dd4b' : '#f4f3f4'}
        />
      </View>

      <View style={styles.compassContainer}>
        {renderCompass()}
        
        {isFacingNorth && (
          <View style={[styles.pulse, { opacity: 0.7 }]} />
        )}
      </View>

      <View style={styles.display}>
        <Text style={styles.degrees}>{heading.toFixed(1)}°</Text>
        <Text style={styles.direction}>{getDirectionName(heading)}</Text>
      </View>

      <View style={styles.settings}>
        <Text style={styles.settingLabel}>Sound Frequency:</Text>
        <Picker
          selectedValue={frequency}
          style={styles.picker}
          onValueChange={(itemValue) => setFrequency(itemValue)}
        >
          <Picker.Item label="Off" value={0} />
          <Picker.Item label="0.5s" value={500} />
          <Picker.Item label="1s" value={1000} />
          <Picker.Item label="2s" value={2000} />
          <Picker.Item label="5s" value={5000} />
          <Picker.Item label="10s" value={10000} />
          <Picker.Item label="20s" value={20000} />
          <Picker.Item label="30s" value={30000} />
          <Picker.Item label="60s" value={60000} />
        </Picker>
      </View>

      <View style={styles.status}>
        <Text style={styles.statusText}>
          {isActive ? 'Compass active - background audio enabled' : 'Tap switch to start compass'}
        </Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 50,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '90%',
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  compassContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 30,
    position: 'relative',
  },
  compass: {
    backgroundColor: 'transparent',
  },
  pulse: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    borderWidth: 2,
    borderColor: '#ff5252',
    backgroundColor: 'transparent',
  },
  display: {
    alignItems: 'center',
    marginVertical: 20,
  },
  degrees: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#ffffff',
    textShadowColor: 'rgba(0, 126, 255, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  direction: {
    fontSize: 24,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 10,
  },
  settings: {
    backgroundColor: 'rgba(30, 45, 70, 0.5)',
    borderRadius: 8,
    padding: 15,
    width: '90%',
    marginVertical: 20,
  },
  settingLabel: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 16,
    marginBottom: 10,
  },
  picker: {
    color: '#ffffff',
    backgroundColor: 'rgba(20, 30, 50, 0.8)',
    borderRadius: 4,
  },
  status: {
    position: 'absolute',
    bottom: 30,
    width: '90%',
    alignItems: 'center',
  },
  statusText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
    textAlign: 'center',
  },
});
