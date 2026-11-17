export type StopState = "upcoming" | "approaching" | "arrived" | "departed";

export const APPROACH_M = 500; // "approaching" starts this far before the stop
export const EXIT_MARGIN_M = 30; // hysteresis: leaving needs radius + 30 m, so a bus parked on the edge does not flicker

/**
 * State of one stop for one bus, from how far the stop is AHEAD of the bus along the route
 * (positive = not reached yet, negative = already passed) and the stop's own radius.
 *
 * The plan's other rules (ignore readings worse than 100 m, need two readings inside) belong to the
 * server that receives noisy phone positions. The simulator's positions are exact, so they are not needed here.
 */
export function stopState(aheadM: number, radiusM: number): StopState {
  if (aheadM > APPROACH_M) return "upcoming";
  if (aheadM > radiusM) return "approaching";
  if (aheadM >= -(radiusM + EXIT_MARGIN_M)) return "arrived";
  return "departed";
}
