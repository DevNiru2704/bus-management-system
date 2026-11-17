"use client";

import { useI18n } from "./i18n-provider";
import { StatusChip } from "./status-chip";
import { minutesBetween } from "@/lib/format";
import type { BusStatus } from "@/lib/sim/engine.ts";
import type { NoteType } from "@/lib/sim/notify.ts";
import { useNotes, useSnapshot } from "@/lib/sim/use-sim.ts";

const chip: Record<NoteType, BusStatus> = { delayed: "delayed", breakdown: "breakdown", resumed: "active", approaching: "active", nearby: "active" };

export function AlertsScreen() {
  const { t } = useI18n();
  const notes = useNotes();
  const snap = useSnapshot();
  return (
    <main className="flex flex-col gap-4 px-4 pt-14 pb-6">
      <h1 className="t-display-l">{t("alerts.title")}</h1>
      {notes.length === 0 ? (
        <p className="t-body text-ink-2">{t("alerts.empty")}</p>
      ) : (
        <ul className="overflow-hidden rounded-md border border-line bg-card">
          {notes.map((n) => {
            const key = n.type === "breakdown" && n.n === null ? "alerts.breakdownNone" : `alerts.${n.type}`;
            return (
              <li key={n.id} className="flex flex-col gap-2 border-b border-line p-4 last:border-b-0">
                <div className="flex items-center gap-2">
                  <StatusChip status={chip[n.type]} />
                  <span className="t-meta ml-auto text-ink-2">{snap ? t("common.minutesAgo", { n: minutesBetween(n.t, snap.now) }) : ""}</span>
                </div>
                <p className="t-body">{t(key, { bus: n.busId, n: n.n ?? 0 })}</p>
              </li>
            );
          })}
        </ul>
      )}
      <p className="t-secondary text-ink-2">{t("alerts.footer")}</p>
    </main>
  );
}
