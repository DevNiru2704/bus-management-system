"use client";

import { cn } from "@/lib/cn";

/** An on/off switch. 48 x 28, with a 44 px tap target around it via the surrounding row. */
export function Switch({ on, onChange, label }: { on: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button type="button" role="switch" aria-checked={on} aria-label={label} onClick={() => onChange(!on)} className={cn("relative h-7 w-12 shrink-0 rounded-full transition-colors duration-150 ease-out", on ? "bg-brand" : "bg-line-strong")}>
      <span className={cn("absolute top-[3px] left-[3px] size-[22px] rounded-full bg-card transition-transform duration-150 ease-out", on && "translate-x-5")} />
    </button>
  );
}
