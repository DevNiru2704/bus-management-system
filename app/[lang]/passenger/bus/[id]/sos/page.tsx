import { Suspense } from "react";
import { notFound } from "next/navigation";
import { SosFlow } from "@/components/sos-flow";
import { FLEET } from "@/lib/sim/data.ts";

export function generateStaticParams() {
  return FLEET.map((b) => ({ id: b.id }));
}

async function Sos({ params }: { params: PageProps<"/[lang]/passenger/bus/[id]/sos">["params"] }) {
  const { id } = await params;
  if (!FLEET.some((b) => b.id === id)) notFound();
  return <SosFlow busId={id} />;
}

export default function SosPage({ params }: PageProps<"/[lang]/passenger/bus/[id]/sos">) {
  return (
    <Suspense fallback={<div className="min-h-dvh" aria-hidden />}>
      <Sos params={params} />
    </Suspense>
  );
}
