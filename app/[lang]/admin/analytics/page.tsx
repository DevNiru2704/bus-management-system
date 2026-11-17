import { notFound } from "next/navigation";
import { AlertBanner } from "@/components/alert-banner";
import { cn } from "@/lib/cn";
import { affectedBuses, delayByHour, delayByRoute, summary } from "@/lib/analytics-sample";
import { hasLocale, makeT } from "@/lib/i18n";
import { getDictionary } from "../../dictionaries";

function Bars({ title, sub, data, unit, label }: { title: string; sub: string; data: [string, number][]; unit: string; label: (k: string) => string }) {
  const max = Math.max(...data.map(([, v]) => v));
  return (
    <section className="flex flex-1 flex-col gap-3.5 rounded-md border border-line bg-card p-6">
      <h2 className="t-title">{title}</h2>
      <p className="t-secondary text-ink-2">{sub}</p>
      <ul className="flex flex-col gap-3">
        {data.map(([k, v]) => (
          <li key={k} className="flex items-center gap-3">
            <span className="t-secondary w-24 shrink-0 text-ink-2">{label(k)}</span>
            <span className="h-3.5 flex-1 overflow-hidden rounded-full bg-sunken">
              <span className={cn("block h-full rounded-full", v === max ? "bg-st-delayed" : "bg-brand")} style={{ width: `${Math.max(4, Math.round((v / max) * 100))}%` }} />
            </span>
            <span className="t-label w-16 text-right">{v} {unit}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default async function AnalyticsPage({ params }: PageProps<"/[lang]/admin/analytics">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const t = makeT(await getDictionary(lang));
  const unit = t("admin.analytics.minutesUnit");
  const kpis: [string, string, string][] = [
    [t("admin.analytics.kpi.onTime"), summary.onTime, "text-st-active"],
    [t("admin.analytics.kpi.avgDelay"), t("common.minutes", { n: summary.avgDelay }), "text-st-delayed"],
    [t("admin.analytics.kpi.tripTime"), t("common.minutes", { n: summary.tripTime }), ""],
    [t("admin.analytics.kpi.breakdowns"), String(summary.breakdowns), "text-st-breakdown"],
  ];
  return (
    <main className="flex flex-col gap-5 p-6 lg:p-8">
      <h1 className="t-display-l">{t("admin.analytics.title")}</h1>
      <AlertBanner tone="note">{t("admin.analytics.sample")}</AlertBanner>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {kpis.map(([k, v, tone]) => (
          <div key={k} className="flex flex-col gap-1 rounded-md border border-line bg-card p-5">
            <span className="t-secondary text-ink-2">{k}</span>
            <span className={cn("t-display-l", tone)}>{v}</span>
          </div>
        ))}
      </div>
      <div className="flex flex-col gap-4 lg:flex-row">
        <Bars title={t("admin.analytics.delayByRoute")} sub={t("admin.analytics.delayByRouteSub")} data={delayByRoute} unit={unit} label={(k) => t("admin.routes.title", { code: k })} />
        <Bars title={t("admin.analytics.delayByHour")} sub={t("admin.analytics.delayByHourSub")} data={delayByHour} unit={unit} label={(k) => k} />
        <section className="flex flex-col gap-3.5 rounded-md border border-line bg-card p-6 lg:w-[340px]">
          <h2 className="t-title">{t("admin.analytics.affected")}</h2>
          <ul>
            {affectedBuses.map(([bus, n]) => (
              <li key={bus} className="flex items-center gap-3 border-b border-line py-3 last:border-b-0">
                <span className="t-body-m flex-1">Bus {bus}</span>
                <span className="t-secondary text-ink-2">{t("admin.analytics.breakdownsCount", { n })}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </main>
  );
}
