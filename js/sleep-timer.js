// ---------- sleep timer ----------
// Pauses the song after the chosen number of minutes (via the onFire
// callback — pausing the song cascades to ambient + gif on its own, see
// atmosphere.js and main.js's setPlayingUI). Runs to completion regardless
// of manual pauses/resumes in the meantime, same as any music app's sleep
// timer.

export function createSleepTimer({ buttonEl, menuEl, remainingEl, onFire }) {
  let fireTimer = null;
  let countdownInterval = null;
  let endTime = null;

  function clear() {
    clearTimeout(fireTimer);
    clearInterval(countdownInterval);
    fireTimer = null;
    countdownInterval = null;
    endTime = null;
    buttonEl.classList.remove('active');
    buttonEl.title = 'sleep timer: off';
    remainingEl.hidden = true;
    remainingEl.textContent = '';
  }

  function updateCountdown() {
    const remainingMs = endTime - Date.now();
    if (remainingMs <= 0) return;
    const totalSeconds = Math.ceil(remainingMs / 1000);
    const mm = Math.floor(totalSeconds / 60);
    const ss = totalSeconds % 60;
    remainingEl.textContent = `${mm}:${String(ss).padStart(2, '0')}`;
  }

  function set(minutes) {
    clear();
    if (minutes <= 0) return;
    endTime = Date.now() + minutes * 60 * 1000;
    buttonEl.classList.add('active');
    buttonEl.title = `sleep timer: ${minutes} min`;
    remainingEl.hidden = false;
    updateCountdown();
    countdownInterval = setInterval(updateCountdown, 1000);
    fireTimer = setTimeout(() => {
      onFire();
      clear();
    }, minutes * 60 * 1000);
  }

  buttonEl.addEventListener('click', (e) => {
    e.stopPropagation();
    menuEl.hidden = !menuEl.hidden;
  });

  menuEl.querySelectorAll('button').forEach((btn) => {
    btn.addEventListener('click', () => {
      set(Number(btn.dataset.minutes));
      menuEl.hidden = true;
    });
  });

  document.addEventListener('click', (e) => {
    if (!menuEl.hidden && e.target !== buttonEl && !menuEl.contains(e.target)) {
      menuEl.hidden = true;
    }
  });
}
