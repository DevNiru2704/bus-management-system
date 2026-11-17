"use client";

import { StatusIcon } from "./icons";
import { useI18n } from "./i18n-provider";
import { cn } from "@/lib/cn";
import type { BusStatus } from "@/lib/sim/engine.ts";

const tone: Record<BusStatus, string> = {
  active: "bg-st-active-bg text-st-active",
  delayed: "bg-st-delayed-bg text-st-delayed",
  breakdown: "bg-st-breakdown-bg text-st-breakdown",
  inactive: "bg-st-inactive-bg text-st-inactive",
  completed: "bg-st-completed-bg text-st-completed",
  emergency: "bg-st-breakdown-bg text-st-emergency",
};

/** Colour, icon and a written label together: colour alone never carries the status. */
export function StatusChip({ status, className }: { status: BusStatus; className?: string }) {
  const { t } = useI18n();
  return (
    <span className={cn("t-label inline-flex items-center gap-1.5 rounded-full py-[5px] pl-2.5 pr-3 whitespace-nowrap", tone[status], className)}>
      <StatusIcon status={status} />
      {t(`status.${status}`)}
    </span>
  );
}
