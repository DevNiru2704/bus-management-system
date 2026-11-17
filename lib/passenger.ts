import { DEMO, ROUTES } from "./sim/data.ts";
import type { BusView, StopView } from "./sim/engine.ts";
import type { EtaBand } from "./sim/eta.ts";

type T = (path: string, params?: Record<string, string | number>) => string;

/** The stop a passenger is waiting at for this bus: Esplanade where the route has it, else the next one ahead. */
export function stopFor(bus: BusView): string {
  const route = ROUTES[bus.def.routeId];
  if (route.stops.some((s) => s.id === DEMO.stopId)) return DEMO.stopId;
  const ahead = bus.stops.find((s) => s.state === "upcoming" || s.state === "approaching");
  return (ahead ?? bus.stops[bus.stops.length - 1]).stop.id;
}

/** Short arrival text for a stop row: "8 min", "12-18 min", "30+ min". */
export function etaShort(band: EtaBand, t: T): string {
  switch (band.kind) {
    case "now":
      return t("board.now");
    case "about":
      return t("common.minutes", { n: band.n });
    case "range":
      return t("common.range", { a: band.a, b: band.b });
    case "over":
      return `30+ ${t("board.min").toLowerCase()}`;
  }
}

/** When the bus left a stop, worked out from how far past it the bus now is. */
export const leftAt = (bus: BusView, sv: StopView, now: number) => now - ((bus.progressM - sv.stop.at) / bus.def.speed) * 1000;
