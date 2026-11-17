# Smart Public Bus Management and Real-Time Passenger Information System

A web app that tells a person waiting at a bus stop where the bus is, when it will arrive, and what to do if it is late or has broken down. It has three apps in one project: one for passengers, one for drivers and one for administrators. Every screen works in English, Bengali and Hindi.

This is Group 10's project for the Software Engineering course (IT301), B.Tech (CSE), Amity University Kolkata.

- Live demo: https://bus-management-system-ashen.vercel.app
- Figma design: https://www.figma.com/design/BNxhNIua8DILi2ywyTc9bg/Bus-Management-System
- Reports, final presentation and screenshots: [`Documentation/Final_Submission/`](Documentation/Final_Submission)

## The problem

A timetable says when a bus should come. It cannot say whether the bus is running late, has broken down or is not coming at all. The system answers six questions a waiting passenger cannot answer today: is it running, where is it, is it delayed, has it broken down, will it reach my stop, and is another bus closer.

## What it does

| App | Main features |
|---|---|
| Passenger | Live map, arrival board, status of every bus, alerts, next bus after a breakdown, voice alerts, SOS |
| Driver | Confirm bus, start trip, report an issue from a fixed list, resume service, complete trip, SOS |
| Administrator | Live fleet map, incidents and SOS alerts, buses, drivers, route editor with stop radius, analytics |

- Six bus statuses: Active, Delayed, Breakdown, Inactive, Trip completed, Emergency.
- Stop arrival and departure come from a circle around each stop (geofence), with no hardware at the stop.
- The arrival time comes from live speed blended with usual speed. It becomes a range when the system is unsure.
- SOS needs a 3 second hold and a confirmation. It alerts the administrators only and says so on screen. It does not contact the police, ambulance or fire service, so people should call 112.

## Run it

```bash
npm install
npm run dev        # http://localhost:3000, redirects to /en, /bn or /hi by browser language
npm run lint
npm run typecheck
npm test           # 18 tests: geofence, ETA, simulator and shared store (Node's built-in runner)
npm run build
```

Open the passenger, driver and admin screens in separate tabs. They share one simulated world. The demo controls at `/en/demo` can slow a bus, break it down, drop its GPS signal or restart the demo.

## Tech

Next.js 16 (App Router, Cache Components), React 19, TypeScript, Tailwind CSS 4, Leaflet with OpenStreetMap, the Web Speech API, deployed on Vercel. Read `AGENTS.md` and `node_modules/next/dist/docs/` before changing framework-level code, because this Next.js version differs from older ones.

## Where things are

| Path | What |
|---|---|
| `app/[lang]/` | every screen, under the language prefix. `proxy.ts` redirects `/` to the right language |
| `app/[lang]/passenger`, `driver`, `admin` | the three apps |
| `dictionaries/{en,bn,hi}.json` | all text, as whole sentences with `{slots}`. bn and hi must match the keys of en or the build fails |
| `components/` | shared pieces: the destination board, status chip, bottom sheet, hold button, maps |
| `lib/sim/` | the simulator: geofence rules, ETA engine, event log, shared store |
| `app/globals.css` | design tokens copied from the Figma variables |
| `Documentation/` | project plan, course material, and the final submission |

## How the live data works

There is no server. `lib/sim/engine.ts` is a pure function: it takes the event log and the time, and returns the whole world (positions, statuses, arrival times, incidents, SOS). The log lives in `localStorage` and is announced over a `BroadcastChannel`, so every open tab agrees. The event names follow the project plan. To use a real backend later, replace `lib/sim/store.ts`. The screens read the same snapshot shape.

## Team

Group 10, Section B, B.Tech (CSE), Batch 2023 - 2027.

| Member | Enrollment | Role | Contribution |
|---|---|---|---|
| Nirmalya Mandal | A91005223001 | Project lead, developer, UI/UX designer | Figma design, the whole web app, testing, deployment, title and team slides, breakdown flow, technology and timeline |
| Parth Nagar | A91005223179 | Requirements and planning analyst | Scope, users and the problem statement |
| Jeya Maity | A91005223079 | Objectives and process model analyst | Objectives, the Incremental Model, and checking the objectives against the final system |
| Partha Pratim Bera | A91005223091 | System architecture and design analyst | System architecture and data design |
| Mir Sahin Ali | A91005223011 | Working flow and process analyst | End-to-end working flow of the system |

Each member's own report is in `Documentation/Final_Submission/`. Only Nirmalya wrote code. The others did the analysis and design work that the app follows.

## Known limits

- Live data is simulated in the browser. The real backend (PostgreSQL with PostGIS, Redis, Socket.IO) is planned, not built.
- All names, plates, stop positions and analytics figures are invented placeholders. Analytics is sample data and says so on screen.
- Logins are not real. "Register bus" and "Add driver" are present but disabled.
- Voice alerts use the browser's own voices. With no voice for the language, alerts show as text only.
- The Bengali and Hindi text has not been reviewed by a native speaker.
- Map tiles come from OpenStreetMap's public server, which is fine for development and light use.
