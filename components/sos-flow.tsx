"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { AlertBanner } from "./alert-banner";
import { Button } from "./button";
import { HoldButton } from "./hold-button";
import { BackIcon, CheckIcon } from "./icons";
import { useI18n } from "./i18n-provider";
import { clockSec } from "@/lib/format";
import { dispatch } from "@/lib/sim/store.ts";
import { useSnapshot } from "@/lib/sim/use-sim.ts";
import { cn } from "@/lib/cn";

type Step = "hold" | "confirm" | "sent";

/** Press and hold for 3 s, confirm, then watch the alert move from "raised" to "acknowledged". */
export function SosFlow({ busId }: { busId: string }) {
  const { t, lang } = useI18n();
  const snap = useSnapshot();
  const [step, setStep] = useState<Step>("hold");
  const [p, setP] = useState(0);
  const [round, setRound] = useState(0); // remounts the hold button after a cancelled confirm
  const [sent, setSent] = useState<{ id: string; at: number } | null>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const back = `/${lang}/passenger/bus/${busId}`;

  useEffect(() => {
    if (step === "confirm") cancelRef.current?.focus();
  }, [step]);

  const send = () => {
    const id = `P-${Date.now().toString(36).toUpperCase()}`;
    dispatch({ type: "sos.raise", sosId: id, source: "passenger", busId, kind: "passenger" });
    setSent({ id, at: Date.now() });
    setStep("sent");
  };

  if (step === "sent" && sent) {
    const acked = snap?.sos.find((s) => s.id === sent.id)?.ackAt ?? null;
    const steps = [
      { label: t("sos.stepRaised"), when: clockSec(sent.at), done: true },
      { label: t("sos.stepRecorded"), when: clockSec(sent.at), done: true },
      { label: t("sos.stepAlerted"), when: clockSec(sent.at + 1000), done: true },
      { label: t("sos.stepAck"), when: acked ? clockSec(acked) : t("sos.waiting"), done: !!acked },
    ];
    return (
      <main className="fade-up flex min-h-dvh flex-col gap-4 px-4 pt-[72px] pb-8">
        <span className="grid size-16 place-items-center rounded-full bg-st-active-bg text-st-active"><CheckIcon size={32} /></span>
        <h1 className="t-display-m">{t("sos.sentTitle", { time: clockSec(sent.at).slice(0, 5) })}</h1>
        <p className="t-body text-ink-2">{t("sos.sentBody")}</p>
        <ol className="flex flex-col gap-3 rounded-md border border-line bg-card p-4" aria-live="polite">
          {steps.map((s) => (
            <li key={s.label} className="flex items-center gap-3">
              <span className={cn("size-3 shrink-0 rounded-full border-2", s.done ? "border-st-active bg-st-active" : "border-line-strong bg-card")} />
              <span className={cn("t-body-m flex-1", !s.done && "text-ink-2")}>{s.label}</span>
              <span className="t-meta text-ink-2">{s.when}</span>
            </li>
          ))}
        </ol>
        <AlertBanner tone="note">{t("sos.note")}</AlertBanner>
        <div className="mt-auto"><Button href={back} variant="dark" full>{t("sos.backToBus")}</Button></div>
      </main>
    );
  }

  const left = Math.max(1, Math.ceil((1 - p) * 3));
  const caption = step === "confirm" ? t("sos.heldCaption") : p === 0 ? t("sos.idleCaption") : t(`sos.left${left}`);
  return (
    <main className="relative flex min-h-dvh flex-col gap-4 px-4 pt-14 pb-8">
      <div className="flex items-center gap-3">
        <Link href={back} aria-label={t("common.back")} className="grid size-11 place-items-center rounded-full bg-card shadow-raised"><BackIcon /></Link>
        <h1 className="t-title">{t("sos.title")}</h1>
      </div>
      <AlertBanner tone="note">{t("sos.note")}</AlertBanner>
      <div className="my-4 flex flex-col items-center gap-4">
        <HoldButton key={round} label={p > 0 || step === "confirm" ? t("sos.keepHolding") : t("sos.hold")} caption={caption} onProgress={setP} onComplete={() => setStep("confirm")} />
        <p className="t-secondary text-center text-ink-2" aria-live="polite">{caption}</p>
      </div>
      <div className="mt-auto"><Button href={back} variant="secondary" full>{t("common.cancel")}</Button></div>

      {step === "confirm" ? (
        <div className="fixed inset-0 z-30 mx-auto flex max-w-[430px] items-end" role="dialog" aria-modal="true" aria-labelledby="sos-confirm-title">
          <div className="scrim-in absolute inset-0 bg-board/55" />
          <div className="sheet-up relative flex w-full flex-col gap-3 rounded-t-lg bg-card px-4 pt-6 pb-8 shadow-sheet">
            <h2 id="sos-confirm-title" className="t-display-m">{t("sos.confirmTitle")}</h2>
            <p className="t-body text-ink-2">{t("sos.confirmBody")}</p>
            <Button variant="danger" onClick={send} full>{t("sos.send")}</Button>
            <button ref={cancelRef} type="button" onClick={() => (setStep("hold"), setP(0), setRound((r) => r + 1))} className="t-body-m min-h-[52px] rounded-md border-[1.5px] border-line-strong bg-card">{t("common.cancel")}</button>
          </div>
        </div>
      ) : null}
    </main>
  );
}
