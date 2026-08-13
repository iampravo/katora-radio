// ---------- visitor count ----------
// Records one visit per unique browser (gated by localStorage, so repeat
// visits/refreshes only fetch the count instead of inflating it) and
// shows the real total top-left. See api/visitor-count.js for the backend.

const VISITED_KEY = 'mera-radio-visited';
const formatCount = new Intl.NumberFormat('en-IN').format;

export function createVisitorCount({ labelEl }) {
  const alreadyVisited = localStorage.getItem(VISITED_KEY) === '1';

  fetch('/api/visitor-count', { method: alreadyVisited ? 'GET' : 'POST' })
    .then((res) => res.json())
    .then((data) => {
      if (!data.success) return;
      if (!alreadyVisited) localStorage.setItem(VISITED_KEY, '1');
      labelEl.textContent = `${formatCount(data.count)} TUNED IN`;
      labelEl.hidden = false;
    })
    .catch(() => {}); // silently do nothing if it fails — not core to the app
}
