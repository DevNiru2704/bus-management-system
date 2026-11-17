import Link from "next/link";
import { cn } from "@/lib/cn";

const variants = {
  primary: "bg-taxi text-on-taxi",
  dark: "bg-brand text-white",
  secondary: "bg-card text-ink border-[1.5px] border-line-strong",
  danger: "bg-st-breakdown text-white",
} as const;

type Common = { variant?: keyof typeof variants; full?: boolean; className?: string; children: React.ReactNode };
type AsLink = Common & { href: string; onClick?: never; type?: never; disabled?: never };
type AsButton = Common & { href?: never; onClick?: () => void; type?: "button" | "submit"; disabled?: boolean };

export function Button(props: AsLink | AsButton) {
  const { variant = "primary", full, className, children } = props;
  const cls = cn(
    "t-body-m inline-flex min-h-[52px] items-center justify-center rounded-md px-6 py-3.5 text-center transition duration-150 ease-out hover:brightness-95 disabled:opacity-40 disabled:hover:brightness-100",
    variants[variant],
    full && "w-full",
    className,
  );
  if ("href" in props && props.href) return <Link href={props.href} className={cls}>{children}</Link>;
  const b = props as AsButton;
  return <button type={b.type ?? "button"} onClick={b.onClick} disabled={b.disabled} className={cls}>{children}</button>;
}
