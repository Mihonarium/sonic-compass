import TrackPlayer, { Event } from 'react-native-track-player';

// This service is registered with TrackPlayer to handle background events
module.exports = async function() {
  TrackPlayer.addEventListener(Event.RemotePlay, () => TrackPlayer.play());
  TrackPlayer.addEventListener(Event.RemotePause, () => TrackPlayer.pause());
  TrackPlayer.addEventListener(Event.RemoteStop, () => TrackPlayer.stop());

  // Handle playback completion - loop the silent track
  TrackPlayer.addEventListener(Event.PlaybackQueueEnded, async (data) => {
    // If we have tracks, seek to beginning and continue playing
    const queue = await TrackPlayer.getQueue();
    if (queue.length > 0) {
      await TrackPlayer.seekTo(0);
      await TrackPlayer.play();
    }
  });
};
