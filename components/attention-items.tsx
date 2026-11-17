"use client";

import Link from "next/link";
import { Button } from "./button";
import { useI18n } from "./i18n-provider";
import { StatusChip } from "./status-chip";
import { cn } from "@/lib/cn";
import { clock, placeName } from "@/lib/format";
import { ROUTES } from "@/lib/sim/data.ts";
import { nearestStopName, type BusView, type Incident, type SosAlert } from "@/lib/sim/engine.ts";
import { dispatch } from "@/lib/sim/store.ts";

export const sosKindLabel = (t: (p: string) => string, a: SosAlert) => (a.source === "passenger" ? t("sos.passengerKind") : t(`driver.sosTypes.${a.kind}`));

export function SosItem({ alert, bus }: { alert: SosAlert; bus: BusView }) {
  const { t, lang } = useI18n();
  const acked = alert.ackAt !== null;
  return (
    <article className={cn("flex flex-col gap-3 rounded-md bg-card p-4", acked ? "border border-line" : "border-2 border-st-emergency")}>
      <div className="flex items-center gap-2">
        <StatusChip status="emergency" />
        <span className="t-meta ml-auto text-ink-2">{clock(alert.raisedAt)}</span>
      </div>
      <h3 className="t-title">{t(alert.source === "driver" ? "admin.sosDriverTitle" : "admin.sosPassengerTitle", { bus: bus.def.id })}</h3>
      <p className="t-body text-ink-2">{t("admin.sosDetail", { kind: sosKindLabel(t, alert), place: placeName(bus.def.routeId, alert.place, lang) })}</p>
      <div className="flex gap-2">
        {acked ? (
          <span className="t-label flex min-h-[52px] flex-1 items-center text-st-active">{t("admin.acknowledged")}</span>
        ) : (
          <Button variant="danger" className="flex-1" onClick={() => dispatch({ type: "sos.ack", sosId: alert.id, note: "" })}>{t("admin.acknowledge")}</Button>
        )}
        <Button variant="secondary" href={`/${lang}/admin/incidents/${alert.id}`}>{t("admin.view")}</Button>
      </div>
    </article>
  );
}

export function IssueItem({ incident, bus }: { incident: Incident; bus: BusView }) {
  const { t, lang } = useI18n();
  const halted = bus.status === "breakdown" || bus.status === "emergency";
  const place = placeName(bus.def.routeId, nearestStopName(bus.def.routeId, bus.pos), lang);
  const route = ROUTES[bus.def.routeId].code;
  return (
    <article className="flex flex-col gap-3 rounded-md border border-line bg-card p-4">
      <div className="flex items-center gap-2">
        <StatusChip status={halted ? "breakdown" : "delayed"} />
        <span className="t-meta ml-auto text-ink-2">{clock(incident.reportedAt)}</span>
      </div>
      <h3 className="t-title">{t(halted ? "admin.issueTitleHalt" : "admin.issueTitleSlow", { bus: bus.def.id, place })}</h3>
      <p className="t-body text-ink-2">{t(halted ? "admin.issueDetailHalt" : "admin.issueDetailSlow", { reason: t(`driver.reasons.${incident.reason}`), route })}</p>
      <Link href={`/${lang}/admin/incidents/${incident.id}`} className="t-label min-h-11 self-start py-2.5 text-brand underline underline-offset-4">{t("admin.view")}</Link>
    </article>
  );
}
