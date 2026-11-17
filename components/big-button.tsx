import Link from "next/link";
import { cn } from "@/lib/cn";

const tone = {
  card: "bg-card text-ink border-[1.5px] border-line-strong",
  taxi: "bg-taxi text-on-taxi",
  danger: "bg-st-breakdown text-white",
} as const;

type Props = {
  tone: keyof typeof tone;
  label: string;
  sub?: string;
  className?: string;
  href?: string;
  onClick?: () => void;
  disabled?: boolean;
};

/** The driver's controls: large, one job each, readable at a glance. */
export function BigButton({ tone: t, label, sub, className, href, onClick, disabled }: Props) {
  const cls = cn("flex w-full flex-col items-center justify-center gap-0.5 rounded-lg px-4 text-center transition duration-150 ease-out hover:brightness-95 disabled:opacity-40 disabled:hover:brightness-100", tone[t], className ?? "min-h-24");
  const inner = (
    <>
      <span className="t-display-m">{label}</span>
      {sub ? <span className="t-secondary">{sub}</span> : null}
    </>
  );
  if (href && !disabled) return <Link href={href} className={cls}>{inner}</Link>;
  return <button type="button" onClick={onClick} disabled={disabled} className={cls}>{inner}</button>;
}
