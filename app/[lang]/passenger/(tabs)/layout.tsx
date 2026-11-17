import { Suspense } from "react";
import { PassengerNav } from "@/components/passenger-nav";

export default function TabsLayout({ children }: LayoutProps<"/[lang]/passenger">) {
  return (
    <>
      <div className="flex flex-1 flex-col">{children}</div>
      <Suspense fallback={<div className="mt-auto h-[76px] border-t border-line bg-card" aria-hidden />}>
        <PassengerNav />
      </Suspense>
    </>
  );
}
