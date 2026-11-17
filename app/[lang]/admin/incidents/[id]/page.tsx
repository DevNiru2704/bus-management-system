import { Suspense } from "react";
import { IncidentDetail } from "@/components/incident-detail";

async function Detail({ params }: { params: PageProps<"/[lang]/admin/incidents/[id]">["params"] }) {
  const { id } = await params;
  return <IncidentDetail id={decodeURIComponent(id)} />;
}

// Incident ids are created while the app runs, so this page is rendered on request.
export default function IncidentPage({ params }: PageProps<"/[lang]/admin/incidents/[id]">) {
  return (
    <Suspense fallback={<div className="h-dvh bg-map-land" aria-hidden />}>
      <Detail params={params} />
    </Suspense>
  );
}
