# katora radio

Purane gaane, poora vibe — a barbershop-and-highway radio for the internet, playing 90s Hindi songs live, tuned to whatever time it actually is in India right now. Same skeleton as [saloon.wtf](https://saloon.wtf) (corner clock, big centered wordmark, persistent bottom player bar), built on real content instead of illustration.

## How it works

- **Song playback is the priority.** The page paints instantly (a plain CSS gradient, no network wait), and the YouTube player is cued and ready to press play the moment it's ready — nothing about the background or ambient layer blocks that. "Listen first, feel the ambience after" is the literal load order, not just a tagline.
- **Time-of-day rotation** — four song rotations (Subah / Dopahar / Shaam / Raat), switched automatically based on IST. Everyone tuning in around the same moment lands on roughly the same point in the same song, like an actual broadcast already in progress, instead of everyone starting track 1 from zero.
- **Real footage, cycled in the background** — Subah/Dopahar keep a plain warm gradient; Shaam/Raat lazily fetch and rotate through 5 real dashcam-style GIFs (Indian highway, rainy roads, vintage cab, golden-hour countryside, night rain) every 25s, each crossfading in only once it's actually loaded. Loading is deferred to browser idle time, so it never competes with the song becoming playable.
- **Real playback, not a rip** — every track plays through YouTube's own embedded player (`youtube.com/iframe_api`). Nothing is rehosted; artists and labels are paid exactly as they would be for any other YouTube view.
- **Background music is opt-in** — the ambient audio bed (street/barber chatter by day, highway traffic by night) doesn't fetch anything until you tap "background music." Its volume rides gently with time of day once it's on.
- **Shareable now-playing card** — one click renders the current track into a downloadable image card.

## Stack

- Vanilla JS, no framework or bundler
- YouTube IFrame Player API for audio
- [Archivo Narrow](https://fonts.google.com/specimen/Archivo+Narrow) + [IBM Plex Mono](https://fonts.google.com/specimen/IBM+Plex+Mono) via Google Fonts
- GIFs and ambient SFX sourced from [Pexels](https://www.pexels.com) and [Mixkit](https://mixkit.co) (free for commercial use, no attribution required), re-encoded smaller for the web

## Running locally

```bash
npx http-server -p 8000
# then open http://localhost:8000
```

## Deployment

Deployed on Vercel, connected to this repo's `main` branch for automatic deploys on push.

## Not yet built

- A real "N listening now" counter — needs a small backend (e.g. Upstash Redis) to track live presence honestly. Deliberately left out rather than faking a number, unlike saloon.wtf's.
- Real footage for the barber (Subah/Dopahar) scenes — only the truck scene has real GIFs cycling right now.
- More songs per rotation — the current ~10-track list is a starting catalog, easy to extend in `script.js`.

## Disclaimer

Fan-made rotation, not an official channel. Playback happens entirely through YouTube's own player. If you're a rights holder and want a track removed from the rotation, use the "gaana hatwana hai? bata do" link on the page.
