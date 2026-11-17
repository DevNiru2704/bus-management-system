import { cn } from "@/lib/cn";

/** The destination board: route plate, destination, and the arrival time in dot-matrix digits. */
export function DotBoard({
  route,
  dest,
  eta,
  unit,
  note,
  dim,
  className,
}: {
  route: string;
  dest: string;
  eta: string;
  unit?: string;
  note: string;
  dim?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-4 rounded-md border border-board-dim bg-board p-4", className)}>
      <div className="t-board-digits shrink-0 rounded-sm border-2 border-taxi px-3 py-1.5 text-taxi">{route}</div>
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <div className="t-board-route break-words text-taxi uppercase">{dest}</div>
        <div className="flex items-end gap-2">
          <span className={cn("t-board-digits", dim ? "text-board-dim" : "text-taxi")}>{eta}</span>
          {unit ? <span className="t-board-route pb-0.5 text-white uppercase">{unit}</span> : null}
        </div>
        <div className="t-secondary-m text-white">{note}</div>
      </div>
    </div>
  );
}
