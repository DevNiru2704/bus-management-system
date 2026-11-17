import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { hasLocale, locales, pickLocale } from "@/lib/i18n";

// Next 16 calls middleware "proxy". Sends "/" or "/passenger" to "/en/..." (or bn / hi),
// using the saved choice first and the browser language second.
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const first = pathname.split("/")[1] ?? "";
  if (locales.some((l) => l === first)) return;

  const saved = request.cookies.get("sb-lang")?.value;
  const locale = saved && hasLocale(saved) ? saved : pickLocale(request.headers.get("accept-language"));
  const url = request.nextUrl.clone();
  url.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  // Skip Next internals and files with an extension (icons, manifest, images).
  matcher: ["/((?!_next|api|.*\\..*).*)"],
};
