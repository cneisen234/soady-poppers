// Shop settings — read from the singleton `settings` row (seeded in Step 1,
// editable from the admin in Step 6). Server-only; cached per request.

import "server-only";
import { cache } from "react";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { settings } from "@/lib/db/schema";
import { DEFAULT_HOURS, type WeekHours } from "@/lib/status";

export type Settings = {
  acceptingOrders: boolean;
  pausedMessage: string | null;
  taxRateBps: number;
  deliveryPerItemCents: number;
  deliveryFlatCents: number;
  deliveryFlatMinItems: number;
  deliveryFreeMinItems: number;
  hours: WeekHours;
};

// Coerce the stored JSON into a valid week of hours, falling back to defaults.
function coerceHours(raw: unknown): WeekHours {
  if (!raw || typeof raw !== "object") return DEFAULT_HOURS;
  const src = raw as Record<string, unknown>;
  const out: WeekHours = {};
  for (let d = 0; d < 7; d++) {
    const v = src[String(d)];
    if (v && typeof v === "object" && "open" in v && "close" in v) {
      const o = Number((v as { open: unknown }).open);
      const c = Number((v as { close: unknown }).close);
      out[d] = Number.isFinite(o) && Number.isFinite(c) ? { open: o, close: c } : null;
    } else {
      out[d] = null;
    }
  }
  return out;
}

const DEFAULTS: Settings = {
  acceptingOrders: true,
  pausedMessage: null,
  taxRateBps: 600,
  deliveryPerItemCents: 200,
  deliveryFlatCents: 500,
  deliveryFlatMinItems: 5,
  deliveryFreeMinItems: 10,
  hours: DEFAULT_HOURS,
};

export const getSettings = cache(async (): Promise<Settings> => {
  const [row] = await db.select().from(settings).where(eq(settings.id, 1)).limit(1);
  if (!row) return DEFAULTS;
  return {
    acceptingOrders: row.acceptingOrders,
    pausedMessage: row.pausedMessage,
    taxRateBps: row.taxRateBps,
    deliveryPerItemCents: row.deliveryPerItemCents,
    deliveryFlatCents: row.deliveryFlatCents,
    deliveryFlatMinItems: row.deliveryFlatMinItems,
    deliveryFreeMinItems: row.deliveryFreeMinItems,
    hours: coerceHours(row.hours),
  };
});

/**
 * Delivery fee for a given item count, using the configured tiers:
 *   under flatMin     -> perItem × count
 *   flatMin..freeMin-1 -> flat
 *   freeMin and up     -> free
 */
export function deliveryFeeCents(itemCount: number, s: Settings): number {
  if (itemCount <= 0) return 0;
  if (itemCount >= s.deliveryFreeMinItems) return 0;
  if (itemCount >= s.deliveryFlatMinItems) return s.deliveryFlatCents;
  return itemCount * s.deliveryPerItemCents;
}
