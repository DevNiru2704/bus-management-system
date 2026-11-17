"use client";

import Link from "next/link";
import { useState } from "react";
import { BusBoard } from "./bus-board";
import { BusMark, SearchIcon } from "./icons";
import { useI18n } from "./i18n-provider";
import { StatusChip } from "./status-chip";
import { localeNames } from "@/lib/i18n";
import { stopName } from "@/lib/format";
import { DEMO, ROUTES } from "@/lib/sim/data.ts";
import type { BusView } from "@/lib/sim/engine.ts";
import { useSnapshot } from "@/lib/sim/use-sim.ts";

function matches(bus: BusView, q: string) {
  const route = ROUTES[bus.def.routeId];
  const hay = [bus.def.label, route.code, ...route.stops.flatMap((s) => [s.name, s.bn ?? ""])].join(" ").toLowerCase();
  return hay.includes(q);
}

export function HomeScreen() {
  const { t, lang } = useI18n();
  const snap = useSnapshot();
  const [q, setQ] = useState("");
  const mine = snap?.buses[DEMO.busId];
  const query = q.trim().toLowerCase();
  const others = snap ? snap.list.filter((b) => b.def.id !== DEMO.busId && (!query || matches(b, query))) : [];
  const stop = ROUTES["24"].stops.find((s) => s.id === DEMO.stopId)!;

  return (
    <main className="flex flex-col gap-4 px-4 pt-14 pb-6">
      <header className="flex items-center gap-2.5">
        <BusMark size={40} />
        <span className="t-title flex-1">{t("common.appName")}</span>
        <Link href={`/${lang}/language`} className="t-label rounded-full border border-line bg-card px-3.5 py-2">{localeNames[lang]}</Link>
      </header>
      <h1 className="t-display-l">{t("home.title")}</h1>
      <label className="flex items-center gap-3 rounded-md border border-line bg-card px-4 py-3.5 focus-within:border-brand">
        <SearchIcon className="shrink-0 text-ink-2" />
        <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("home.search")} aria-label={t("home.search")} className="t-body min-w-0 flex-1 bg-transparent outline-none placeholder:text-ink-2" />
      </label>

      {!query && (
        <>
          <h2 className="t-label text-ink-2">{t("home.yourStop", { stop: stopName(stop, lang) })}</h2>
          {mine ? (
            <Link href={`/${lang}/passenger/bus/${mine.def.id}`} aria-label={mine.def.label} className="block rounded-md transition duration-150 ease-out hover:brightness-110">
              <BusBoard bus={mine} stopId={DEMO.stopId} />
            </Link>
          ) : (
            <div className="h-[132px] rounded-md bg-sunken" aria-hidden />
          )}
          <h2 className="t-label text-ink-2">{t("home.alsoNear")}</h2>
        </>
      )}

      {!snap ? (
        <div className="h-48 rounded-md bg-sunken" aria-hidden />
      ) : others.length === 0 ? (
        <p className="t-body text-ink-2">{t("home.noResults")}</p>
      ) : (
        <ul className="overflow-hidden rounded-md border border-line bg-card">
          {others.map((b) => {
            const r = ROUTES[b.def.routeId];
            return (
              <li key={b.def.id} className="border-b border-line last:border-b-0">
                <Link href={`/${lang}/passenger/bus/${b.def.id}`} className="flex min-h-14 items-center gap-3 px-4 py-3 transition-colors duration-150 ease-out hover:bg-page">
                  <span className="t-label w-14 shrink-0 rounded-sm border-[1.5px] border-taxi bg-taxi-tint py-1 text-center text-on-taxi">{b.def.id}</span>
                  <span className="t-body-m min-w-0 flex-1">{stopName(r.stops[r.stops.length - 1], lang)}</span>
                  <StatusChip status={b.status} />
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
