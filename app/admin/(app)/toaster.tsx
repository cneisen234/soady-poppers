"use client";

import { useEffect, useRef, useState } from "react";

// Reads the `flash` prop (from the admin_toast cookie, passed by the layout) and
// shows a branded toast, then clears the cookie so it doesn't replay. The value
// is "<nonce>|<message>" so repeated identical messages still fire.

type Toast = { id: number; message: string };

export default function Toaster({ flash }: { flash: string }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const lastNonce = useRef<string>("");

  useEffect(() => {
    if (!flash) return;
    const sep = flash.indexOf("|");
    if (sep < 0) return;
    const nonce = flash.slice(0, sep);
    const message = flash.slice(sep + 1);
    if (!message || nonce === lastNonce.current) return;
    lastNonce.current = nonce;

    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, message }]);
    document.cookie = "admin_toast=; Max-Age=0; path=/admin";
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3200);
  }, [flash]);

  if (toasts.length === 0) return null;

  return (
    <div className="admin-toaster" aria-live="polite" aria-atomic="false">
      {toasts.map((t) => (
        <div key={t.id} className="admin-toast" role="status">
          <span className="admin-toast-dot" aria-hidden />
          {t.message}
        </div>
      ))}
    </div>
  );
}
