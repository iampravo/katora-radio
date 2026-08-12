// ---------- YouTube player ----------
// Owns the YT.Player instance and all of its state (ready/started/pending/
// muted). Nothing outside this module touches `YT` or `ytPlayer` directly.
//
// cueVideoById only stages a video (no autoplay) — used for the very first
// load, before the listener has pressed play. Once playback has actually
// started, loadVideoById is used instead everywhere: it loads AND plays in
// one call, avoiding the race of cueing a new video and then immediately
// calling playVideo() on top of it, which is what made skipping tracks feel
// laggy/inconsistent.

import { SONG_VOLUME } from './data.js';

export function createPlayer({ containerId, onTrackChange, onPlayStateChange, onReady }) {
  let yt = null;
  let ready = false;
  let started = false;
  let pendingPlay = false; // true if the listener hit play before the API had finished loading
  let muted = false;
  let songs = [];
  let index = 0;

  function loadSong(songIndex, seekSeconds, autoplay) {
    index = songIndex;
    onTrackChange(songs[index]);
    if (!ready) return;
    const params = { videoId: songs[index].youtubeId, startSeconds: seekSeconds || 0 };
    if (autoplay) yt.loadVideoById(params);
    else yt.cueVideoById(params);
  }

  function goTo(delta) {
    loadSong((index + delta + songs.length) % songs.length, 0, started);
    if (started) onPlayStateChange(true);
  }

  // The classic inline script in index.html buffers the YouTube API's
  // readiness (it can fire before this deferred module has even loaded) —
  // pick it up from there instead of racing to define the callback ourselves.
  function initYtPlayer() {
    yt = new YT.Player(containerId, {
      height: '1', width: '1',
      playerVars: { autoplay: 0, controls: 0, disablekb: 1, modestbranding: 1, playsinline: 1 },
      events: {
        onReady: () => {
          ready = true;
          yt.setVolume(SONG_VOLUME);
          if (pendingPlay) {
            // Listener already hit play while the API was still loading — honor
            // that click now instead of leaving it silently dropped.
            pendingPlay = false;
            started = true;
          }
          onReady({ autoplay: started });
        },
        onStateChange: (e) => {
          if (e.data === YT.PlayerState.ENDED) goTo(1);
        },
      },
    });
  }

  if (window.__ytApiReady) initYtPlayer();
  else document.addEventListener('youtube-iframe-api-ready', initYtPlayer, { once: true });

  return {
    get isReady() { return ready; },

    setSongs(newSongs) { songs = newSongs; },
    loadSong,

    togglePendingPlay() {
      pendingPlay = !pendingPlay;
      return pendingPlay;
    },

    togglePlay() {
      if (!ready) return;
      const playing = yt.getPlayerState() === YT.PlayerState.PLAYING;
      if (playing) {
        yt.pauseVideo();
        onPlayStateChange(false);
      } else {
        started = true;
        yt.playVideo();
        onPlayStateChange(true);
      }
    },

    next() { if (ready) goTo(1); },
    prev() { if (ready) goTo(-1); },

    toggleMute() {
      if (!ready) return null;
      muted = !muted;
      if (muted) yt.mute(); else yt.unMute();
      return muted;
    },

    isPlayingNow() { return ready && yt.getPlayerState() === YT.PlayerState.PLAYING; },

    getProgress() {
      if (!yt || typeof yt.getDuration !== 'function') return null;
      const dur = yt.getDuration();
      if (!(dur > 0)) return null;
      return yt.getCurrentTime() / dur;
    },
  };
}
