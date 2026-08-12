# katora radio

Purane gaane, poora vibe — a barbershop-and-highway radio for the internet, playing 90s Hindi songs live, tuned to whatever time it actually is in India right now. Inspired by [saloon.wtf](https://saloon.wtf), rebuilt with real video, a scene that matches the hour, and a shareable now-playing card.

## How it works

- **Time-of-day rotation** — four song rotations (Subah / Dopahar / Shaam / Raat), switched automatically based on IST. Everyone tuning in around the same moment lands on roughly the same point in the same song, like an actual broadcast already in progress, instead of everyone starting track 1 from zero.
- **Two scenes, matched to the mood** — Subah and Dopahar (morning/afternoon) run a real Indian roadside-barber clip; Shaam and Raat (evening/night) switch to a real Indian highway-trucker clip, each with its own layered ambient bed (street/barber chatter by day, highway traffic + a truck passing by after dark) — real video and real background music picked for the situation, not one generic loop.
- **Real playback, not a rip** — every track plays through YouTube's own embedded player (`youtube.com/iframe_api`). Nothing is rehosted; artists and labels are paid exactly as they would be for any other YouTube view.
- **Background music that rides with the day** — the ambient layer's volume rises a little at peak hours and settles down late at night.
- **Shareable now-playing card** — one click renders the current track into a downloadable image card.

## Stack

- Vanilla JS, no framework or bundler
- YouTube IFrame Player API for audio
- [Archivo Narrow](https://fonts.google.com/specimen/Archivo+Narrow) + [IBM Plex Mono](https://fonts.google.com/specimen/IBM+Plex+Mono) via Google Fonts
- Video and ambient SFX sourced from [Pexels](https://www.pexels.com) and [Mixkit](https://mixkit.co) (free for commercial use, no attribution required)

## Running locally

Use a server that supports HTTP Range requests — Python's `http.server` does not, and the background video will silently fail to load under it.

```bash
npx http-server -p 8000
# then open http://localhost:8000
```

## Deployment

Deployed on Vercel, connected to this repo's `main` branch for automatic deploys on push.

## Not yet built

- A real "N listening now" counter — needs a small backend (e.g. Upstash Redis) to track live presence honestly. Deliberately left out of v1 rather than faking a number.
- More songs per rotation — the current ~10-track list is a starting catalog, easy to extend in `script.js`.

## Disclaimer

Fan-made rotation, not an official channel. Playback happens entirely through YouTube's own player. If you're a rights holder and want a track removed from the rotation, use the "gaana hatwana hai? bata do" link on the page.
