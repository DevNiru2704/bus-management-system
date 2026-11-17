"use client";

import Link from "next/link";
import { useState } from "react";
import { AlertBanner } from "./alert-banner";
import { BottomSheet, type Snap } from "./bottom-sheet";
import { BusBoard } from "./bus-board";
import { Button } from "./button";
import { BackIcon, SpeakerIcon } from "./icons";
import { useI18n } from "./i18n-provider";
import { LiveMap } from "./live-map-loader";
import { StatusChip } from "./status-chip";
import { StopRow } from "./stop-row";
import { Switch } from "./switch";
import { cn } from "@/lib/cn";
import { clock, etaText, stopName } from "@/lib/format";
import { etaShort, leftAt, stopFor } from "@/lib/passenger";
import { useVoicePref } from "@/lib/prefs";
import { speak } from "@/lib/speech";
import { ROUTES } from "@/lib/sim/data.ts";
import { nextAvailableBus, type BusView } from "@/lib/sim/engine.ts";
import { useSnapshot } from "@/lib/sim/use-sim.ts";

const circle = "absolute top-[max(env(safe-area-inset-top),16px)] z-20 grid size-11 place-items-center rounded-full bg-card shadow-raised transition duration-150 ease-out hover:brightness-95";

export function LiveScreen({ busId }: { busId: string }) {
  const { t, lang } = useI18n();
  const snap = useSnapshot();
  const [pos, setPos] = useState<Snap>("half");
  const [voice, setVoice] = useVoicePref();
  const bus = snap?.buses[busId];
  const route = bus ? ROUTES[bus.def.routeId] : null;
  const stopId = bus ? stopFor(bus) : "";
  const routeBuses = snap && bus ? snap.list.filter((b) => b.def.routeId === bus.def.routeId) : [];

  const toggleVoice = (on: boolean) => {
    setVoice(on);
    if (on && !speak(t("settings.voiceTest"), lang)) alert(t("settings.voiceMissing"));
  };

  return (
    <main className="relative h-dvh overflow-hidden bg-map-land">
      {route && bus ? <LiveMap className="absolute inset-0" routeId={route.id} buses={routeBuses} stopId={route.stops.some((s) => s.id === stopId) ? stopId : undefined} padBottom={pos === "peek" ? 190 : 450} label={t("live.mapLabel", { no: bus.def.id })} /> : null}

      <Link href={`/${lang}/passenger`} aria-label={t("live.back")} className={cn(circle, "left-4")}>
        <BackIcon />
      </Link>
      <button type="button" aria-pressed={voice} aria-label={t("live.voice")} onClick={() => toggleVoice(!voice)} className={cn(circle, "right-4", voice && "ring-2 ring-brand")}>
        <SpeakerIcon />
      </button>

      <BottomSheet snap={pos} onSnap={setPos} handleLabel={t("live.sheetHandle")}>
        {bus && snap && route ? (
          <div className="flex flex-col gap-3">
            <BusBoard bus={bus} stopId={stopId} />
            <div className="flex flex-col gap-3" inert={pos === "peek"}>
              <div className="flex items-center gap-3">
                <StatusChip status={bus.status} />
                <span className="t-meta ml-auto text-ink-2">{t("common.updatedJustNow")}</span>
              </div>
              <Notices bus={bus} />
              {bus.status === "breakdown" || bus.status === "emergency" ? <NextBus bus={bus} stopId={stopId} /> : null}
              <ol>
                {pickRows(bus, stopId, pos === "full").map((sv, i, all) => {
                  const you = sv.stop.id === stopId && route.stops.some((s) => s.id === "esplanade");
                  const sub =
                    sv.state === "departed" ? t("live.stopLeft", { time: clock(leftAt(bus, sv, snap.now)) })
                    : sv.state === "arrived" ? t("live.stopHere")
                    : sv.state === "approaching" ? t("live.stopAway", { m: Math.max(10, Math.round((sv.stop.at - bus.progressM) / 10) * 10) })
                    : you ? t("live.stopYours") : t("live.stopNotYet");
                  const time = sv.state === "departed" ? clock(leftAt(bus, sv, snap.now)) : sv.state === "arrived" ? t("board.now") : sv.eta ? etaShort(sv.eta.band, t) : "";
                  return <StopRow key={sv.stop.id} state={sv.state} name={stopName(sv.stop, lang)} sub={sub} time={time} last={i === all.length - 1} />;
                })}
              </ol>
              <div className="flex items-center gap-3">
                <label className="t-body-m flex flex-1 items-center gap-3">
                  <Switch on={voice} onChange={toggleVoice} label={t("live.voice")} />
                  {t("live.voice")}
                </label>
                <Button href={`/${lang}/passenger/bus/${busId}/sos`} variant="danger">{t("common.sos")}</Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-32 rounded-md bg-sunken" aria-hidden />
        )}
      </BottomSheet>
    </main>
  );
}

function pickRows(bus: BusView, stopId: string, all: boolean) {
  if (all) return bus.stops;
  const passed = bus.stops.map((s, i) => (s.state === "departed" || s.state === "arrived" ? i : -1)).filter((i) => i >= 0);
  const idx = new Set<number>();
  if (passed.length) idx.add(passed[passed.length - 1]);
  const you = bus.stops.findIndex((s) => s.stop.id === stopId);
  if (you >= 0) idx.add(you);
  if (idx.size < 2) bus.stops.slice(0, 2).forEach((_, i) => idx.add(i));
  return [...idx].sort((a, b) => a - b).map((i) => bus.stops[i]);
}

function Notices({ bus }: { bus: BusView }) {
  const { t, lang } = useI18n();
  const route = ROUTES[bus.def.routeId];
  const lastPassed = [...bus.stops].reverse().find((s) => s.state === "departed" || s.state === "arrived") ?? bus.stops[0];
  return (
    <>
      {bus.gpsLost ? <AlertBanner tone="signal">{t("live.signalGap")}</AlertBanner> : null}
      {bus.status === "delayed" ? <AlertBanner tone="delayed">{t("live.delayedBanner", { n: Math.max(1, Math.round(bus.delaySec / 60)) })}</AlertBanner> : null}
      {bus.status === "breakdown" ? <AlertBanner tone="breakdown">{t("live.breakdownBanner", { stop: stopName(lastPassed.stop, lang) })}</AlertBanner> : null}
      {bus.status === "emergency" ? <AlertBanner tone="breakdown">{t("live.emergencyBanner")}</AlertBanner> : null}
      <span hidden>{route.id}</span>
    </>
  );
}

function NextBus({ bus, stopId }: { bus: BusView; stopId: string }) {
  const { t } = useI18n();
  const snap = useSnapshot();
  const next = snap ? nextAvailableBus(snap, bus.def.routeId, stopId, bus.def.id) : null;
  const band = next?.bus.stops.find((s) => s.stop.id === stopId)?.eta?.band;
  if (!next || !band)
    return (
      <div className="flex flex-col gap-1 rounded-md bg-sunken p-4">
        <span className="t-label">{t("live.noAltTitle")}</span>
        <span className="t-secondary text-ink-2">{t("live.noAltBody")}</span>
      </div>
    );
  return (
    <div className="flex items-center gap-3 rounded-md bg-sunken p-4">
      <span className="flex flex-1 flex-col">
        <span className="t-meta text-ink-2">{t("live.nextBus")}</span>
        <span className="t-title">{next.bus.def.label}</span>
      </span>
      <span className="t-label text-st-active">{etaText(band, t)}</span>
    </div>
  );
}
