"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BellIcon, HomeIcon, SlidersIcon } from "./icons";
import { useI18n } from "./i18n-provider";
import { cn } from "@/lib/cn";

export function PassengerNav() {
  const { t, lang } = useI18n();
  const path = usePathname();
  const base = `/${lang}/passenger`;
  const items = [
    { href: base, label: t("nav.home"), Icon: HomeIcon, active: path === base },
    { href: `${base}/alerts`, label: t("nav.alerts"), Icon: BellIcon, active: path.startsWith(`${base}/alerts`) },
    { href: `${base}/settings`, label: t("nav.settings"), Icon: SlidersIcon, active: path.startsWith(`${base}/settings`) },
  ];
  return (
    <nav aria-label="Main" className="sticky bottom-0 z-20 mt-auto flex border-t border-line bg-card pb-[max(env(safe-area-inset-bottom),12px)] pt-2.5">
      {items.map(({ href, label, Icon, active }) => (
        <Link key={href} href={href} aria-current={active ? "page" : undefined} className="relative flex min-h-12 flex-1 flex-col items-center gap-1">
          <span className={cn("h-[3px] w-6 rounded-sm", active ? "bg-taxi" : "bg-transparent")} />
          <Icon className={active ? "text-brand" : "text-ink-2"} />
          <span className={cn("t-meta-m", active ? "text-ink" : "text-ink-2")}>{label}</span>
        </Link>
      ))}
    </nav>
  );
}
