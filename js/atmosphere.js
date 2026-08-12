// ---------- background atmosphere (ambient audio + truck gif) ----------
// Everything here is scene- and playback-driven: ambient audio is opt-in
// (via the toggle button) but always follows the song's play/pause state
// once it's on; the truck gif has no opt-in, it simply mirrors whether the
// song is playing, same as ambient.
//
// Native gifs have no JS-controllable pause, so "pausing" the gif means
// swapping to a static poster frame of whatever clip is currently showing;
// resuming swaps back to the same (animated) clip rather than jumping to a
// different one.

import { SCENES, TRUCK_GIFS, GIF_ROTATE_MS, AMBIENT_VOLUME } from './data.js';

export function createAtmosphere({ sceneEl, gifEl, ambientEl, ambientToggleEl }) {
  let currentScene = null;
  let songIsPlaying = false;
  let ambientOn = false;
  let ambientLoadedScene = null;
  let gifRotationTimer = null;
  let gifIndex = 0;

  // ---- ambient audio ----

  function updateAmbientButtonLabel() {
    ambientToggleEl.title = `background music: ${ambientOn ? 'on' : 'off'}`;
    ambientToggleEl.setAttribute('aria-label', ambientToggleEl.title);
    ambientToggleEl.classList.toggle('muted', !ambientOn);
  }

  function loadAmbientForCurrentScene() {
    if (ambientLoadedScene === currentScene) return;
    ambientLoadedScene = currentScene;
    ambientEl.src = SCENES[currentScene].ambient;
    ambientEl.volume = AMBIENT_VOLUME;
    ambientEl.load();
  }

  function pauseAmbientIfOn() {
    if (ambientOn) ambientEl.pause();
  }

  function resumeAmbientIfOn() {
    if (!ambientOn) return;
    loadAmbientForCurrentScene();
    ambientEl.play().catch(() => {});
  }

  ambientToggleEl.addEventListener('click', () => {
    ambientOn = !ambientOn;
    updateAmbientButtonLabel();
    if (ambientOn) resumeAmbientIfOn();
    else ambientEl.pause();
  });

  // ---- truck gif rotation ----

  function showGif(src) {
    const img = new Image();
    img.onload = () => {
      if (currentScene !== 'truck') return; // scene may have changed while loading
      gifEl.classList.remove('loaded');
      gifEl.src = src;
      requestAnimationFrame(() => gifEl.classList.add('loaded'));
    };
    img.src = src;
  }

  function startGifRotation() {
    showGif(TRUCK_GIFS[gifIndex]);
    clearInterval(gifRotationTimer);
    gifRotationTimer = setInterval(() => {
      gifIndex = (gifIndex + 1) % TRUCK_GIFS.length;
      showGif(TRUCK_GIFS[gifIndex]);
    }, GIF_ROTATE_MS);
  }

  function stopGifRotation() {
    clearInterval(gifRotationTimer);
    gifRotationTimer = null;
    gifEl.classList.remove('loaded');
  }

  function pauseGifRotation() {
    if (!gifRotationTimer) return;
    clearInterval(gifRotationTimer);
    gifRotationTimer = null;
    if (gifEl.classList.contains('loaded')) {
      gifEl.src = TRUCK_GIFS[gifIndex].replace('.gif', '-poster.jpg');
    }
  }

  function updateGifPlaybackState() {
    if (currentScene !== 'truck') stopGifRotation();
    else if (songIsPlaying) { if (!gifRotationTimer) startGifRotation(); }
    else pauseGifRotation();
  }

  updateAmbientButtonLabel();

  return {
    setScene(sceneKey) {
      if (sceneKey === currentScene) return;
      currentScene = sceneKey;
      sceneEl.className = `bg-scene scene-${sceneKey}`;
      updateGifPlaybackState();
      resumeAmbientIfOn(); // no-op if ambient isn't on
    },

    setSongPlaying(isPlaying) {
      songIsPlaying = isPlaying;
      updateGifPlaybackState();
      if (isPlaying) resumeAmbientIfOn();
      else pauseAmbientIfOn();
    },
  };
}
