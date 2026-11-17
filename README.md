# Bus Management System

Smart Bus: the web app (this folder). Project documents are in `Documentation/`.

A Next.js app built from the v2 Figma design of the Smart Public Bus Management and Real-Time Passenger Information System: a passenger app, a driver app and an admin dashboard, in English, Bengali and Hindi.

Created with `npx create-next-app@latest web --yes` (Next.js 16, React 19, TypeScript, Tailwind CSS 4, App Router, Cache Components). Read `AGENTS.md` and `node_modules/next/dist/docs/` before changing framework-level code: this Next.js version differs from older ones.

## Run it

```bash
npm install
npm run dev        # http://localhost:3000, redirects to /en, /bn or /hi by browser language
npm run lint
npm run typecheck
npm test           # geofence, ETA and simulator tests (Node's built-in runner, no extra packages)
npm run build
```

Open the passenger, driver and admin screens in separate tabs: they share one simulated world. Settings → "Demo controls" (`/en/demo`) can slow a bus, break it down, drop its GPS signal, or restart the demo.

## Where things are

| Path | What |
|---|---|
| `app/[lang]/` | every screen, under the locale; `proxy.ts` redirects `/` to the right locale |
| `app/[lang]/passenger`, `driver`, `admin` | the three apps |
| `dictionaries/{en,bn,hi}.json` | all text, whole sentences with `{slots}`; bn and hi must match en's keys or the build fails |
| `components/` | shared pieces: `DotBoard` (the destination board), `StatusChip`, `BottomSheet`, `HoldButton`, maps |
| `lib/sim/` | the simulator: geofence rules, ETA engine, event log, shared store |
| `app/globals.css` | design tokens copied from the Figma variables |

## How the live data works

There is no server. `lib/sim/engine.ts` is a pure function: event log + time in, the whole world out (positions, statuses, ETAs, incidents, SOS). The log lives in `localStorage` and is announced over a `BroadcastChannel`, so every open tab agrees. Event names follow the project plan (trip, issue, sos, gps, stop radius). To use a real backend later, replace `lib/sim/store.ts`; the screens read the same snapshot shape.

## Known limits

- All names, plates, stop positions and the analytics figures are invented placeholders. Analytics is sample data, and says so on screen.
- Voice alerts use the browser's own speech voices; with no voice for the language, alerts show as text only.
- "Register bus" and "Add driver" are present but disabled. Logins are not real.
- The Bengali and Hindi text was written without a native-speaker review.
- Map tiles come from OpenStreetMap's public server, which is fine for development and light use.
