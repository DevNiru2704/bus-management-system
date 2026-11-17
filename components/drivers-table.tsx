"use client";

import { useState } from "react";
import { DataTable } from "./data-table";
import { useI18n } from "./i18n-provider";
import { DRIVERS, FLEET } from "@/lib/sim/data.ts";
import { useSnapshot } from "@/lib/sim/use-sim.ts";

export function DriversTable() {
  const { t } = useI18n();
  const snap = useSnapshot();
  const [q, setQ] = useState("");
  const query = q.trim().toLowerCase();
  const rows = Object.values(DRIVERS)
    .filter((d) => !query || [d.name, d.licence, d.phone].join(" ").toLowerCase().includes(query))
    .map((d) => {
      const def = FLEET.find((b) => b.driverId === d.id);
      const bus = def && snap ? snap.buses[def.id] : null;
      const onTrip = !!bus && bus.tripStartAt !== null && bus.tripEndAt === null;
      const halted = !!bus && (bus.status === "breakdown" || bus.status === "emergency");
      return { d, def, duty: onTrip ? (halted ? t("admin.drivers.onTripPaused") : t("admin.drivers.onTrip")) : t("admin.drivers.offDuty") };
    });
  return (
    <main className="flex flex-col gap-5 p-6 lg:p-8">
      <div className="flex items-center gap-3">
        <h1 className="t-display-l flex-1">{t("admin.drivers.title")}</h1>
        <button type="button" disabled title={t("admin.buses.soon")} className="t-body-m min-h-[52px] rounded-md bg-taxi px-6 text-on-taxi opacity-40">{t("admin.drivers.add")}</button>
      </div>
      <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("admin.drivers.search")} aria-label={t("admin.drivers.search")} className="t-secondary-m min-h-11 max-w-md rounded-md border border-line bg-card px-4 outline-none focus:border-brand" />
      <DataTable
        empty={t("admin.buses.empty")}
        columns={[{ key: "d", label: t("admin.drivers.cols.driver") }, { key: "l", label: t("admin.drivers.cols.licence") }, { key: "p", label: t("admin.drivers.cols.phone") }, { key: "b", label: t("admin.drivers.cols.bus") }, { key: "o", label: t("admin.drivers.cols.duty") }]}
        rows={rows.map(({ d, def, duty }) => ({ key: d.id, cells: [d.name, d.licence, d.phone, def ? def.label : t("admin.drivers.unassigned"), duty] }))}
      />
    </main>
  );
}
