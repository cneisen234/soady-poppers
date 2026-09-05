import { useEffect, useState } from "react";
import { getOpenStatus, type OpenState, type WeekHours } from "@/lib/status";

/**
 * Live open/closed state for the shop. Returns null until hydrated on the client
 * (so the server renders a stable placeholder, avoiding a clock-driven hydration
 * mismatch), then refreshes every minute.
 */
export function useOpenStatus(hours?: WeekHours): OpenState | null {
  const [status, setStatus] = useState<OpenState | null>(null);

  useEffect(() => {
    const update = () => setStatus(getOpenStatus(new Date(), hours));
    update();
    const id = setInterval(update, 60_000);
    return () => clearInterval(id);
  }, [hours]);

  return status;
}
