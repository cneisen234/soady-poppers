"use client";

import { useCallback, useRef, useState } from "react";

export type SaveState = "idle" | "saving" | "saved" | "error";

/** Debounced auto-save: call schedule(fn) on every change; it runs the latest fn
 * after `delay` ms of quiet and tracks the save status. */
export function useAutosave(delay = 600) {
  const [status, setStatus] = useState<SaveState>("idle");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const run = useRef<(() => Promise<void>) | null>(null);

  const schedule = useCallback(
    (fn: () => Promise<void>) => {
      run.current = fn;
      setStatus("saving");
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(async () => {
        try {
          await run.current?.();
          setStatus("saved");
        } catch {
          setStatus("error");
        }
      }, delay);
    },
    [delay],
  );

  return { status, schedule };
}

export function SaveStatus({ status }: { status: SaveState }) {
  if (status === "idle") return null;
  const text =
    status === "saving" ? "Saving…" : status === "saved" ? "Saved ✓" : "Couldn't save";
  return <span className={`admin-savestatus ${status}`}>{text}</span>;
}
