import type { Snapshot } from "./engine.ts";

/** The numbers across the top of the admin dashboard, worked out from the live fleet. */
export function kpis(snap: Snapshot) {
  const onTrip = snap.list.filter((b) => b.tripStartAt !== null && b.tripEndAt === null);
  const delays = onTrip.map((b) => b.delaySec);
  return {
    active: onTrip.length,
    delayed: snap.list.filter((b) => b.status === "delayed").length,
    breakdowns: snap.list.filter((b) => b.status === "breakdown" || b.status === "emergency").length,
    avgDelayMin: delays.length ? Math.round(delays.reduce((a, b) => a + b, 0) / delays.length / 60) : 0,
    trips: onTrip.length,
  };
}
