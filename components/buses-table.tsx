"use client";

import { useState } from "react";
import { DataTable } from "./data-table";
import { useI18n } from "./i18n-provider";
import { StatusChip } from "./status-chip";
import { stopName } from "@/lib/format";
import { DRIVERS, FLEET, ROUTES } from "@/lib/sim/data.ts";
import type { BusStatus } from "@/lib/sim/engine.ts";
import { useSnapshot } from "@/lib/sim/use-sim.ts";

const statuses: BusStatus[] = ["active", "delayed", "breakdown", "inactive", "completed", "emergency"];
const select = "t-secondary-m min-h-11 rounded-md border border-line bg-card px-4 outline-none focus:border-brand";

export function BusesTable() {
  const { t, lang } = useI18n();
  const snap = useSnapshot();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [route, setRoute] = useState("");
  const query = q.trim().toLowerCase();
  const rows = FLEET.filter((b) => {
    const driver = b.driverId ? DRIVERS[b.driverId].name : "";
    const st = snap?.buses[b.id].status;
    return (!query || [b.label, b.plate, driver].join(" ").toLowerCase().includes(query)) && (!status || st === status) && (!route || b.routeId === route);
  });
  return (
    <main className="flex flex-col gap-5 p-6 lg:p-8">
      <div className="flex items-center gap-3">
        <h1 className="t-display-l flex-1">{t("admin.buses.title")}</h1>
        <button type="button" disabled title={t("admin.buses.soon")} className="t-body-m min-h-[52px] rounded-md bg-taxi px-6 text-on-taxi opacity-40">{t("admin.buses.register")}</button>
      </div>
      <div className="flex flex-wrap gap-3">
        <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("admin.buses.search")} aria-label={t("admin.buses.search")} className={`${select} min-w-72 flex-1 sm:flex-none`} />
        <select aria-label={t("admin.buses.allStatuses")} value={status} onChange={(e) => setStatus(e.target.value)} className={select}>
          <option value="">{t("admin.buses.allStatuses")}</option>
          {statuses.map((s) => <option key={s} value={s}>{t(`status.${s}`)}</option>)}
        </select>
        <select aria-label={t("admin.buses.allRoutes")} value={route} onChange={(e) => setRoute(e.target.value)} className={select}>
          <option value="">{t("admin.buses.allRoutes")}</option>
          {Object.values(ROUTES).map((r) => <option key={r.id} value={r.id}>{r.code}</option>)}
        </select>
      </div>
      <DataTable
        empty={t("admin.buses.empty")}
        columns={[{ key: "b", label: t("admin.buses.cols.bus") }, { key: "r", label: t("admin.buses.cols.registration") }, { key: "ro", label: t("admin.buses.cols.route") }, { key: "d", label: t("admin.buses.cols.driver") }, { key: "s", label: t("admin.buses.cols.status") }, { key: "se", label: t("admin.buses.cols.seats") }]}
        rows={rows.map((b) => {
          const r = ROUTES[b.routeId];
          return {
            key: b.id,
            cells: [b.label, b.plate, `${r.code}  ${stopName(r.stops[0], lang)} - ${stopName(r.stops[r.stops.length - 1], lang)}`, b.driverId ? DRIVERS[b.driverId].name : t("admin.buses.unassigned"), snap ? <StatusChip key="s" status={snap.buses[b.id].status} /> : "", b.seats ?? "-"],
          };
        })}
      />
      <p className="t-secondary text-ink-2">{t("admin.buses.seatsNote")}</p>
    </main>
  );
}
