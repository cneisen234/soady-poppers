"use client";

import { useEffect, useRef, useState } from "react";

// Branded confirm dialog for destructive actions. Renders a trigger button; on
// click it opens an in-app modal, and only on Confirm does it submit the given
// server action. No window.confirm / alert.

type Props = {
  action: (formData: FormData) => void | Promise<void>;
  fields: Record<string, string>;
  title: string;
  message?: string;
  triggerClass?: string;
  triggerLabel?: React.ReactNode;
  triggerAriaLabel?: string;
  confirmLabel?: string;
};

export default function ConfirmDelete({
  action,
  fields,
  title,
  message,
  triggerClass = "admin-btn sm danger",
  triggerLabel = "Delete",
  triggerAriaLabel,
  confirmLabel = "Delete",
}: Props) {
  const [open, setOpen] = useState(false);
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    cancelRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <button
        type="button"
        className={triggerClass}
        onClick={() => setOpen(true)}
        aria-label={triggerAriaLabel}
        title={triggerAriaLabel}
      >
        {triggerLabel}
      </button>
      {open && (
        <div className="admin-modal-backdrop" onClick={() => setOpen(false)}>
          <div
            className="admin-modal"
            role="dialog"
            aria-modal="true"
            aria-label={title}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="admin-modal-title">{title}</h3>
            {message && <p className="admin-modal-msg">{message}</p>}
            <div className="admin-modal-actions">
              <button
                ref={cancelRef}
                type="button"
                className="admin-btn ghost"
                onClick={() => setOpen(false)}
              >
                Cancel
              </button>
              <form action={action}>
                {Object.entries(fields).map(([k, v]) => (
                  <input key={k} type="hidden" name={k} value={v} />
                ))}
                <button type="submit" className="admin-btn danger">
                  {confirmLabel}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
