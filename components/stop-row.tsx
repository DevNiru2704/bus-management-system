import { cn } from "@/lib/cn";
import type { StopState } from "@/lib/sim/geofence.ts";

/** One stop in the timeline. The dot says where the bus is: upcoming, approaching, arrived or departed. */
export function StopRow({ state, name, sub, time, last }: { state: StopState; name: string; sub: string; time: string; last?: boolean }) {
  const dot =
    state === "departed"
      ? "size-3 bg-brand"
      : state === "approaching"
        ? "size-[18px] border-[3px] border-brand bg-taxi"
        : state === "arrived"
          ? "size-[18px] border-[3px] border-taxi bg-brand"
          : "size-3 border-2 border-line-strong bg-card";
  return (
    <li className="flex min-h-16 gap-3">
      <div className="flex w-5 flex-col items-center pt-1.5">
        <span className={cn("shrink-0 rounded-full", dot)} />
        {last ? null : <span className={cn("mt-1 w-0.5 flex-1", state === "departed" ? "bg-brand" : "bg-line")} />}
      </div>
      <div className={cn("flex min-w-0 flex-1 flex-col pb-3", state === "upcoming" ? "text-ink-2" : "text-ink")}>
        <span className={cn(state === "upcoming" ? "t-body" : "t-body-m")}>{name}</span>
        <span className={cn("t-secondary", state === "approaching" ? "text-st-delayed" : "text-ink-2")}>{sub}</span>
      </div>
      <span className={cn("t-label shrink-0 pt-1", state === "upcoming" ? "text-ink-2" : "text-ink")}>{time}</span>
    </li>
  );
}
