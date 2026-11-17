import { cn } from "@/lib/cn";

const tone = {
  delayed: "bg-st-delayed-bg text-st-delayed",
  breakdown: "bg-st-breakdown-bg text-st-breakdown",
  signal: "bg-st-inactive-bg text-ink",
  note: "bg-st-delayed-bg text-ink",
} as const;
const dot = { delayed: "bg-st-delayed", breakdown: "bg-st-breakdown", signal: "bg-st-inactive", note: "bg-st-delayed" } as const;

export function AlertBanner({ tone: kind, children, className }: { tone: keyof typeof tone; children: React.ReactNode; className?: string }) {
  return (
    <div role="status" className={cn("t-secondary-m flex items-start gap-3 rounded-md px-4 py-3", tone[kind], className)}>
      <span className={cn("mt-2 size-2.5 shrink-0 rounded-full", dot[kind])} />
      <span>{children}</span>
    </div>
  );
}
