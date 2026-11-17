import { FLEET, ROUTES } from "./data.ts";
import { deriveState, nextAvailableBus, type SimEvent, type Snapshot } from "./engine.ts";

export type NoteType = "delayed" | "breakdown" | "resumed" | "approaching" | "nearby";
export type Note = { id: string; t: number; type: NoteType; busId: string; n: number | null };

/** Buses whose route passes the passenger's stop: those are the ones this passenger cares about. */
export const followedBuses = (stopId: string) =>
  FLEET.filter((b) => ROUTES[b.routeId].stops.some((s) => s.id === stopId)).map((b) => b.id);

const minutes = (sec: number | undefined | null) => (sec == null ? null : Math.max(1, Math.round(sec / 60)));

/** Alerts that come straight from the event log: someone reported a problem or resumed service. */
export function logNotes(log: SimEvent[], epoch: number, now: number, stopId: string): Note[] {
  const followed = new Set(followedBuses(stopId));
  const notes: Note[] = [];
  for (const e of log) {
    if (e.t > now || (e.type !== "issue.report" && e.type !== "issue.resume") || !followed.has(e.busId)) continue;
    const snap = deriveState(log, e.t, epoch);
    const bus = snap.buses[e.busId];
    if (e.type === "issue.resume") {
      notes.push({ id: e.id, t: e.t, type: "resumed", busId: e.busId, n: minutes(bus.stops.find((s) => s.stop.id === stopId)?.eta?.sec) });
    } else if (bus.status === "breakdown") {
      const next = nextAvailableBus(snap, bus.def.routeId, stopId, bus.def.id);
      notes.push({ id: e.id, t: e.t, type: "breakdown", busId: e.busId, n: minutes(next?.sec) });
    } else {
      notes.push({ id: e.id, t: e.t, type: "delayed", busId: e.busId, n: null });
    }
  }
  return notes;
}

/** "Your bus is N minutes away" alerts, for the bus the passenger is waiting for. `fired` stops repeats. */
export function proximityNotes(snap: Snapshot, stopId: string, fired: Set<string>, busIds: string[]): Note[] {
  const out: Note[] = [];
  for (const id of busIds) {
    const bus = snap.buses[id];
    const sv = bus.stops.find((s) => s.stop.id === stopId);
    if (!sv || !sv.eta || (bus.status !== "active" && bus.status !== "delayed")) continue;
    const trip = bus.tripStartAt ?? 0;
    if (sv.state === "approaching" || sv.eta.sec <= 120) {
      const key = `nearby:${id}:${trip}`;
      if (!fired.has(key)) out.push({ id: key, t: snap.now, type: "nearby", busId: id, n: null });
    } else if (sv.eta.sec <= 300) {
      const key = `approaching:${id}:${trip}`;
      if (!fired.has(key)) out.push({ id: key, t: snap.now, type: "approaching", busId: id, n: minutes(sv.eta.sec) });
    }
  }
  return out;
}
