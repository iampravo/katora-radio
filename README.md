# मेरा रेडियो — mera radio

Old songs, always with you — a barbershop-and-highway radio for the internet, playing 90s Hindi songs live, tuned to whatever time it actually is in India right now. Same skeleton as [saloon.wtf](https://saloon.wtf) (corner clock, big centered wordmark, persistent bottom player bar), built on real content instead of illustration.

## How it works

- **Song playback is the priority.** The page paints instantly (a plain CSS gradient/inline SVG, no network wait), and the YouTube player is cued and ready to press play the moment it's ready — nothing about the background or ambient layer blocks that. "Listen first, feel the ambience after" is the literal load order, not just a tagline.
- **Time-of-day rotation** — four song rotations (Morning / Afternoon / Evening / Midnight Highway), switched automatically based on IST, 310 songs total. Everyone tuning in around the same moment lands on roughly the same point in the same song, like an actual broadcast already in progress, instead of everyone starting track 1 from zero.
- **Real footage, cycled in the background** — Morning/Afternoon keep a plain warm gradient; Evening/Midnight Highway lazily rotate through 11 real road-POV GIFs, crossfading in only once actually loaded, and only once the song is actually playing (pausing freezes the gif on a still frame — native gifs have no JS pause, so that's a swap to a static poster image — resuming picks the same clip back up).
- **Real playback, not a rip** — every track plays through YouTube's own embedded player (`youtube.com/iframe_api`). Nothing is rehosted; artists and labels are paid exactly as they would be for any other YouTube view.
- **Background music is opt-in** — the ambient audio bed (street/barber chatter by day, highway traffic by night) doesn't fetch anything until you tap the note icon, and follows the song's play/pause state once it's on.
- **Sleep timer** — pick 15/30/45/60 minutes; the song (and, via the above, ambient + gif) pauses when it fires, with a live countdown next to the button while it's set.
- **Shareable now-playing card** — one click renders the current track into a downloadable image card.
- **Real removal requests** — "want a song removed?" opens a form that emails the request straight to the maintainer via Resend, not a mailto: link to a domain nobody owns.

## Stack

- Vanilla JS as native ES modules (`js/*.js`) — no framework, no bundler, no build step. `index.html` loads a single `<script type="module" src="js/main.js">`; the browser resolves every `import` itself.
- YouTube IFrame Player API for audio
- One Vercel serverless function (`api/removal-request.js`, zero dependencies — calls Resend's REST API directly via `fetch`) for the removal-request form
- Archivo Narrow, IBM Plex Mono, Yatra One, and Anton via Google Fonts
- GIFs and ambient SFX sourced from [Pexels](https://www.pexels.com) and [Mixkit](https://mixkit.co) (free for commercial use, no attribution required), re-encoded smaller for the web

### Module layout (`js/`)

| File | Responsibility |
|---|---|
| `data.js` | Static config + the song catalog. Pure data, no logic. |
| `time.js` | Pure scheduling math (`pickLiveStart` etc.) — no DOM. |
| `player.js` | Owns the `YT.Player` instance and all of its state. |
| `atmosphere.js` | Ambient audio + truck gif, both driven by scene + play state. |
| `sleep-timer.js`, `removal-modal.js`, `share-card.js` | Self-contained features — each wires its own DOM events. |
| `main.js` | Entry point: DOM refs, cross-module orchestration (play/pause → icons + atmosphere + progress bar), transport button wiring. |

## Running locally

```bash
npx http-server -p 8000
# then open http://localhost:8000
```

The removal-request form needs `RESEND_API_KEY` and `REMOVAL_RECIPIENT_EMAIL` (set on Vercel) to actually send — locally, submitting it will fail since there's no serverless runtime in `http-server`.

## Deployment

Deployed on Vercel, connected to this repo's `main` branch for automatic deploys on push.

## Not yet built

- A real "N listening now" counter — needs a small backend to track live presence honestly (a raw Redis-per-heartbeat design doesn't scale well; a presence-native realtime service is the better fit). Deliberately left out rather than faking a number, unlike saloon.wtf's.
- Real footage for the morning/afternoon scenes — only the evening/night scenes have real GIFs cycling right now.

## Disclaimer

Fan-made rotation, not an official channel. Playback happens entirely through YouTube's own player. If you're a rights holder and want a track removed from the rotation, use the "want a song removed?" link on the page.
