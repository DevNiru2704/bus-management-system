"use client";

import { DotBoard } from "./dot-board";
import { useI18n } from "./i18n-provider";
import { ROUTES } from "@/lib/sim/data.ts";
import type { BusView } from "@/lib/sim/engine.ts";
import { boardEta, stopName } from "@/lib/format";

/** Board for one bus, as seen by a passenger waiting at `stopId`. */
export function BusBoard({ bus, stopId, className }: { bus: BusView; stopId: string; className?: string }) {
  const { t, lang } = useI18n();
  const route = ROUTES[bus.def.routeId];
  const dest = stopName(route.stops[route.stops.length - 1], lang);
  const eta = bus.stops.find((s) => s.stop.id === stopId)?.eta ?? null;
  const stopped = bus.status === "breakdown" || bus.status === "emergency";
  const { value, unit } = boardEta(stopped || bus.status === "completed" ? null : (eta?.band ?? null), t);

  let note: string;
  if (stopped) note = t("board.stopped");
  else if (bus.status === "completed") note = t("status.completed");
  else if (bus.status === "inactive") note = t("board.notStarted");
  else if (eta?.uncertain) note = bus.status === "delayed" ? t("board.late", { n: Math.max(1, Math.round(bus.delaySec / 60)) }) : t("board.estimate");
  else note = bus.delaySec > 180 ? t("board.late", { n: Math.round(bus.delaySec / 60) }) : t("board.onTime");

  return <DotBoard className={className} route={route.code} dest={dest} eta={value} unit={unit} note={note} dim={value === "--"} />;
}
