# katora radio

A barbershop radio for the internet — 90s Hindi songs, playing live, tuned to whatever hour it actually is in India right now. Inspired by [saloon.wtf](https://saloon.wtf), rebuilt with a real video background, layered ambient noise, and a shareable now-playing card.

## How it works

- **Time-of-day rotation** — four song rotations (morning / afternoon / evening / late night), switched automatically based on IST. Everyone tuning in around the same moment lands on roughly the same point in the same song, like an actual broadcast already in progress, instead of everyone starting track 1 from zero.
- **Real playback, not a rip** — every track plays through YouTube's own embedded player (`youtube.com/iframe_api`). Nothing is rehosted; artists and labels are paid exactly as they would be for any other YouTube view.
- **Real video background** — a looping barbershop clip (royalty-free, Mixkit license) instead of illustrated art, dimmed and vignetted so the console stays readable.
- **Layered ambient noise** — a low restaurant/chatter ambience bed plays under the music, with its volume riding gently with time of day (louder at peak hours, quieter late at night).
- **Shareable now-playing card** — one click renders the current track into a downloadable (or native-share, on mobile) image card.

## Stack

- Vanilla JS, no framework or bundler
- YouTube IFrame Player API for audio
- [Archivo Narrow](https://fonts.google.com/specimen/Archivo+Narrow) + [IBM Plex Mono](https://fonts.google.com/specimen/IBM+Plex+Mono) via Google Fonts
- Background video + ambient SFX sourced from [Mixkit](https://mixkit.co) (free for commercial use, no attribution required)

## Running locally

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

## Deployment

Deployed on Vercel, connected to this repo's `main` branch for automatic deploys on push.

## Not yet built

- A real "N listening now" counter — needs a small backend (e.g. Upstash Redis) to track live presence honestly. Deliberately left out of v1 rather than faking a number.
- More songs per rotation — the current ~10-track list is a starting catalog, easy to extend in `script.js`.

## Disclaimer

Fan-made rotation, not an official channel. Playback happens entirely through YouTube's own player. If you're a rights holder and want a track removed from the rotation, use the "flag a track" link on the page.
