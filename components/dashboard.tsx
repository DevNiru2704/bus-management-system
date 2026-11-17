"use client";

import Link from "next/link";
import { FleetMap } from "./fleet-map-loader";
import { useI18n } from "./i18n-provider";
import { IssueItem, SosItem } from "./attention-items";
import { StatusChip } from "./status-chip";
import { cn } from "@/lib/cn";
import { ROUTES } from "@/lib/sim/data.ts";
import { kpis } from "@/lib/sim/kpis.ts";
import { useSnapshot } from "@/lib/sim/use-sim.ts";

export function Dashboard() {
  const { t, lang } = useI18n();
  const snap = useSnapshot();
  const k = snap ? kpis(snap) : null;
  const openSos = snap?.sos.filter((s) => s.ackAt === null) ?? [];
  const openIssues = snap?.incidents.filter((i) => i.resolvedAt === null) ?? [];
  const attention = openSos.length + openIssues.length;
  const stats = k
    ? [
        [t("admin.kpi.active"), String(k.active), ""],
        [t("admin.kpi.delayed"), String(k.delayed), "text-st-delayed"],
        [t("admin.kpi.breakdowns"), String(k.breakdowns), "text-st-breakdown"],
        [t("admin.kpi.avgDelay"), t("common.minutes", { n: k.avgDelayMin }), ""],
        [t("admin.kpi.trips"), String(k.trips), ""],
      ]
    : [];

  return (
    <main className="flex flex-col lg:relative lg:h-dvh lg:overflow-hidden">
      <FleetMap className="h-[55dvh] lg:absolute lg:inset-0 lg:h-auto" buses={snap?.list ?? []} padRight={440} label={t("admin.busesOnRoad")} />
      <section aria-label="Key figures" className="z-10 flex flex-wrap rounded-md bg-card shadow-raised max-lg:m-4 lg:absolute lg:top-6 lg:left-6">
        {stats.map(([label, value, tone], i) => (
          <div key={label} className={cn("flex flex-col px-6 py-3.5", i > 0 && "border-l border-line")}>
            <span className="t-secondary text-ink-2">{label}</span>
            <span className={cn("t-display-m", tone)}>{value}</span>
          </div>
        ))}
      </section>

      <aside aria-label={t("admin.attention.title")} className="z-10 flex flex-col gap-4 bg-card p-5 shadow-raised max-lg:m-4 max-lg:rounded-lg lg:absolute lg:top-6 lg:right-6 lg:bottom-6 lg:w-[400px] lg:overflow-y-auto lg:rounded-lg">
        <div className="flex items-center gap-2">
          <h2 className="t-display-m flex-1">{t("admin.attention.title")}</h2>
          {attention > 0 ? <span className="t-label rounded-full bg-st-breakdown-bg px-3 py-1 text-st-breakdown">{t("admin.attention.open", { n: attention })}</span> : null}
        </div>
        {snap ? (
          <>
            {openSos.map((a) => <SosItem key={a.id} alert={a} bus={snap.buses[a.busId]} />)}
            {openIssues.map((i) => <IssueItem key={i.id} incident={i} bus={snap.buses[i.busId]} />)}
            {attention === 0 ? <p className="t-body text-ink-2">{t("admin.attention.none")}</p> : null}
            <h3 className="t-label text-ink-2">{t("admin.busesOnRoad")}</h3>
            <ul>
              {snap.list.filter((b) => b.status !== "inactive" && b.status !== "completed").map((b) => (
                <li key={b.def.id} className="flex items-center gap-2.5 border-b border-line py-2.5 last:border-b-0">
                  <span className="t-body-m">{b.def.label}</span>
                  <span className="t-secondary text-ink-2">{t("admin.routes.title", { code: ROUTES[b.def.routeId].code })}</span>
                  <span className="ml-auto"><StatusChip status={b.status} /></span>
                  <span className="t-secondary-m w-16 text-right text-ink-2">{b.status === "breakdown" || b.status === "emergency" ? t("admin.paused") : b.delaySec > 180 ? t("common.minutes", { n: Math.round(b.delaySec / 60) }) : t("admin.onTime")}</span>
                </li>
              ))}
            </ul>
            <Link href={`/${lang}/admin/incidents`} className="t-label min-h-11 self-start py-2.5 text-brand underline underline-offset-4">{t("admin.incidents.title")}</Link>
          </>
        ) : <div className="h-40 rounded-md bg-sunken" aria-hidden />}
      </aside>
    </main>
  );
}
