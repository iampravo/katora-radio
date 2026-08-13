// ---------- entry point ----------
// Wires the feature modules to the DOM. This is the only file that knows
// about element IDs; every module above takes its elements as arguments
// instead of looking them up itself.

import { istParts, pickLiveStart } from './time.js';
import { createPlayer } from './player.js';
import { createAtmosphere } from './atmosphere.js';
import { createSleepTimer } from './sleep-timer.js';
import { createRemovalModal } from './removal-modal.js';
import { createShareCard } from './share-card.js';
import { createVisitorCount } from './visitor-count.js';

const el = (id) => document.getElementById(id);

const trackArt = el('trackArt');
const trackTitle = el('trackTitle');
const trackMeta = el('trackMeta');
const rotationLabel = el('rotationLabel');
const playBtn = el('playBtn');
const playIcon = el('playIcon');
const pauseIcon = el('pauseIcon');
const prevBtn = el('prevBtn');
const nextBtn = el('nextBtn');
const muteBtn = el('muteBtn');
const volumeIcon = el('volumeIcon');
const mutedIcon = el('mutedIcon');
const progressFill = el('progressFill');
const clockEl = el('clock');

let currentSong = null;
let progressTimer = null;

function renderTrack(song) {
  currentSong = song;
  trackArt.src = `https://i.ytimg.com/vi/${song.youtubeId}/hqdefault.jpg`;
  trackTitle.textContent = song.title;
  trackMeta.textContent = `${song.film} · ${song.singers}`;
}

const atmosphere = createAtmosphere({
  sceneEl: el('bgScene'),
  gifEl: el('bgGif'),
  ambientEl: el('ambientAudio'),
  ambientToggleEl: el('ambientToggle'),
});

// Song playback is the first priority — pausing/resuming it also pauses/
// resumes background music and the truck gif (via atmosphere), and starts/
// stops the progress-bar poll, so nothing drifts out of sync or spins in
// the background while paused.
function setPlayingUI(isPlaying) {
  playIcon.style.display = isPlaying ? 'none' : '';
  pauseIcon.style.display = isPlaying ? '' : 'none';
  playBtn.setAttribute('aria-label', isPlaying ? 'pause' : 'play');
  atmosphere.setSongPlaying(isPlaying);

  clearInterval(progressTimer);
  progressTimer = isPlaying
    ? setInterval(() => {
        const progress = player.getProgress();
        if (progress != null) progressFill.style.width = `${Math.min(100, progress * 100)}%`;
      }, 500)
    : null;
}

const player = createPlayer({
  containerId: 'ytPlayer',
  onTrackChange: renderTrack,
  onPlayStateChange: setPlayingUI,
  onReady: ({ autoplay }) => {
    const { rotation, index, elapsedSeconds } = pickLiveStart();
    player.setSongs(rotation.songs);
    rotationLabel.textContent = rotation.label.toUpperCase();
    atmosphere.setScene(rotation.scene);
    playBtn.classList.remove('loading');
    player.loadSong(index, elapsedSeconds, autoplay);
    if (autoplay) setPlayingUI(true);
  },
});

// ---------- transport ----------

playBtn.addEventListener('click', () => {
  if (!player.isReady) {
    // API isn't ready yet — remember the intent and show a loading state
    // instead of silently dropping the click. onReady() will honor it.
    const pending = player.togglePendingPlay();
    playBtn.classList.toggle('loading', pending);
    return;
  }
  player.togglePlay();
});

prevBtn.addEventListener('click', () => player.prev());
nextBtn.addEventListener('click', () => player.next());

muteBtn.addEventListener('click', () => {
  const muted = player.toggleMute();
  if (muted === null) return;
  volumeIcon.style.display = muted ? 'none' : '';
  mutedIcon.style.display = muted ? '' : 'none';
  muteBtn.classList.toggle('active', muted);
  muteBtn.title = muted ? 'unmute' : 'mute';
});

// ---------- rotation change watcher ----------

setInterval(() => {
  const { rotation } = pickLiveStart();
  rotationLabel.textContent = rotation.label.toUpperCase();
  player.setSongs(rotation.songs);
  atmosphere.setScene(rotation.scene);
}, 60 * 1000);

// ---------- clock (IST — matches the rotation schedule) ----------

function updateClock() {
  const { hour, minute } = istParts();
  clockEl.textContent = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}
updateClock();
setInterval(updateClock, 15000);

// ---------- sleep timer, share card, removal modal ----------

createSleepTimer({
  buttonEl: el('sleepBtn'),
  menuEl: el('sleepMenu'),
  remainingEl: el('sleepRemaining'),
  onFire: () => { if (player.isPlayingNow()) player.togglePlay(); },
});

createShareCard({
  buttonEl: el('shareBtn'),
  canvasEl: el('shareCanvas'),
  getCurrentSong: () => currentSong,
});

createRemovalModal({
  triggerEl: el('removalLink'),
  overlayEl: el('removalOverlay'),
  messageEl: el('removalMessage'),
  emailEl: el('removalEmail'),
  statusEl: el('removalStatus'),
  submitEl: el('removalSubmit'),
  cancelEl: el('removalCancel'),
});

createVisitorCount({ labelEl: el('visitorCount') });
