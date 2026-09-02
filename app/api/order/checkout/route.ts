// POST /api/order/checkout
// Body: { lines, customer, sourceId, fulfillment: {method, address?} }
// Validates the cart + fulfillment, creates the Order, and charges the card.

import {
  validateLines,
  validateFulfillment,
  placeOrder,
  type CheckoutLine,
  type Customer,
  type Fulfillment,
} from "@/lib/checkout";
import { verifyRecaptcha } from "@/lib/recaptcha";

export const dynamic = "force-dynamic";

type Body = {
  lines?: CheckoutLine[];
  customer?: Customer;
  sourceId?: string;
  fulfillment?: Fulfillment;
  recaptchaToken?: string;
};

export async function POST(request: Request) {
  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return Response.json({ ok: false, message: "Invalid request." }, { status: 400 });
  }

  const lines = body.lines ?? [];
  const customer = body.customer;
  const sourceId = body.sourceId;
  const fulfillment = body.fulfillment ?? { method: "pickup" as const };

  if (!customer?.name?.trim()) {
    return Response.json(
      { ok: false, message: "Please enter your name." },
      { status: 400 },
    );
  }
  if (!sourceId) {
    return Response.json(
      { ok: false, message: "Missing payment details." },
      { status: 400 },
    );
  }

  // reCAPTCHA v3 — block bot / card-testing orders before doing any work.
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const recaptcha = await verifyRecaptcha(body.recaptchaToken, "checkout", ip);
  if (!recaptcha.ok) {
    return Response.json(
      { ok: false, message: "We couldn't verify your request. Please try again." },
      { status: 403 },
    );
  }

  // Validate the chosen fulfillment method + its required fields.
  const fulfillmentCheck = validateFulfillment(fulfillment);
  if (!fulfillmentCheck.ok) {
    return Response.json(
      { ok: false, message: fulfillmentCheck.problems.join(" ") },
      { status: 400 },
    );
  }

  // Re-validate against live catalog + kill switch before charging.
  const validation = await validateLines(lines);
  if (!validation.ok) {
    return Response.json(
      { ok: false, message: validation.problems.join(" "), problems: validation.problems },
      { status: 409 },
    );
  }

  try {
    const result = await placeOrder(lines, customer, sourceId, fulfillment);
    return Response.json({ ok: true, ...result });
  } catch (err) {
    return Response.json(
      {
        ok: false,
        message:
          err instanceof Error
            ? err.message
            : "Payment could not be processed.",
      },
      { status: 402 },
    );
  }
}
