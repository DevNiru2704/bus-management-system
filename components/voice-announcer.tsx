"use client";

import { useEffect, useRef } from "react";
import { useI18n } from "./i18n-provider";
import { useVoicePref } from "@/lib/prefs";
import { speak } from "@/lib/speech";
import { useNotes } from "@/lib/sim/use-sim.ts";

/** Speaks each NEW alert once, only when the passenger has switched voice on. Nothing is spoken for old alerts. */
export function VoiceAnnouncer() {
  const { t, lang } = useI18n();
  const [on] = useVoicePref();
  const notes = useNotes();
  const seen = useRef<Set<string> | null>(null);

  useEffect(() => {
    if (seen.current === null) {
      seen.current = new Set(notes.map((n) => n.id)); // alerts that already exist are not read out
      return;
    }
    for (const n of notes) {
      if (seen.current.has(n.id)) continue;
      seen.current.add(n.id);
      if (!on) continue;
      const key = n.type === "breakdown" && n.n === null ? "alerts.breakdownNone" : `alerts.${n.type}`;
      speak(t(key, { bus: n.busId, n: n.n ?? 0 }), lang);
    }
  }, [notes, on, t, lang]);
  return null;
}
