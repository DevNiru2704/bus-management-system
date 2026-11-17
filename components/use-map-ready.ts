import { useEffect, useState } from "react";

/**
 * True only while the page is shown. Next keeps hidden pages alive and re-runs their effects when they return,
 * and Leaflet cannot re-init a used container ("Map container is being reused"). Rendering the map only while
 * this is true gives it a fresh container every time.
 */
export function useMapReady() {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setReady(true);
    return () => setReady(false);
  }, []);
  return ready;
}
