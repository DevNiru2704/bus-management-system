"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { FleetMap } from "./fleet-map-loader";
import { useI18n } from "./i18n-provider";
import { cn } from "@/lib/cn";
import { stopName } from "@/lib/format";
import { ROUTES } from "@/lib/sim/data.ts";
import { dispatch } from "@/lib/sim/store.ts";
import { useSnapshot } from "@/lib/sim/use-sim.ts";

const PRESETS = [60, 100, 150];

/** Pick a stop, pick a radius. The change goes to every open screen at once. */
export function RouteEditor({ routeId }: { routeId: string }) {
  const { t, lang } = useI18n();
  const router = useRouter();
  const snap = useSnapshot();
  const route = ROUTES[routeId];
  const [sel, setSel] = useState(route.stops[Math.min(2, route.stops.length - 1)].id);
  const [zoomed, setZoomed] = useState(false); // the whole route first; after a stop is picked, zoom in so its ring is visible
  const radius = (id: string) => snap?.radii[`${routeId}:${id}`] ?? route.stops.find((s) => s.id === id)!.radius;
  const stop = route.stops.find((s) => s.id === sel) ?? route.stops[0];

  return (
    <main className="flex flex-col lg:relative lg:h-dvh lg:flex-row lg:overflow-hidden">
      <section className="z-10 flex flex-col gap-4 border-line bg-card p-5 lg:w-[380px] lg:shrink-0 lg:overflow-y-auto lg:border-r">
        <label className="flex flex-col gap-1.5">
          <span className="t-label text-ink-2">{t("admin.routes.chooseRoute")}</span>
          <select value={routeId} onChange={(e) => router.push(`/${lang}/admin/routes/${e.target.value}`)} className="t-body-m min-h-11 rounded-md border border-line bg-card px-3 outline-none focus:border-brand">
            {Object.values(ROUTES).map((r) => <option key={r.id} value={r.id}>{r.code}</option>)}
          </select>
        </label>
        <h1 className="t-display-m">{t("admin.routes.title", { code: route.code })}</h1>
        <p className="t-secondary text-ink-2">{t("admin.routes.sub", { from: stopName(route.stops[0], lang), to: stopName(route.stops[route.stops.length - 1], lang) })}</p>
        <h2 className="t-label text-ink-2">{t("admin.routes.stops")}</h2>
        <ol className="flex flex-col gap-2">
          {route.stops.map((s, i) => (
            <li key={s.id}>
              <button type="button" aria-pressed={s.id === sel} onClick={() => {
                  setSel(s.id);
                  setZoomed(true);
                }} className={cn("flex min-h-14 w-full items-center gap-3 rounded-md border px-3.5 text-left transition-colors duration-150 ease-out", s.id === sel ? "border-2 border-brand bg-brand-tint" : "border-line bg-card")}>
                <span className="t-label grid size-7 shrink-0 place-items-center rounded-full bg-brand text-white">{i + 1}</span>
                <span className="t-body-m flex-1">{stopName(s, lang)}</span>
                <span className="t-secondary-m rounded-full bg-taxi-tint px-2.5 py-1 text-on-taxi">{t("admin.routes.radius", { m: radius(s.id) })}</span>
              </button>
            </li>
          ))}
        </ol>
      </section>

      <div className="relative min-h-[60dvh] flex-1">
        <FleetMap className="absolute inset-0" routeId={routeId} focus={zoomed ? [stop.lat, stop.lng] : undefined} zoom={16} buses={snap?.list.filter((b) => b.def.routeId === routeId) ?? []} geofences={route.stops.map((s) => ({ id: s.id, pos: [s.lat, s.lng], radius: radius(s.id), on: s.id === sel }))} label={t("admin.routes.title", { code: route.code })} />
        <section className="absolute right-4 bottom-4 left-4 z-10 flex max-w-[520px] flex-col gap-3 rounded-md bg-card p-5 shadow-raised lg:left-auto">
          <div className="flex items-center gap-3">
            <h2 className="t-title flex-1">{t("admin.routes.geofence", { stop: stopName(stop, lang) })}</h2>
            <span className="t-meta text-ink-2">{stop.lat.toFixed(4)}, {stop.lng.toFixed(4)}</span>
          </div>
          <div role="radiogroup" aria-label={t("admin.routes.geofence", { stop: stopName(stop, lang) })} className="flex gap-2">
            {PRESETS.map((m) => (
              <button key={m} type="button" role="radio" aria-checked={radius(stop.id) === m} onClick={() => dispatch({ type: "stop.radius", routeId, stopId: stop.id, radius: m })} className={cn("t-label min-h-11 rounded-full px-5 transition-colors duration-150 ease-out", radius(stop.id) === m ? "bg-brand text-white" : "bg-sunken text-ink")}>{m} m</button>
            ))}
          </div>
          <p className="t-secondary text-ink-2">{t("admin.routes.help")}</p>
          <p className="t-meta text-ink-2">{t("admin.routes.saved")}</p>
        </section>
      </div>
    </main>
  );
}
