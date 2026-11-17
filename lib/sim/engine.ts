import { BUS_BY_ID, FLEET, ROUTES, type BusDef, type Stop } from "./data.ts";
import { distM, pointAt, type LatLng } from "./geo.ts";
import { stopState, type StopState } from "./geofence.ts";
import { bandEta, etaSeconds, isUncertain, type EtaBand } from "./eta.ts";

export type BusStatus = "active" | "delayed" | "breakdown" | "inactive" | "completed" | "emergency";
export type IssueReason = "mechanical" | "breakdown" | "flatTyre" | "traffic" | "emergency" | "other";
export type SosKind = "accident" | "medical" | "security" | "vehicle" | "passenger";

type Base = { id: string; t: number };
export type SimEvent =
  | (Base & { type: "trip.start"; busId: string })
  | (Base & { type: "trip.complete"; busId: string })
  | (Base & { type: "issue.report"; busId: string; reason: IssueReason })
  | (Base & { type: "issue.resume"; busId: string })
  | (Base & { type: "sos.raise"; sosId: string; source: "driver" | "passenger"; busId: string; kind: SosKind })
  | (Base & { type: "sos.ack"; sosId: string; note: string })
  | (Base & { type: "gps.lost"; busId: string })
  | (Base & { type: "gps.back"; busId: string })
  | (Base & { type: "stop.radius"; routeId: string; stopId: string; radius: number });

export type Incident = { id: string; busId: string; reason: IssueReason; reportedAt: number; resolvedAt: number | null };
export type SosAlert = {
  id: string;
  busId: string;
  source: "driver" | "passenger";
  kind: SosKind;
  raisedAt: number;
  ackAt: number | null;
  note: string | null;
  pos: LatLng;
  place: string;
};
export type EtaView = { sec: number; band: EtaBand; uncertain: boolean };
export type StopView = { stop: Stop; radius: number; state: StopState; eta: EtaView | null };
export type BusView = {
  def: BusDef;
  status: BusStatus;
  pos: LatLng;
  progressM: number;
  lastSeenAt: number | null;
  gpsLost: boolean;
  tripStartAt: number | null;
  tripEndAt: number | null;
  startsInSec: number | null;
  delaySec: number;
  stops: StopView[];
  incident: Incident | null;
  sos: SosAlert | null;
};
export type Snapshot = {
  now: number;
  epoch: number;
  buses: Record<string, BusView>;
  list: BusView[];
  incidents: Incident[];
  sos: SosAlert[];
  /** Stop radii an administrator has changed, keyed "routeId:stopId". */
  radii: Record<string, number>;
};

const HALT_REASONS: IssueReason[] = ["mechanical", "breakdown", "flatTyre", "emergency"];
const FACTOR = { normal: 1, slow: 0.5, halt: 0 } as const;
type Mode = keyof typeof FACTOR;

/** Events a fresh demo starts with, so every screen has something real to show. */
export function seedEvents(epoch: number): SimEvent[] {
  return [
    { id: "seed-1", t: epoch - 60_000, type: "trip.start", busId: "24" },
    { id: "seed-2", t: epoch + 240_000, type: "trip.start", busId: "24B" },
    { id: "seed-3", t: epoch - 12 * 60_000, type: "trip.start", busId: "45" },
    { id: "seed-4", t: epoch - 3 * 60_000, type: "issue.report", busId: "45", reason: "breakdown" },
    { id: "seed-5", t: epoch - 9 * 60_000, type: "trip.start", busId: "31" },
    { id: "seed-6", t: epoch - 20_000, type: "sos.raise", sosId: "S-0142", source: "driver", busId: "31", kind: "accident" },
  ];
}

export function nearestStopName(routeId: string, pos: LatLng): string {
  const stops = ROUTES[routeId].stops;
  let best = stops[0];
  let bestD = Infinity;
  for (const s of stops) {
    const d = distM(pos, [s.lat, s.lng]);
    if (d < bestD) {
      bestD = d;
      best = s;
    }
  }
  return best.name;
}

function deriveBus(def: BusDef, events: SimEvent[], now: number, epoch: number, radii: Record<string, number>): { view: BusView; incidents: Incident[] } {
  const route = ROUTES[def.routeId];
  const len = route.path.length;
  const mine = events
    .filter((e) => "busId" in e && e.busId === def.id)
    .sort((a, b) => a.t - b.t);

  let startedAt: number | null = null;
  let endedAt: number | null = null;
  let mode: Mode = "normal";
  let emergency = false;
  let progress = 0;
  let lostSec = 0;
  let lastT = 0;
  let gpsLostSince: number | null = null;
  let progressAtLoss = 0;
  const incidents: Incident[] = [];

  const advance = (toT: number) => {
    if (startedAt === null || endedAt !== null) return;
    const dt = Math.max(0, toT - lastT) / 1000;
    progress += dt * def.speed * FACTOR[mode];
    lostSec += dt * (1 - FACTOR[mode]);
    lastT = toT;
    if (progress >= len) {
      progress = len;
      endedAt = toT;
    }
  };

  if (def.profile === "events") {
    for (const e of mine) {
      if (e.t > now) break;
      advance(e.t);
      if (e.type === "trip.start" && startedAt === null) {
        startedAt = e.t;
        lastT = e.t;
      } else if (e.type === "trip.complete" && endedAt === null) endedAt = e.t;
      else if (e.type === "issue.report") {
        mode = HALT_REASONS.includes(e.reason) ? "halt" : "slow";
        incidents.push({ id: `${def.id}-${e.id}`, busId: def.id, reason: e.reason, reportedAt: e.t, resolvedAt: null });
      } else if (e.type === "issue.resume") {
        mode = "normal";
        emergency = false;
        const open = [...incidents].reverse().find((i) => i.resolvedAt === null);
        if (open) open.resolvedAt = e.t;
      } else if (e.type === "sos.raise" && e.source === "driver") {
        mode = "halt";
        emergency = true;
      } else if (e.type === "gps.lost") {
        gpsLostSince = e.t;
        progressAtLoss = progress;
      } else if (e.type === "gps.back") gpsLostSince = null;
    }
    advance(now);
  } else if (def.profile === "loop") {
    startedAt = epoch;
    progress = (((now - epoch) / 1000 + (def.loopOffsetSec ?? 0)) * def.speed) % len;
    lostSec = def.baseDelaySec ?? 0;
  } else if (def.profile === "completed") {
    startedAt = epoch - 3_600_000;
    endedAt = epoch - 600_000;
    progress = len;
  }

  const futureStart = mine.find((e) => e.type === "trip.start" && e.t > now);
  const startsInSec = startedAt === null && futureStart ? (futureStart.t - now) / 1000 : null;

  let status: BusStatus;
  if (startedAt === null) status = "inactive";
  else if (endedAt !== null) status = "completed";
  else if (emergency) status = "emergency";
  else if (mode === "halt") status = "breakdown";
  else if (mode === "slow" || lostSec > 180) status = "delayed";
  else status = "active";

  const gpsLost = gpsLostSince !== null;
  const shownProgress = gpsLost ? progressAtLoss : progress;
  const silenceSec = gpsLost ? (now - (gpsLostSince as number)) / 1000 : 0;
  const running = status === "active" || status === "delayed";
  const speedNow = def.speed * FACTOR[mode];
  const elapsed = startedAt ? (now - startedAt) / 1000 : 0;

  const stops: StopView[] = route.stops.map((stop) => {
    const aheadM = stop.at - shownProgress;
    const radius = radii[`${def.routeId}:${stop.id}`] ?? stop.radius;
    const state: StopState = startedAt === null ? "upcoming" : stopState(aheadM, radius);
    let eta: EtaView | null = null;
    const canPredict = aheadM > 0 && (running || startsInSec !== null);
    if (canPredict) {
      const between = route.stops.filter((s) => s.at > shownProgress && s.at < stop.at).length;
      const raw = etaSeconds({ aheadM, speed: running ? Math.max(speedNow, 0.1) : def.speed, typicalSpeed: def.speed, tripElapsedSec: elapsed, stopsBetween: between });
      if (raw !== null) {
        const sec = Math.max(0, raw - silenceSec) + (startsInSec ?? 0);
        const uncertain = isUncertain({ status, silenceSec, stopsAhead: between + 1 });
        eta = { sec, uncertain, band: bandEta(sec, uncertain, aheadM) };
      }
    }
    return { stop, radius, state, eta };
  });

  const view: BusView = {
    def,
    status,
    pos: pointAt(route.path, shownProgress),
    progressM: shownProgress,
    lastSeenAt: startedAt === null || endedAt !== null ? null : gpsLost ? (gpsLostSince as number) : now,
    gpsLost,
    tripStartAt: startedAt,
    tripEndAt: endedAt,
    startsInSec,
    delaySec: Math.round(lostSec),
    stops,
    incident: [...incidents].reverse().find((i) => i.resolvedAt === null) ?? null,
    sos: null,
  };
  return { view, incidents };
}

export function deriveState(events: SimEvent[], now: number, epoch: number): Snapshot {
  const radii: Record<string, number> = {};
  for (const e of events) if (e.type === "stop.radius" && e.t <= now) radii[`${e.routeId}:${e.stopId}`] = e.radius;
  const buses: Record<string, BusView> = {};
  const incidents: Incident[] = [];
  for (const def of FLEET) {
    const r = deriveBus(def, events, now, epoch, radii);
    buses[def.id] = r.view;
    incidents.push(...r.incidents);
  }

  const acks = new Map<string, Extract<SimEvent, { type: "sos.ack" }>>();
  for (const e of events) if (e.type === "sos.ack" && e.t <= now) acks.set(e.sosId, e);
  const sos: SosAlert[] = [];
  for (const e of events) {
    if (e.type !== "sos.raise" || e.t > now) continue;
    const bus = buses[e.busId];
    const ack = acks.get(e.sosId);
    const alert: SosAlert = {
      id: e.sosId,
      busId: e.busId,
      source: e.source,
      kind: e.kind,
      raisedAt: e.t,
      ackAt: ack ? ack.t : null,
      note: ack ? ack.note : null,
      pos: bus.pos,
      place: nearestStopName(bus.def.routeId, bus.pos),
    };
    sos.push(alert);
    if (e.source === "driver") bus.sos = alert;
  }

  incidents.sort((a, b) => b.reportedAt - a.reportedAt);
  sos.sort((a, b) => b.raisedAt - a.raisedAt);
  const list = FLEET.map((d) => buses[d.id]);
  return { now, epoch, buses, list, incidents, sos, radii };
}

/** The earliest other bus on the same route that has not yet passed the stop. */
export function nextAvailableBus(snap: Snapshot, routeId: string, stopId: string, excludeBusId: string): { bus: BusView; sec: number } | null {
  let best: { bus: BusView; sec: number } | null = null;
  for (const bus of snap.list) {
    if (bus.def.routeId !== routeId || bus.def.id === excludeBusId) continue;
    const sv = bus.stops.find((s) => s.stop.id === stopId);
    if (!sv || !sv.eta) continue;
    if (!best || sv.eta.sec < best.sec) best = { bus, sec: sv.eta.sec };
  }
  return best;
}

export const busDef = (id: string) => BUS_BY_ID[id];
