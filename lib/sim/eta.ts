export const DWELL_SEC = 20; // typical pause at each stop on the way
const BLEND_FULL_AFTER_SEC = 300; // live speed takes over from typical speed over the first 5 minutes

export type EtaInput = {
  aheadM: number; // distance to the stop along the route
  speed: number; // live speed, m/s
  typicalSpeed: number; // what this stretch usually takes at this hour, m/s
  tripElapsedSec: number;
  stopsBetween: number;
};

/** Seconds until the bus reaches the stop, or null once it has passed. */
export function etaSeconds(i: EtaInput): number | null {
  if (i.aheadM <= 0) return null;
  const w = Math.min(1, i.tripElapsedSec / BLEND_FULL_AFTER_SEC);
  const v = Math.max(1, w * i.speed + (1 - w) * i.typicalSpeed);
  return i.aheadM / v + i.stopsBetween * DWELL_SEC;
}

/** When to admit doubt instead of showing a confident minute. */
export function isUncertain(i: { status: string; silenceSec: number; stopsAhead: number }): boolean {
  return i.status === "delayed" || i.status === "breakdown" || i.status === "emergency" || i.silenceSec > 90 || i.stopsAhead > 4;
}

export type EtaBand =
  | { kind: "now" }
  | { kind: "about"; n: number }
  | { kind: "range"; a: number; b: number }
  | { kind: "over"; n: 30 };

/** What the passenger reads: bands, never false precision, never "now" while still short of the stop. */
export function bandEta(sec: number, uncertain: boolean, aheadM: number): EtaBand {
  const min = sec / 60;
  if (min > 30) return { kind: "over", n: 30 };
  if (aheadM <= 150 && min < 1) return { kind: "now" };
  if (uncertain) {
    const a = Math.max(1, Math.floor(min * 0.8));
    return { kind: "range", a, b: Math.max(a + 1, Math.ceil(min * 1.4)) };
  }
  if (min <= 10) return { kind: "about", n: Math.max(1, Math.round(min)) };
  return { kind: "about", n: Math.round(min / 5) * 5 };
}
