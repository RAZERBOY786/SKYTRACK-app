# SKYTRACK-app

Live aviation-intelligence air-traffic monitoring dashboard for iOS/Android, built with Expo SDK 54.

- **MAP** — interactive tactical map with real geographic tiles, live aircraft markers, zoom/pan and target lock
- **FLIGHTS** — registry style list of tracked aircraft with per-flight telemetry
- **STATS** — fleet analytics (airborne vs ground, altitude bands, traffic curve, category mix)
- **ALERTS** — emergency squawk, overspeed and altitude-ceiling trigger engine

Works out of the box with the built-in simulated aircraft feed (no API key required). Optionally set `EXPO_PUBLIC_SKYTRACK_API_KEY` in `.env` to use the live AirLabs / Aviationstack feed.

## Run

```sh
npm install
npx expo start
```