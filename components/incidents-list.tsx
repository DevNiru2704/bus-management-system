"use client";

import Link from "next/link";
import { DataTable } from "./data-table";
import { sosKindLabel } from "./attention-items";
import { useI18n } from "./i18n-provider";
import { StatusChip } from "./status-chip";
import { clock, placeName } from "@/lib/format";
import { nearestStopName } from "@/lib/sim/engine.ts";
import { useSnapshot } from "@/lib/sim/use-sim.ts";

export function IncidentsList() {
  const { t, lang } = useI18n();
  const snap = useSnapshot();
  const rows = snap
    ? [
        ...snap.sos.map((s) => ({ key: s.id, at: s.raisedAt, kind: "sos" as const, bus: snap.buses[s.busId], id: s.id, open: s.ackAt === null, text: sosKindLabel(t, s) })),
        ...snap.incidents.map((i) => ({ key: i.id, at: i.reportedAt, kind: "issue" as const, bus: snap.buses[i.busId], id: i.id, open: i.resolvedAt === null, text: t(`driver.reasons.${i.reason}`) })),
      ].sort((a, b) => b.at - a.at)
    : [];
  return (
    <main className="flex flex-col gap-5 p-6 lg:p-8">
      <h1 className="t-display-l">{t("admin.incidents.title")}</h1>
      <DataTable
        empty={t("admin.incidents.empty")}
        columns={[{ key: "t", label: t("admin.detail.type") }, { key: "b", label: t("admin.buses.cols.bus") }, { key: "d", label: t("admin.detail.reason") }, { key: "p", label: t("admin.detail.position") }, { key: "w", label: t("admin.detail.reportedAt") }, { key: "s", label: t("admin.buses.cols.status") }]}
        rows={rows.map((r) => ({
          key: r.key,
          cells: [
            <Link key="t" href={`/${lang}/admin/incidents/${r.id}`} className="text-brand underline underline-offset-4">{t(`admin.incidents.${r.kind}`)}</Link>,
            r.bus.def.label,
            r.text,
            placeName(r.bus.def.routeId, nearestStopName(r.bus.def.routeId, r.bus.pos), lang),
            clock(r.at),
            r.kind === "sos" && r.open ? <StatusChip key="s" status="emergency" /> : <span key="s" className="t-secondary-m">{t(r.open ? "admin.incidents.open" : "admin.incidents.resolved")}</span>,
          ],
        }))}
      />
    </main>
  );
}
