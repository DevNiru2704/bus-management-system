"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";

const R = 46;
const C = 2 * Math.PI * R;

/**
 * Press and hold for `seconds` to confirm. Letting go early starts over, which is what stops a pocket press
 * from raising an alarm. Works with pointer, touch and keyboard (hold Space or Enter).
 */
export function HoldButton({
  seconds = 3,
  onComplete,
  onProgress,
  label,
  caption,
  size = 232,
  className,
}: {
  seconds?: number;
  onComplete: () => void;
  onProgress?: (p: number) => void;
  label: string;
  caption: string;
  size?: number;
  className?: string;
}) {
  const [p, setP] = useState(0);
  const raf = useRef(0);
  const t0 = useRef(0);
  const done = useRef(false);

  const tick = (now: number) => {
    const v = Math.min(1, (now - t0.current) / (seconds * 1000));
    setP(v);
    onProgress?.(v);
    if (v >= 1) {
      if (!done.current) {
        done.current = true;
        onComplete();
      }
      return;
    }
    raf.current = requestAnimationFrame(tick);
  };
  const start = () => {
    if (done.current || raf.current) return;
    t0.current = performance.now();
    raf.current = requestAnimationFrame(tick);
  };
  const cancel = () => {
    cancelAnimationFrame(raf.current);
    raf.current = 0;
    if (!done.current) {
      setP(0);
      onProgress?.(0);
    }
  };
  useEffect(() => () => cancelAnimationFrame(raf.current), []);

  return (
    <button
      type="button"
      aria-label={`${label}. ${caption}`}
      onPointerDown={(e) => {
        try {
          e.currentTarget.setPointerCapture(e.pointerId);
        } catch {
          /* capture is a nicety; holding still works without it */
        }
        start();
      }}
      onPointerUp={cancel}
      onPointerCancel={cancel}
      onContextMenu={(e) => e.preventDefault()}
      onKeyDown={(e) => (e.key === " " || e.key === "Enter") && !e.repeat && (e.preventDefault(), start())}
      onKeyUp={cancel}
      onBlur={cancel}
      style={{ width: size, height: size, WebkitTouchCallout: "none" }}
      className={cn("relative mx-auto block shrink-0 touch-none rounded-full select-none", className)}
    >
      <svg viewBox="0 0 100 100" className="absolute inset-0 size-full -rotate-90" aria-hidden>
        <circle cx="50" cy="50" r={R} fill="none" strokeWidth="8" className="stroke-st-breakdown-bg" />
        <circle cx="50" cy="50" r={R} fill="none" strokeWidth="8" strokeLinecap="round" className="stroke-st-breakdown" strokeDasharray={C} strokeDashoffset={C * (1 - p)} />
        <circle cx="50" cy="50" r="38" className="fill-st-breakdown" />
      </svg>
      <span className="absolute inset-0 flex flex-col items-center justify-center text-white">
        <span className="t-display-l">SOS</span>
        <span className="t-body-m">{label}</span>
      </span>
    </button>
  );
}
