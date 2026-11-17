"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AlertBanner } from "./alert-banner";
import { BigButton } from "./big-button";
import { Button } from "./button";
import { DotBoard } from "./dot-board";
import { HoldButton } from "./hold-button";
import { BusMark, CheckIcon } from "./icons";
import { useI18n } from "./i18n-provider";
import { StatusChip } from "./status-chip";
import { cn } from "@/lib/cn";
import { clock, stopName } from "@/lib/format";
import { DEMO, DRIVERS, ROUTES } from "@/lib/sim/data.ts";
import type { BusView, IssueReason, SosKind } from "@/lib/sim/engine.ts";
import { dispatch, reset } from "@/lib/sim/store.ts";
import { useSnapshot } from "@/lib/sim/use-sim.ts";

const BUS = DEMO.driverBusId;

function useDriverBus() {
  const snap = useSnapshot();
  return snap ? snap.buses[BUS] : null;
}

function Header({ title }: { title?: string }) {
  const { t } = useI18n();
  return (
    <header className="flex items-center gap-3">
      <BusMark size={36} />
      <span className="t-label text-ink-2">{title ?? t("driver.role")}</span>
    </header>
  );
}

/** The driver's own board: how many stops are done and which comes next. */
function DriverBoard({ bus, note }: { bus: BusView; note?: string }) {
  const { t, lang } = useI18n();
  const route = ROUTES[bus.def.routeId];
  const done = bus.stops.filter((s) => s.state === "arrived" || s.state === "departed").length;
  const next = bus.stops.find((s) => s.state === "upcoming" || s.state === "approaching");
  const stopped = bus.status === "breakdown" || bus.status === "emergency";
  return (
    <DotBoard
      route={route.code}
      dest={stopName(route.stops[route.stops.length - 1], lang)}
      eta={String(done)}
      unit={t("board.ofStops", { n: route.stops.length })}
      note={note ?? (next ? t("board.next", { stop: stopName(next.stop, lang) }) : t("status.completed"))}
      dim={stopped}
    />
  );
}

export function DriverLogin() {
  const { t, lang } = useI18n();
  const router = useRouter();
  const field = "t-body min-h-[54px] rounded-md border-[1.5px] border-line-strong bg-card px-4 outline-none focus:border-brand";
  return (
    <form
      className="flex flex-1 flex-col gap-4 px-4 pt-[72px] pb-8"
      onSubmit={(e) => {
        e.preventDefault();
        router.push(`/${lang}/driver/confirm`);
      }}
    >
      <BusMark size={64} />
      <h1 className="t-display-l">{t("driver.loginTitle")}</h1>
      <label className="flex flex-col gap-2">
        <span className="t-label">{t("driver.email")}</span>
        <input required type="email" name="email" defaultValue="subrata@example.com" autoComplete="username" className={field} />
      </label>
      <label className="flex flex-col gap-2">
        <span className="t-label">{t("driver.password")}</span>
        <input required type="password" name="password" defaultValue="demo-password" autoComplete="current-password" className={field} />
      </label>
      <div className="mt-auto"><Button type="submit" variant="dark" full>{t("driver.login")}</Button></div>
    </form>
  );
}

export function ConfirmBus() {
  const { t, lang } = useI18n();
  const bus = useDriverBus();
  const route = ROUTES["24"];
  return (
    <main className="flex flex-1 flex-col gap-4 px-4 pt-14 pb-8">
      <Header />
      <h1 className="t-display-m">{t("driver.greeting", { name: bus?.def.driverId ? DRIVERS[bus.def.driverId].name : "" })}</h1>
      <p className="t-label text-ink-2">{t("driver.todaysBus")}</p>
      {bus ? (
        <>
          <DotBoard route={route.code} dest={stopName(route.stops[route.stops.length - 1], lang)} eta={String(route.stops.length)} unit={t("board.stops")} note={bus.def.plate} />
          <p className="t-body text-ink-2">{t("driver.routeLine", { from: stopName(route.stops[0], lang), to: stopName(route.stops[route.stops.length - 1], lang), n: route.stops.length })}</p>
        </>
      ) : <div className="h-32 rounded-md bg-sunken" aria-hidden />}
      <div className="mt-auto flex flex-col gap-3">
        <Button href={`/${lang}/driver/start`} full>{t("driver.confirmBus")}</Button>
        <p className="t-secondary text-center text-ink-2">{t("driver.notYourBus")}</p>
      </div>
    </main>
  );
}

export function StartTrip() {
  const { t, lang } = useI18n();
  const router = useRouter();
  const bus = useDriverBus();
  if (!bus) return <div className="flex-1" aria-hidden />;
  const running = bus.tripStartAt !== null && bus.tripEndAt === null;
  const finished = bus.tripEndAt !== null;
  const start = () => {
    if (!running) dispatch({ type: "trip.start", busId: BUS });
    router.push(`/${lang}/driver/trip`);
  };
  return (
    <main className="flex flex-1 flex-col gap-4 px-4 pt-14 pb-8">
      <Header />
      <div><StatusChip status={running ? "active" : finished ? "completed" : "inactive"} /></div>
      <h1 className="t-display-l">{t("driver.readyTitle")}</h1>
      <p className="t-body text-ink-2">{t("driver.readyBody")}</p>
      <DriverBoard bus={bus} note={running ? undefined : finished ? t("status.completed") : t("board.notStarted")} />
      <div className="mt-auto flex flex-col gap-3">
        {finished ? (
          <BigButton tone="card" label={t("common.demo")} onClick={() => reset()} />
        ) : (
          <BigButton tone="taxi" label={t("driver.startTrip")} sub={t("driver.startSub")} onClick={start} className="min-h-[120px]" />
        )}
      </div>
    </main>
  );
}

export function ActiveTrip() {
  const { t, lang } = useI18n();
  const router = useRouter();
  const snap = useSnapshot();
  const bus = snap ? snap.buses[BUS] : null;

  useEffect(() => {
    if (!bus) return;
    if (bus.tripEndAt !== null) router.replace(`/${lang}/driver/complete`);
    else if (bus.tripStartAt === null) router.replace(`/${lang}/driver/start`);
  }, [bus, router, lang]);

  if (!bus || !snap) return <div className="flex-1" aria-hidden />;
  const halted = bus.status === "breakdown" || bus.status === "emergency";
  const canResume = halted || bus.status === "delayed";
  const last = bus.stops[bus.stops.length - 1];
  const atEnd = last.state === "arrived";
  const note = halted ? t("board.paused") : undefined;

  return (
    <main className="flex flex-1 flex-col gap-3 px-4 pt-14 pb-8">
      <Header />
      <div className="flex items-center gap-3">
        <StatusChip status={bus.status} />
        <span className="t-label ml-auto text-ink-2">{halted && bus.incident ? t("driver.pausedAt", { time: clock(bus.incident.reportedAt) }) : clock(snap.now)}</span>
      </div>
      <DriverBoard bus={bus} note={note} />
      <p className="t-secondary flex items-center gap-2 text-ink-2">
        <span className={cn("size-2.5 rounded-full", halted ? "bg-st-inactive" : "bg-st-active")} />
        {halted ? t("driver.pausedNote") : t("driver.sharing", { n: 5 })}
      </p>
      <BigButton tone="card" label={t("driver.issue")} sub={halted ? undefined : t("driver.issueSub")} href={`/${lang}/driver/issue`} disabled={halted} />
      <BigButton tone={canResume ? "taxi" : "card"} label={t("driver.resume")} sub={canResume ? t("driver.resumeOn") : t("driver.resumeOff")} onClick={() => dispatch({ type: "issue.resume", busId: BUS })} disabled={!canResume} className={cn(canResume ? "min-h-[120px]" : "min-h-24")} />
      <BigButton tone="danger" label={t("common.sos")} sub={t("driver.sosSub")} href={`/${lang}/driver/sos`} />
      {atEnd ? <Button variant="dark" onClick={() => dispatch({ type: "trip.complete", busId: BUS })} full>{t("driver.tripComplete")}</Button> : null}
      <p className="t-meta text-center text-ink-2">{t("sos.note")}</p>
    </main>
  );
}

const reasons: IssueReason[] = ["mechanical", "breakdown", "flatTyre", "traffic", "emergency", "other"];

export function ReportIssue() {
  const { t, lang } = useI18n();
  const router = useRouter();
  const [picked, setPicked] = useState<IssueReason | null>(null);
  return (
    <main className="flex flex-1 flex-col gap-3 px-4 pt-14 pb-8">
      <Header />
      <h1 className="t-display-m">{t("driver.whatHappened")}</h1>
      <div role="radiogroup" aria-label={t("driver.whatHappened")} className="flex flex-col gap-2.5">
        {reasons.map((r) => {
          const on = picked === r;
          return (
            <button key={r} type="button" role="radio" aria-checked={on} onClick={() => setPicked(r)} className={cn("flex min-h-16 items-center gap-3 rounded-md px-5 text-left transition-colors duration-150 ease-out", on ? "border-2 border-st-breakdown bg-st-breakdown-bg text-st-breakdown" : "border border-line bg-card")}>
              <span className="t-body-m flex-1">{t(`driver.reasons.${r}`)}</span>
              {on ? <CheckIcon /> : null}
            </button>
          );
        })}
      </div>
      <p className="t-secondary text-ink-2">{t("driver.reasonHelp")}</p>
      <div className="mt-auto flex flex-col gap-3">
        <Button variant="dark" disabled={!picked} onClick={() => { if (picked) { dispatch({ type: "issue.report", busId: BUS, reason: picked }); router.push(`/${lang}/driver/trip`); } }} full>{t("driver.sendReport")}</Button>
        <Button href={`/${lang}/driver/trip`} variant="secondary" full>{t("common.cancel")}</Button>
      </div>
    </main>
  );
}

const sosKinds: Exclude<SosKind, "passenger">[] = ["accident", "medical", "security", "vehicle"];

export function DriverSos() {
  const { t, lang } = useI18n();
  const router = useRouter();
  const [kind, setKind] = useState<Exclude<SosKind, "passenger">>("accident");
  const [p, setP] = useState(0);
  return (
    <main className="flex flex-1 flex-col gap-3 px-4 pt-14 pb-8">
      <Header title={t("driver.sosTitle")} />
      <div role="radiogroup" aria-label={t("driver.sosTitle")} className="overflow-hidden rounded-md border border-line bg-card">
        {sosKinds.map((k) => (
          <button key={k} type="button" role="radio" aria-checked={kind === k} onClick={() => setKind(k)} className="flex min-h-14 w-full items-center gap-3 border-b border-line px-4 text-left last:border-b-0">
            <span className={cn("size-[22px] rounded-full border-2", kind === k ? "border-st-breakdown bg-st-breakdown" : "border-line-strong bg-card")} />
            <span className="t-body-m">{t(`driver.sosTypes.${k}`)}</span>
          </button>
        ))}
      </div>
      <div className="my-2 flex flex-col items-center gap-3">
        <HoldButton size={200} label={p > 0 ? t("sos.keepHolding") : t("sos.hold")} caption={t("driver.sosCaption")} onProgress={setP} onComplete={() => { dispatch({ type: "sos.raise", sosId: `D-${Date.now().toString(36).toUpperCase()}`, source: "driver", busId: BUS, kind }); router.push(`/${lang}/driver/trip`); }} />
        <p className="t-secondary text-center text-ink-2" aria-live="polite">{t("driver.sosCaption")}</p>
      </div>
      <AlertBanner tone="note">{t("sos.note")}</AlertBanner>
      <div className="mt-auto"><Button href={`/${lang}/driver/trip`} variant="secondary" full>{t("common.cancel")}</Button></div>
    </main>
  );
}

export function TripComplete() {
  const { t, lang } = useI18n();
  const bus = useDriverBus();
  if (!bus) return <div className="flex-1" aria-hidden />;
  const reached = bus.stops.filter((s) => s.state === "arrived" || s.state === "departed").length;
  const rows: [string, string][] = [
    [t("driver.started"), bus.tripStartAt ? clock(bus.tripStartAt) : "-"],
    [t("driver.ended"), bus.tripEndAt ? clock(bus.tripEndAt) : "-"],
    [t("driver.stopsReached"), `${reached} / ${bus.stops.length}`],
    [t("driver.delayAtFinish"), `+${Math.round(bus.delaySec / 60)} ${t("board.min").toLowerCase()}`],
  ];
  return (
    <main className="flex flex-1 flex-col gap-4 px-4 pt-14 pb-8">
      <Header />
      <div><StatusChip status="completed" /></div>
      <h1 className="t-display-l">{t("driver.tripComplete")}</h1>
      <dl className="overflow-hidden rounded-md border border-line bg-card">
        {rows.map(([k, v]) => (
          <div key={k} className="flex items-center gap-3 border-b border-line px-4 py-3.5 last:border-b-0">
            <dt className="t-body flex-1 text-ink-2">{k}</dt>
            <dd className="t-title">{v}</dd>
          </div>
        ))}
      </dl>
      <p className="t-body text-ink-2">{t("driver.completeNote")}</p>
      <div className="mt-auto"><Button href={`/${lang}/driver/start`} variant="dark" full>{t("driver.backToStart")}</Button></div>
    </main>
  );
}

