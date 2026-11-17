"use client";

import dynamic from "next/dynamic";

// Leaflet touches `window`, so the map only loads in the browser.
export const LiveMap = dynamic(() => import("./live-map"), {
  ssr: false,
  loading: () => <div className="size-full bg-map-land" aria-hidden />,
});
