"use client";

import dynamic from "next/dynamic";

export const FleetMap = dynamic(() => import("./fleet-map"), {
  ssr: false,
  loading: () => <div className="size-full bg-map-land" aria-hidden />,
});
