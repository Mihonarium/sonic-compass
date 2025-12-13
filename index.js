import { registerRootComponent } from 'expo';
import TrackPlayer from 'react-native-track-player';
import App from './App';

// Register the playback service for react-native-track-player
TrackPlayer.registerPlaybackService(() => require('./playbackService'));

// Register the main app component
registerRootComponent(App);
