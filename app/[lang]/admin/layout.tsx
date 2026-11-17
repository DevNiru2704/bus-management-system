import { Suspense } from "react";
import { AdminRail } from "@/components/admin-rail";

// usePathname() inside the rail needs the request, so the rail streams in behind a same-size placeholder.
export default function AdminLayout({ children }: LayoutProps<"/[lang]/admin">) {
  return (
    <div className="flex min-h-dvh bg-page">
      <Suspense fallback={<div className="sticky top-0 h-dvh w-[72px] shrink-0 bg-brand" aria-hidden />}>
        <AdminRail />
      </Suspense>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
