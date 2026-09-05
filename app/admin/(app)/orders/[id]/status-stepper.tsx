"use client";

import { useState, useTransition } from "react";
import { advanceOrderStatus } from "../actions";
import { stepsForMethod, statusLabel, type OrderStatus } from "@/lib/order-status";

export default function StatusStepper({
  orderId,
  method,
  status,
}: {
  orderId: string;
  method: string;
  status: string;
}) {
  const steps = stepsForMethod(method);
  const curIdx = steps.findIndex((s) => s.status === status);
  const [target, setTarget] = useState<OrderStatus | null>(null);
  const [pending, start] = useTransition();

  // Terminal orders (refunded / cancelled) aren't on the ladder.
  if (curIdx < 0) {
    return (
      <p className="admin-sub" style={{ margin: 0 }}>
        This order is {statusLabel(status).toLowerCase()}.
      </p>
    );
  }

  const targetLabel = steps.find((s) => s.status === target)?.label ?? "";
  const emailNote =
    target === "ready"
      ? "This emails the customer that their order is ready for pickup."
      : target === "out_for_delivery"
        ? "This emails the customer that their order is out for delivery."
        : "";

  function confirm() {
    if (!target) return;
    start(async () => {
      await advanceOrderStatus(orderId, target);
      setTarget(null);
    });
  }

  return (
    <>
      <div className="admin-stepper">
        {steps.map((s, i) => {
          const state = i < curIdx ? "done" : i === curIdx ? "current" : "next";
          return (
            <button
              key={s.status}
              type="button"
              className={`admin-step ${state}`}
              disabled={state !== "next" || pending}
              onClick={() => state === "next" && setTarget(s.status)}
            >
              {state === "done" && <span aria-hidden>✓ </span>}
              {s.label}
            </button>
          );
        })}
      </div>

      {target && (
        <div
          className="admin-modal-backdrop"
          onClick={() => !pending && setTarget(null)}
        >
          <div
            className="admin-modal"
            role="dialog"
            aria-modal="true"
            aria-label={`Mark as ${targetLabel}`}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="admin-modal-title">Mark as “{targetLabel}”?</h3>
            {emailNote && <p className="admin-modal-msg">{emailNote}</p>}
            <div className="admin-modal-actions">
              <button
                type="button"
                className="admin-btn ghost"
                onClick={() => setTarget(null)}
                disabled={pending}
              >
                Cancel
              </button>
              <button type="button" className="admin-btn" onClick={confirm} disabled={pending}>
                {pending ? "Updating…" : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
