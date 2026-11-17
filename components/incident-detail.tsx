"use client";

import Link from "next/link";
import { useState } from "react";
import { AlertBanner } from "./alert-banner";
import { sosKindLabel } from "./attention-items";
import { Button } from "./button";
import { FleetMap } from "./fleet-map-loader";
import { BackIcon } from "./icons";
import { useI18n } from "./i18n-provider";
import { StatusChip } from "./status-chip";
import { cn } from "@/lib/cn";
import { clock, clockSec, minutesBetween, placeName } from "@/lib/format";
import { DRIVERS, ROUTES } from "@/lib/sim/data.ts";
import { nearestStopName, type BusView } from "@/lib/sim/engine.ts";
import { dispatch } from "@/lib/sim/store.ts";
import { useSnapshot } from "@/lib/sim/use-sim.ts";

function Timeline({ steps }: { steps: { label: string; when: string; done: boolean }[] }) {
  return (
    <ol className="flex flex-col gap-3" aria-live="polite">
      {steps.map((s) => (
        <li key={s.label} className="flex items-center gap-3">
          <span className={cn("size-3 shrink-0 rounded-full border-2", s.done ? "border-st-active bg-st-active" : "border-line-strong bg-card")} />
          <span className={cn("t-body-m flex-1", !s.done && "text-ink-2")}>{s.label}</span>
          <span className="t-meta text-ink-2">{s.when}</span>
        </li>
      ))}
    </ol>
  );
}

export function IncidentDetail({ id }: { id: string }) {
  const { t, lang } = useI18n();
  const snap = useSnapshot();
  const [note, setNote] = useState("");
  const back = `/${lang}/admin`;
  const sos = snap?.sos.find((s) => s.id === id);
  const incident = snap?.incidents.find((i) => i.id === id);
  const bus: BusView | undefined = snap ? snap.buses[(sos ?? incident)?.busId ?? ""] : undefined;
  const route = bus ? ROUTES[bus.def.routeId] : null;
  const place = bus && route ? placeName(route.id, nearestStopName(route.id, bus.pos), lang) : "";

  const row = (k: string, v: string) => (
    <div key={k} className="flex gap-3">
      <dt className="t-secondary text-ink-2">{k}</dt>
      <dd className="t-secondary-m ml-auto text-right">{v}</dd>
    </div>
  );

  let body: React.ReactNode = <div className="h-64 rounded-md bg-sunken" aria-hidden />;
  let title = "";
  let chip: React.ReactNode = null;
  if (snap && !bus) {
    body = <p className="t-body text-ink-2">{t("admin.detail.notFound")}</p>;
  } else if (snap && bus && route) {
    const driver = bus.def.driverId ? DRIVERS[bus.def.driverId] : null;
    if (sos) {
      title = t("admin.detail.sosTitle", { id: sos.id });
      chip = <StatusChip status="emergency" />;
      const who = sos.source === "driver" && driver ? t("admin.detail.driverRole", { name: driver.name }) : t("admin.detail.passengerRole");
      body = (
        <>
          <dl className="flex flex-col gap-2.5 rounded-md border border-line bg-card p-4">
            {row(t("admin.detail.raisedBy"), who)}
            {row(t("admin.detail.busTrip"), `${bus.def.label}, ${t("admin.routes.title", { code: route.code })}`)}
            {row(t("admin.detail.type"), sosKindLabel(t, sos))}
            {row(t("admin.detail.position"), place)}
            {row(t("admin.detail.raisedAt"), clockSec(sos.raisedAt))}
          </dl>
          <h3 className="t-label text-ink-2">{t("admin.detail.timeline")}</h3>
          <Timeline steps={[
            { label: t("admin.detail.stepRaised"), when: clockSec(sos.raisedAt), done: true },
            { label: t("admin.detail.stepRecorded"), when: clockSec(sos.raisedAt), done: true },
            { label: t("admin.detail.stepAlerted"), when: clockSec(sos.raisedAt + 1000), done: true },
            { label: t("admin.detail.stepAck"), when: sos.ackAt ? clockSec(sos.ackAt) : t("admin.detail.pending"), done: sos.ackAt !== null },
          ]} />
          {sos.ackAt === null ? (
            <>
              <label className="flex flex-col gap-2">
                <span className="t-label text-ink-2">{t("admin.detail.actionTaken")}</span>
                <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder={t("admin.detail.actionHint")} rows={3} className="t-body min-h-[84px] rounded-md border-[1.5px] border-line-strong bg-page px-4 py-3 outline-none focus:border-brand" />
              </label>
              <Button variant="dark" onClick={() => dispatch({ type: "sos.ack", sosId: sos.id, note: note.trim() })} full>{t("admin.detail.ackSos")}</Button>
            </>
          ) : (
            <div className="t-body flex flex-col gap-1 rounded-md bg-st-active-bg p-4 text-st-active">
              <span className="t-label">{t("admin.detail.ackedAt", { time: clock(sos.ackAt) })}</span>
              {sos.note ? <span>{sos.note}</span> : null}
            </div>
          )}
          <AlertBanner tone="note">{t("admin.detail.note")}</AlertBanner>
        </>
      );
    } else if (incident) {
      const halted = incident.resolvedAt === null ? bus.status === "breakdown" || bus.status === "emergency" : true;
      title = t("admin.detail.incidentTitle", { id: incident.id });
      chip = <StatusChip status={halted ? "breakdown" : "delayed"} />;
      const end = incident.resolvedAt ?? snap.now;
      body = (
        <>
          <dl className="flex flex-col gap-2.5 rounded-md border border-line bg-card p-4">
            {row(t("admin.detail.busTrip"), `${bus.def.label}, ${t("admin.routes.title", { code: route.code })}`)}
            {row(t("admin.detail.reason"), t(`driver.reasons.${incident.reason}`))}
            {row(t("admin.detail.position"), place)}
            {row(t("admin.detail.reportedAt"), clock(incident.reportedAt))}
            {row(t("admin.detail.duration"), incident.resolvedAt ? t("common.minutes", { n: minutesBetween(incident.reportedAt, end) }) : t("admin.detail.ongoing"))}
          </dl>
          <h3 className="t-label text-ink-2">{t("admin.detail.timeline")}</h3>
          <Timeline steps={[
            { label: t("admin.detail.reportedStep"), when: clockSec(incident.reportedAt), done: true },
            { label: t("admin.detail.resolvedStep"), when: incident.resolvedAt ? clockSec(incident.resolvedAt) : t("admin.detail.ongoing"), done: incident.resolvedAt !== null },
          ]} />
        </>
      );
    } else body = <p className="t-body text-ink-2">{t("admin.detail.notFound")}</p>;
  }

  return (
    <main className="flex flex-col lg:relative lg:h-dvh lg:overflow-hidden">
      <FleetMap className="h-[45dvh] lg:absolute lg:inset-0 lg:h-auto" buses={snap?.list ?? []} focus={bus?.pos} padRight={0} label={t("admin.busesOnRoad")} />
      <aside className="z-10 flex flex-col gap-4 bg-card p-5 shadow-raised max-lg:m-4 max-lg:rounded-lg lg:absolute lg:top-6 lg:right-6 lg:bottom-6 lg:w-[400px] lg:overflow-y-auto lg:rounded-lg">
        <div className="flex items-center gap-3">
          <Link href={back} aria-label={t("admin.detail.back")} className="grid size-10 place-items-center rounded-full bg-sunken"><BackIcon /></Link>
          <h1 className="t-display-m flex-1">{title}</h1>
          {chip}
        </div>
        {body}
      </aside>
    </main>
  );
}
