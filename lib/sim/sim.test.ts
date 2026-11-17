import { test } from "node:test";
import assert from "node:assert/strict";
import { stopState } from "./geofence.ts";
import { bandEta, etaSeconds, isUncertain } from "./eta.ts";
import { deriveState, nextAvailableBus, seedEvents, type SimEvent } from "./engine.ts";
import { ROUTES } from "./data.ts";
import { kpis } from "./kpis.ts";

const EPOCH = 1_700_000_000_000;
const at = (sec: number) => EPOCH + sec * 1000;

test("geofence: upcoming, approaching, arrived, departed", () => {
  assert.equal(stopState(2000, 100), "upcoming");
  assert.equal(stopState(400, 100), "approaching");
  assert.equal(stopState(60, 100), "arrived");
  assert.equal(stopState(-90, 100), "arrived");
  assert.equal(stopState(-131, 100), "departed");
});

test("geofence: leaving needs radius + 30 m, so a bus parked on the edge does not flicker", () => {
  assert.equal(stopState(-100, 100), "arrived");
  assert.equal(stopState(-129, 100), "arrived");
  assert.equal(stopState(-130.5, 100), "departed");
});

test("eta: null once passed, blends typical speed into live speed", () => {
  assert.equal(etaSeconds({ aheadM: 0, speed: 5, typicalSpeed: 5, tripElapsedSec: 0, stopsBetween: 0 }), null);
  const fresh = etaSeconds({ aheadM: 1000, speed: 10, typicalSpeed: 5, tripElapsedSec: 0, stopsBetween: 0 }) as number;
  const later = etaSeconds({ aheadM: 1000, speed: 10, typicalSpeed: 5, tripElapsedSec: 300, stopsBetween: 0 }) as number;
  assert.equal(Math.round(fresh), 200); // history only at the start
  assert.equal(Math.round(later), 100); // live speed after 5 minutes
  assert.equal(Math.round(etaSeconds({ aheadM: 1000, speed: 5, typicalSpeed: 5, tripElapsedSec: 600, stopsBetween: 3 }) as number), 260); // 3 stops x 20 s dwell
});

test("eta bands: bands not false precision, never 'now' while still far", () => {
  assert.deepEqual(bandEta(8 * 60, false, 2000), { kind: "about", n: 8 });
  assert.deepEqual(bandEta(14 * 60, false, 6000), { kind: "about", n: 15 });
  assert.deepEqual(bandEta(45 * 60, false, 20000), { kind: "over", n: 30 });
  assert.deepEqual(bandEta(30, false, 1200), { kind: "about", n: 1 });
  assert.deepEqual(bandEta(30, false, 100), { kind: "now" });
  assert.equal(bandEta(10 * 60, true, 3000).kind, "range");
});

test("eta: admits doubt on delay, silence and distance", () => {
  assert.equal(isUncertain({ status: "active", silenceSec: 0, stopsAhead: 2 }), false);
  assert.equal(isUncertain({ status: "delayed", silenceSec: 0, stopsAhead: 2 }), true);
  assert.equal(isUncertain({ status: "active", silenceSec: 91, stopsAhead: 2 }), true);
  assert.equal(isUncertain({ status: "active", silenceSec: 0, stopsAhead: 5 }), true);
});

test("engine: the seeded demo shows every status", () => {
  const s = deriveState(seedEvents(EPOCH), at(0), EPOCH);
  assert.equal(s.buses["24"].status, "active");
  assert.equal(s.buses["24B"].status, "inactive");
  assert.equal(s.buses["45"].status, "breakdown");
  assert.equal(s.buses["31"].status, "emergency");
  assert.equal(s.buses["12"].status, "delayed");
  assert.equal(s.buses["8"].status, "active");
  assert.equal(s.buses["17"].status, "completed");
  assert.equal(s.buses["S-12"].status, "inactive");
  assert.equal(s.sos.length, 1);
  assert.equal(s.sos[0].ackAt, null);
});

test("engine: Bus 24 reaches Esplanade in roughly the demo's few minutes", () => {
  const s = deriveState(seedEvents(EPOCH), at(0), EPOCH);
  const eta = s.buses["24"].stops.find((x) => x.stop.id === "esplanade")?.eta;
  assert.ok(eta);
  assert.ok(eta.sec > 4 * 60 && eta.sec < 12 * 60, `eta was ${eta.sec}`);
});

test("engine: a bus moves forward over time and stops are visited in order", () => {
  const a = deriveState(seedEvents(EPOCH), at(0), EPOCH).buses["24"].progressM;
  const b = deriveState(seedEvents(EPOCH), at(120), EPOCH).buses["24"].progressM;
  assert.ok(b > a + 700);
  const late = deriveState(seedEvents(EPOCH), at(600), EPOCH).buses["24"];
  const states = late.stops.map((x) => x.state);
  assert.equal(states[0], "departed");
  assert.notEqual(states[states.length - 1], "departed");
});

test("engine: a breakdown halts the bus, then resuming makes it delayed and moving again", () => {
  const ev: SimEvent[] = [
    ...seedEvents(EPOCH),
    { id: "x1", t: at(30), type: "issue.report", busId: "24", reason: "flatTyre" },
  ];
  const p1 = deriveState(ev, at(40), EPOCH).buses["24"].progressM;
  const p2 = deriveState(ev, at(300), EPOCH).buses["24"];
  assert.equal(p2.status, "breakdown");
  assert.equal(Math.round(p2.progressM), Math.round(p1)); // not moving
  assert.ok(p2.incident && p2.incident.reason === "flatTyre");
  const resumed: SimEvent[] = [...ev, { id: "x2", t: at(300), type: "issue.resume", busId: "24" }];
  const p3 = deriveState(resumed, at(420), EPOCH).buses["24"];
  assert.equal(p3.status, "delayed"); // it lost 270 s
  assert.ok(p3.progressM > p2.progressM);
  assert.equal(p3.incident, null);
});

test("engine: traffic slows the bus without stopping it", () => {
  const ev: SimEvent[] = [...seedEvents(EPOCH), { id: "x1", t: at(0), type: "issue.report", busId: "24", reason: "traffic" }];
  const a = deriveState(ev, at(0), EPOCH).buses["24"];
  const b = deriveState(ev, at(100), EPOCH).buses["24"];
  assert.equal(b.status, "delayed");
  const moved = b.progressM - a.progressM;
  assert.ok(moved > 300 && moved < 340, `moved ${moved}`); // half of 6.5 m/s over 100 s
});

test("engine: next available bus on the same route, or none", () => {
  const ev: SimEvent[] = [...seedEvents(EPOCH), { id: "x1", t: at(10), type: "issue.report", busId: "24", reason: "breakdown" }];
  const s = deriveState(ev, at(20), EPOCH);
  const next = nextAvailableBus(s, "24", "esplanade", "24");
  assert.ok(next && next.bus.def.id === "24B");
  assert.ok(next.sec > 9 * 60 && next.sec < 16 * 60, `next bus in ${next.sec}`);
  assert.equal(nextAvailableBus(s, "45", "kalighat", "45"), null); // nothing else runs on route 45
});

test("engine: an acknowledged SOS records who and when; a driver SOS puts the bus in emergency", () => {
  const ev: SimEvent[] = [...seedEvents(EPOCH), { id: "a1", t: at(50), type: "sos.ack", sosId: "S-0142", note: "Called the driver" }];
  const s = deriveState(ev, at(60), EPOCH);
  assert.equal(s.sos[0].ackAt, at(50));
  assert.equal(s.sos[0].note, "Called the driver");
  assert.equal(s.buses["31"].status, "emergency");
});

test("engine: a lost GPS signal freezes the shown position and makes the estimate a range", () => {
  const ev: SimEvent[] = [...seedEvents(EPOCH), { id: "g1", t: at(10), type: "gps.lost", busId: "24" }];
  const early = deriveState(ev, at(20), EPOCH).buses["24"];
  const later = deriveState(ev, at(200), EPOCH).buses["24"];
  assert.equal(Math.round(early.progressM), Math.round(later.progressM));
  assert.equal(later.gpsLost, true);
  const eta = later.stops.find((x) => x.stop.id === "esplanade")?.eta;
  assert.equal(eta?.uncertain, true);
  const back = deriveState([...ev, { id: "g2", t: at(210), type: "gps.back", busId: "24" }], at(220), EPOCH).buses["24"];
  assert.equal(back.gpsLost, false);
});

test("data: stops sit on their route path, in order", () => {
  for (const r of Object.values(ROUTES)) {
    assert.ok(r.stops.length >= 3, r.id);
    for (let i = 1; i < r.stops.length; i++) assert.ok(r.stops[i].at > r.stops[i - 1].at, `${r.id} stop ${i}`);
    assert.equal(r.stops[0].at, 0);
  }
});

test("engine: an administrator can change a stop's radius and every bus sees it", () => {
  const base = seedEvents(EPOCH);
  const wide: SimEvent[] = [...base, { id: "r1", t: at(-5), type: "stop.radius", routeId: "24", stopId: "esplanade", radius: 150 }];
  const a = deriveState(base, at(0), EPOCH).buses["24"].stops.find((x) => x.stop.id === "esplanade");
  const b = deriveState(wide, at(0), EPOCH).buses["24"].stops.find((x) => x.stop.id === "esplanade");
  assert.equal(a?.radius, 150); // Esplanade already defaults to 150 m in the data
  const narrow: SimEvent[] = [...base, { id: "r2", t: at(-5), type: "stop.radius", routeId: "24", stopId: "bandhaghat", radius: 60 }];
  const c = deriveState(narrow, at(0), EPOCH).buses["24"].stops.find((x) => x.stop.id === "bandhaghat");
  assert.equal(c?.radius, 60);
  assert.equal(b?.radius, 150);
});

test("kpis: dashboard numbers come from the live fleet", () => {
  const k = kpis(deriveState(seedEvents(EPOCH), at(0), EPOCH));
  assert.equal(k.breakdowns, 2); // Bus 45 broken down, Bus 31 in emergency
  assert.equal(k.delayed, 1); // Bus 12 runs 14 minutes late
  assert.equal(k.active, k.trips);
  assert.ok(k.active >= 5);
  assert.ok(k.avgDelayMin >= 1);
});
