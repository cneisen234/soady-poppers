// POST /api/order/quote -> { subtotalCents, taxCents, feeCents, totalCents }
// Live tax/fee/total preview for the checkout summary. Square computes them.

import { quoteOrder, type CheckoutLine } from "@/lib/checkout";
import type { FulfillmentMethod } from "@/lib/fulfillment";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      lines?: CheckoutLine[];
      method?: FulfillmentMethod;
    };
    const lines = body.lines ?? [];
    if (lines.length === 0) {
      return Response.json(
        { ok: false, message: "Cart is empty." },
        { status: 400 },
      );
    }
    const totals = await quoteOrder(lines, body.method ?? "pickup");
    return Response.json({ ok: true, ...totals });
  } catch (err) {
    return Response.json(
      { ok: false, message: err instanceof Error ? err.message : String(err) },
      { status: 500 },
    );
  }
}
