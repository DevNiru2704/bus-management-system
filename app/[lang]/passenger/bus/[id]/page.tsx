import { Suspense } from "react";
import { notFound } from "next/navigation";
import { LiveScreen } from "@/components/live-screen";
import { FLEET } from "@/lib/sim/data.ts";

export function generateStaticParams() {
  return FLEET.map((b) => ({ id: b.id }));
}

async function Bus({ params }: { params: PageProps<"/[lang]/passenger/bus/[id]">["params"] }) {
  const { id } = await params;
  if (!FLEET.some((b) => b.id === id)) notFound();
  return <LiveScreen busId={id} />;
}

// Reading the route param inside <Suspense> keeps the page shell instant, as Next 16 Cache Components expects.
export default function BusPage({ params }: PageProps<"/[lang]/passenger/bus/[id]">) {
  return (
    <Suspense fallback={<div className="h-dvh bg-map-land" aria-hidden />}>
      <Bus params={params} />
    </Suspense>
  );
}
