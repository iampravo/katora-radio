'use strict';

// ---------- playlist ----------
// Each song's youtubeId is a verified, real upload (checked before adding).
// Playback runs entirely through YouTube's own embedded player — see disclaimer in index.html.

// Two visual/audio scenes, matched to the mood of each time-of-day rotation —
// barber-shop mornings, highway-trucker evenings and nights.
const SCENES = {
  barber: {
    video: 'assets/video/barber-india-bg',
    poster: 'assets/video/barber-india-poster.jpg',
    ambient: 'assets/audio/ambience-chatter.mp3',
  },
  truck: {
    video: 'assets/video/truck-bg',
    poster: 'assets/video/truck-poster.jpg',
    ambient: 'assets/audio/highway-ambience.mp3',
  },
};

const ROTATIONS = {
  morning: {
    label: 'Subah ka Rotation',
    scene: 'barber',
    songs: [
      { title: 'Pehla Nasha', film: 'Jo Jeeta Wohi Sikandar (1992)', singers: 'Udit Narayan, Sadhana Sargam', youtubeId: 'Whe-8N0F0oQ' },
      { title: 'Mera Dil Bhi Kitna Pagal Hai', film: 'Saajan (1991)', singers: 'Kumar Sanu, Alka Yagnik', youtubeId: '9XOLDuaYEmo' },
      { title: 'Ek Ladki Ko Dekha Toh Aisa Laga', film: '1942: A Love Story (1994)', singers: 'Kumar Sanu', youtubeId: 'pIW7YaPUU8U' },
      { title: 'Tujhe Dekha Toh', film: 'Dilwale Dulhania Le Jayenge (1995)', singers: 'Lata Mangeshkar, Kumar Sanu', youtubeId: 'cNV5hLSa9H8' },
    ],
  },
  afternoon: {
    label: 'Dopahar ka Rotation',
    scene: 'barber',
    songs: [
      { title: 'Tu Cheez Badi Hai Mast Mast', film: 'Mohra (1994)', singers: 'Udit Narayan, Kavita Krishnamurthy', youtubeId: 'DHWVkvhQB3U' },
      { title: 'Tip Tip Barsa Paani', film: 'Mohra (1994)', singers: 'Udit Narayan, Alka Yagnik', youtubeId: 'HyKuXycQXkg' },
      { title: 'Chaiyya Chaiyya', film: 'Dil Se (1998)', singers: 'Sukhwinder Singh, Sapna Awasthi', youtubeId: 'APo73rlxWaE' },
    ],
  },
  evening: {
    label: 'Shaam ka Rotation',
    scene: 'truck',
    songs: [
      { title: 'Didi Tera Devar Deewana', film: 'Hum Aapke Hain Koun (1994)', singers: 'Lata Mangeshkar, S. P. Balasubrahmanyam', youtubeId: 'SnPbVSvdlko' },
      { title: 'Kuch Kuch Hota Hai', film: 'Kuch Kuch Hota Hai (1998)', singers: 'Udit Narayan, Alka Yagnik', youtubeId: 'xnGcDsNu5DA' },
      { title: 'Chaiyya Chaiyya', film: 'Dil Se (1998)', singers: 'Sukhwinder Singh, Sapna Awasthi', youtubeId: 'APo73rlxWaE' },
    ],
  },
  night: {
    label: 'Raat ka Rotation',
    scene: 'truck',
    songs: [
      { title: 'Sandese Aate Hai', film: 'Border (1997)', singers: 'Sonu Nigam, Roop Kumar Rathod', youtubeId: 'cgsCsXIzzBY' },
      { title: 'Mera Dil Bhi Kitna Pagal Hai', film: 'Saajan (1991)', singers: 'Kumar Sanu, Alka Yagnik', youtubeId: '9XOLDuaYEmo' },
      { title: 'Pehla Nasha', film: 'Jo Jeeta Wohi Sikandar (1992)', singers: 'Udit Narayan, Sadhana Sargam', youtubeId: 'Whe-8N0F0oQ' },
    ],
  },
};

const SLOT_MINUTES = 4; // nominal per-song scheduling slot, used only to pick the live starting point

function istParts() {
  const fmt = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Kolkata', hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: false,
  });
  const parts = Object.fromEntries(fmt.formatToParts(new Date()).map((p) => [p.type, p.value]));
  return { hour: Number(parts.hour) % 24, minute: Number(parts.minute), second: Number(parts.second) };
}

function currentRotationKey(hour) {
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 21) return 'evening';
  return 'night';
}

// ---------- state ----------

let ytPlayer = null;
let ytReady = false;
let playerStarted = false;
let ambientOn = true;
let currentRotationSongs = [];
let currentSongIndex = 0;
let currentScene = null;
let progressTimer = null;

const el = (id) => document.getElementById(id);
const trackArt = el('trackArt');
const trackTitle = el('trackTitle');
const trackMeta = el('trackMeta');
const rotationLabel = el('rotationLabel');
const playBtn = el('playBtn');
const playIcon = el('playIcon');
const pauseIcon = el('pauseIcon');
const progressFill = el('progressFill');
const ambientToggle = el('ambientToggle');
const ambientAudio = el('ambientAudio');
const shareBtn = el('shareBtn');
const bgVideo = el('bgVideo');

// ---------- scene (video + ambient) ----------

function applyScene(sceneKey) {
  if (sceneKey === currentScene) return;
  currentScene = sceneKey;
  const scene = SCENES[sceneKey];

  bgVideo.poster = scene.poster;
  bgVideo.innerHTML = `
    <source src="${scene.video}.webm" type="video/webm">
    <source src="${scene.video}.mp4" type="video/mp4">
  `;
  bgVideo.load();
  bgVideo.play().catch(() => {});

  const wasPlaying = ambientOn && playerStarted && !ambientAudio.paused;
  ambientAudio.src = scene.ambient;
  ambientAudio.load();
  if (wasPlaying) ambientAudio.play().catch(() => {});
}

// ---------- rotation / scheduling ----------

function pickLiveStart() {
  const { hour, minute, second } = istParts();
  const key = currentRotationKey(hour);
  const rotation = ROTATIONS[key];
  const minutesIntoDay = hour * 60 + minute;
  const slot = Math.floor(minutesIntoDay / SLOT_MINUTES);
  const index = slot % rotation.songs.length;
  const elapsedSeconds = (minutesIntoDay % SLOT_MINUTES) * 60 + second;
  return { key, rotation, index, elapsedSeconds };
}

function renderTrack(song) {
  trackArt.src = `https://i.ytimg.com/vi/${song.youtubeId}/hqdefault.jpg`;
  trackTitle.textContent = song.title;
  trackMeta.textContent = `${song.film} · ${song.singers}`;
}

function loadSong(index, seekSeconds) {
  currentSongIndex = index;
  const song = currentRotationSongs[index];
  renderTrack(song);
  if (ytReady && ytPlayer) {
    ytPlayer.cueVideoById({ videoId: song.youtubeId, startSeconds: seekSeconds || 0 });
  }
}

function advanceToNext() {
  const nextIndex = (currentSongIndex + 1) % currentRotationSongs.length;
  loadSong(nextIndex, 0);
  if (playerStarted) ytPlayer.playVideo();
}

function refreshRotationIfChanged() {
  const { key, rotation } = pickLiveStart();
  rotationLabel.textContent = rotation.label.toUpperCase();
  currentRotationSongs = rotation.songs;
  applyScene(rotation.scene);
  return key;
}

// ---------- YouTube IFrame API ----------

window.onYouTubeIframeAPIReady = function onYouTubeIframeAPIReady() {
  ytPlayer = new YT.Player('ytPlayer', {
    height: '1', width: '1',
    playerVars: { autoplay: 0, controls: 0, disablekb: 1, modestbranding: 1, playsinline: 1 },
    events: {
      onReady: () => {
        ytReady = true;
        const { rotation, index, elapsedSeconds } = pickLiveStart();
        currentRotationSongs = rotation.songs;
        rotationLabel.textContent = rotation.label.toUpperCase();
        applyScene(rotation.scene);
        loadSong(index, elapsedSeconds);
      },
      onStateChange: (e) => {
        if (e.data === YT.PlayerState.ENDED) advanceToNext();
      },
    },
  });
};

// ---------- transport ----------

function setPlayingUI(isPlaying) {
  playIcon.style.display = isPlaying ? 'none' : '';
  pauseIcon.style.display = isPlaying ? '' : 'none';
  playBtn.setAttribute('aria-label', isPlaying ? 'pause' : 'play');
}

function startProgressLoop() {
  clearInterval(progressTimer);
  progressTimer = setInterval(() => {
    if (!ytPlayer || typeof ytPlayer.getDuration !== 'function') return;
    const dur = ytPlayer.getDuration();
    const cur = ytPlayer.getCurrentTime();
    if (dur > 0) progressFill.style.width = `${Math.min(100, (cur / dur) * 100)}%`;
  }, 500);
}

playBtn.addEventListener('click', () => {
  if (!ytReady) return;
  const state = ytPlayer.getPlayerState();
  const isPlaying = state === YT.PlayerState.PLAYING;

  if (isPlaying) {
    ytPlayer.pauseVideo();
    ambientAudio.pause();
    setPlayingUI(false);
  } else {
    playerStarted = true;
    ytPlayer.playVideo();
    if (ambientOn) ambientAudio.play().catch(() => {});
    setPlayingUI(true);
    startProgressLoop();
  }
});

// ---------- background music (ambient layer under the songs) ----------

function updateAmbientButtonLabel() {
  ambientToggle.innerHTML = `<span>&#9834;</span> background music: ${ambientOn ? 'chalu' : 'band'}`;
  ambientToggle.classList.toggle('muted', !ambientOn);
}

ambientToggle.addEventListener('click', () => {
  ambientOn = !ambientOn;
  updateAmbientButtonLabel();
  if (ambientOn && playerStarted) ambientAudio.play().catch(() => {});
  if (!ambientOn) ambientAudio.pause();
});

// time-of-day ambient volume: a little livelier midday, quieter late at night
function updateAmbientVolume() {
  const { hour } = istParts();
  let vol;
  if (hour >= 11 && hour < 20) vol = 0.32;
  else if (hour >= 20 && hour < 23) vol = 0.22;
  else vol = 0.14;
  ambientAudio.volume = vol;
}

// ---------- rotation change watcher ----------

setInterval(() => {
  const before = rotationLabel.textContent;
  const key = refreshRotationIfChanged();
  updateAmbientVolume();
  void key;
  void before;
}, 60 * 1000);

// ---------- share card ----------

function drawShareCard(song) {
  const canvas = el('shareCanvas');
  const ctx = canvas.getContext('2d');
  const w = canvas.width, h = canvas.height;

  const grad = ctx.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, '#1a1108');
  grad.addColorStop(1, '#0b0906');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  ctx.fillStyle = 'rgba(217,138,61,0.14)';
  ctx.beginPath();
  ctx.arc(w * 0.82, h * 0.16, 260, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#D98A3D';
  ctx.font = '600 34px "IBM Plex Mono", monospace';
  ctx.fillText('KATORA RADIO', 64, 110);

  ctx.fillStyle = 'rgba(244,239,230,0.6)';
  ctx.font = '500 24px "IBM Plex Mono", monospace';
  ctx.fillText('ABHI CHAL RAHA HAI', 64, 400);

  ctx.fillStyle = '#F4EFE6';
  ctx.font = '600 56px "Archivo Narrow", sans-serif';
  wrapText(ctx, song.title, 64, 470, w - 128, 62);

  ctx.fillStyle = 'rgba(244,239,230,0.72)';
  ctx.font = '400 28px "Archivo Narrow", sans-serif';
  ctx.fillText(song.film, 64, 620);
  ctx.fillText(song.singers, 64, 660);

  ctx.strokeStyle = 'rgba(244,239,230,0.2)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(64, h - 120);
  ctx.lineTo(w - 64, h - 120);
  ctx.stroke();

  ctx.fillStyle = 'rgba(244,239,230,0.55)';
  ctx.font = '500 20px "IBM Plex Mono", monospace';
  ctx.fillText('katora.radio', 64, h - 70);

  return canvas;
}

function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = text.split(' ');
  let line = '';
  let curY = y;
  words.forEach((word) => {
    const test = line + word + ' ';
    if (ctx.measureText(test).width > maxWidth && line !== '') {
      ctx.fillText(line, x, curY);
      line = word + ' ';
      curY += lineHeight;
    } else {
      line = test;
    }
  });
  ctx.fillText(line, x, curY);
}

shareBtn.addEventListener('click', () => {
  const song = currentRotationSongs[currentSongIndex];
  if (!song) return;
  const canvas = drawShareCard(song);
  const original = shareBtn.textContent;

  canvas.toBlob((blob) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'katora-radio-now-playing.png';
    a.click();
    URL.revokeObjectURL(url);
    shareBtn.textContent = '✓ saved';
    setTimeout(() => { shareBtn.textContent = original; }, 1400);
  }, 'image/png');
});

// ---------- init ----------

updateAmbientButtonLabel();
updateAmbientVolume();
