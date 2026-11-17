"use client";

import Link from "next/link";
import { useI18n } from "./i18n-provider";
import { Button } from "./button";
import { StatusChip } from "./status-chip";
import { dispatch, reset } from "@/lib/sim/store.ts";
import { useSnapshot } from "@/lib/sim/use-sim.ts";

/** Not part of the product design: a small panel to make things happen so every screen can be seen reacting. */
export function DemoControls() {
  const { t, lang } = useI18n();
  const snap = useSnapshot();
  const bus = snap?.buses["24"];
  const act = (label: string, run: () => void, variant: "secondary" | "danger" | "dark" = "secondary") => (
    <Button key={label} variant={variant} onClick={run} full>{label}</Button>
  );
  return (
    <main className="flex flex-col gap-4 px-4 pt-14 pb-10">
      <h1 className="t-display-m">{t("common.demo")}</h1>
      <p className="t-secondary text-ink-2">Open the passenger, driver and admin screens in separate tabs, then use these to make Bus 24 do things. Every tab updates.</p>
      {bus ? (
        <div className="flex items-center gap-3 rounded-md border border-line bg-card p-4">
          <span className="t-title flex-1">Bus 24</span>
          <StatusChip status={bus.status} />
        </div>
      ) : null}
      <div className="flex flex-col gap-3">
        {act("Traffic: slow the bus down", () => dispatch({ type: "issue.report", busId: "24", reason: "traffic" }))}
        {act("Breakdown: flat tyre", () => dispatch({ type: "issue.report", busId: "24", reason: "flatTyre" }), "danger")}
        {act("Resume service", () => dispatch({ type: "issue.resume", busId: "24" }))}
        {act("Lose GPS signal", () => dispatch({ type: "gps.lost", busId: "24" }))}
        {act("GPS signal back", () => dispatch({ type: "gps.back", busId: "24" }))}
        {act("Restart the demo from the beginning", () => reset(), "dark")}
      </div>
      <div className="flex flex-col gap-2 pt-2">
        <Link className="t-body-m min-h-11 py-2 text-brand underline underline-offset-4" href={`/${lang}/passenger`}>Passenger</Link>
        <Link className="t-body-m min-h-11 py-2 text-brand underline underline-offset-4" href={`/${lang}/driver`}>Driver</Link>
        <Link className="t-body-m min-h-11 py-2 text-brand underline underline-offset-4" href={`/${lang}/admin`}>Admin</Link>
      </div>
    </main>
  );
}
