"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BusMark } from "./icons";
import { useI18n } from "./i18n-provider";
import { cn } from "@/lib/cn";

const items = [
  { key: "live", path: "", d: "M4 17 L10 4 L16 17 L10 13 Z" },
  { key: "incidents", path: "/incidents", d: "M10 3 L18 17 H2 Z M10 8 V12 M10 14.5 V14.6" },
  { key: "buses", path: "/buses", d: "M4 5 H16 V15 H4 Z M4 10 H16 M7 17 V18 M13 17 V18" },
  { key: "drivers", path: "/drivers", d: "M10 9 A3 3 0 1 0 10 3 A3 3 0 1 0 10 9 M4 17 Q4 12 10 12 Q16 12 16 17" },
  { key: "routes", path: "/routes/24", d: "M4 16 Q4 10 10 10 Q16 10 16 4 M3 17 H5 M15 3 H17" },
  { key: "analytics", path: "/analytics", d: "M4 16 V10 M10 16 V4 M16 16 V8" },
] as const;

/** The admin's side rail: icons only, with the name as a tooltip and a screen-reader label. */
export function AdminRail() {
  const { t, lang } = useI18n();
  const path = usePathname();
  const base = `/${lang}/admin`;
  return (
    <nav aria-label="Admin" className="sticky top-0 z-30 flex h-dvh w-[72px] shrink-0 flex-col items-center gap-2 bg-brand py-5">
      <Link href={`/${lang}`} aria-label={t("common.appName")}><BusMark size={44} /></Link>
      <div className="h-4" />
      {items.map((it) => {
        const href = base + it.path;
        const active = it.path === "" ? path === base : path.startsWith(base + (it.path.startsWith("/routes") ? "/routes" : it.path));
        const label = t(`admin.nav.${it.key}`);
        return (
          <Link key={it.key} href={href} title={label} aria-label={label} aria-current={active ? "page" : undefined} className={cn("grid size-12 place-items-center rounded-md transition-colors duration-150 ease-out hover:bg-brand-deep", active ? "bg-brand-deep text-taxi" : "text-white/70")}>
            <svg viewBox="0 0 20 20" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d={it.d} /></svg>
          </Link>
        );
      })}
    </nav>
  );
}
