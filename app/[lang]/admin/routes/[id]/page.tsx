import { Suspense } from "react";
import { notFound } from "next/navigation";
import { RouteEditor } from "@/components/route-editor";
import { ROUTES } from "@/lib/sim/data.ts";

export function generateStaticParams() {
  return Object.keys(ROUTES).map((id) => ({ id }));
}

async function Editor({ params }: { params: PageProps<"/[lang]/admin/routes/[id]">["params"] }) {
  const { id } = await params;
  if (!ROUTES[id]) notFound();
  return <RouteEditor routeId={id} />;
}

export default function RoutePage({ params }: PageProps<"/[lang]/admin/routes/[id]">) {
  return (
    <Suspense fallback={<div className="h-dvh bg-map-land" aria-hidden />}>
      <Editor params={params} />
    </Suspense>
  );
}
