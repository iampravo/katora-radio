// ---------- scheduling ----------
// Pure functions, no DOM — the "what should be playing right now" math,
// kept separate from anything that touches the page.

import { ROTATIONS, SLOT_MINUTES } from './data.js';

export function istParts() {
  const fmt = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Kolkata', hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: false,
  });
  const parts = Object.fromEntries(fmt.formatToParts(new Date()).map((p) => [p.type, p.value]));
  return { hour: Number(parts.hour) % 24, minute: Number(parts.minute), second: Number(parts.second) };
}

export function currentRotationKey(hour) {
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 21) return 'evening';
  return 'night';
}

// "Already tuned in" simulation: buckets the day into SLOT_MINUTES-wide
// slots and picks whichever song + seek offset lands on the current slot,
// so simultaneous visitors land at roughly the same point in the same song.
export function pickLiveStart() {
  const { hour, minute, second } = istParts();
  const key = currentRotationKey(hour);
  const rotation = ROTATIONS[key];
  const minutesIntoDay = hour * 60 + minute;
  const slot = Math.floor(minutesIntoDay / SLOT_MINUTES);
  const index = slot % rotation.songs.length;
  const elapsedSeconds = (minutesIntoDay % SLOT_MINUTES) * 60 + second;
  return { key, rotation, index, elapsedSeconds };
}
