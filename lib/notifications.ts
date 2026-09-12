// Order notifications — email only (per the owners' decision to skip SMS):
//   1. an alert email to the shop (ORDER_ALERT_EMAIL), and
//   2. a branded confirmation email to the customer.
// Both go through Twilio SendGrid. BEST-EFFORT: failures are logged but never
// thrown — the order is already placed and paid, so a notification hiccup must
// not fail the customer's confirmation.
//
// No SDK — plain fetch to SendGrid (matches the fitness-inspired setup).

import type { FulfillmentMethod } from "@/lib/fulfillment";
import { formatCents } from "@/lib/money";
import { formatAddress } from "@/lib/address";

export type OrderNotice = {
  shortId: string;
  method: FulfillmentMethod;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  address?: { line1: string; line2?: string; city: string; state: string; zip: string };
  note?: string;
  couponCode?: string;
  lines: { name: string; qty: number; totalCents: number; detail?: string }[];
  subtotalCents: number;
  discountCents: number;
  taxCents: number;
  feeCents: number;
  totalCents: number;
};
function methodLabel(m: FulfillmentMethod): string {
  return m === "delivery" ? "Local delivery" : m === "shipping" ? "Shipping" : "Pickup";
}
/** Label for the discount line — names the coupon when one was used. */
function discountLabel(n: OrderNotice): string {
  return n.couponCode ? `Coupon (${n.couponCode})` : "Vendor discount";
}

// ---- Low-level SendGrid send ----

async function sendEmail(opts: {
  to: string;
  subject: string;
  text: string;
  html: string;
  replyTo?: { email: string; name?: string };
}): Promise<void> {
  const apiKey = process.env.SENDGRID_API_KEY;
  const from = process.env.ORDER_FROM_EMAIL;
  if (!apiKey || !from) {
    console.warn("[notify] SendGrid not configured — skipping email.");
    return;
  }
  const res = await fetch("https://api.sendgrid.com/v3/mail/send", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: opts.to }] }],
      from: { email: from, name: "Soady Poppers" },
      ...(opts.replyTo ? { reply_to: opts.replyTo } : {}),
      subject: opts.subject,
      // SendGrid requires content parts in increasing preference: text, then HTML.
      content: [
        { type: "text/plain", value: opts.text },
        { type: "text/html", value: opts.html },
      ],
    }),
  });
  if (!res.ok) {
    console.error("[notify] SendGrid send failed:", res.status, await res.text());
  }
}

function itemLinesText(n: OrderNotice): string {
  return n.lines
    .map((l) => {
      const head = `  ${l.qty}× ${l.name} — ${formatCents(l.totalCents)}`;
      return l.detail ? `${head}\n      ${l.detail}` : head;
    })
    .join("\n");
}
function itemRowsHtml(n: OrderNotice): string {
  return n.lines
    .map(
      (l) => `<tr>
        <td style="padding:6px 0;color:#2B2630;">${l.qty}&times; ${l.name}${
          l.detail
            ? `<br><span style="color:#5B5560;font-size:12px;">${l.detail}</span>`
            : ""
        }</td>
        <td style="padding:6px 0;text-align:right;color:#2B2630;vertical-align:top;">${formatCents(l.totalCents)}</td>
      </tr>`,
    )
    .join("");
}
function totalsRowsHtml(n: OrderNotice): string {
  const discount =
    n.discountCents > 0
      ? `<tr><td style="padding:2px 0;color:#256E3A;">${discountLabel(n)}</td><td style="padding:2px 0;text-align:right;color:#256E3A;">-${formatCents(n.discountCents)}</td></tr>`
      : "";
  const fee =
    n.feeCents > 0
      ? `<tr><td style="padding:2px 0;color:#5B5560;">Local delivery</td><td style="padding:2px 0;text-align:right;color:#5B5560;">${formatCents(n.feeCents)}</td></tr>`
      : "";
  return `<tr><td colspan="2" style="border-top:1px solid #EAE0C9;padding-top:8px;"></td></tr>
    <tr><td style="padding:2px 0;color:#5B5560;">Subtotal</td><td style="padding:2px 0;text-align:right;color:#5B5560;">${formatCents(n.subtotalCents)}</td></tr>
    ${discount}
    ${fee}
    <tr><td style="padding:2px 0;color:#5B5560;">Tax</td><td style="padding:2px 0;text-align:right;color:#5B5560;">${formatCents(n.taxCents)}</td></tr>
    <tr><td style="padding:8px 0 0;color:#E8308A;font-weight:bold;font-size:16px;">Total</td><td style="padding:8px 0 0;text-align:right;color:#E8308A;font-weight:bold;font-size:16px;">${formatCents(n.totalCents)}</td></tr>`;
}
function emailShell(headerLabel: string, bodyInner: string): string {
  return `<div style="background:#F6F0DE;padding:24px;font-family:Arial,Helvetica,sans-serif;">
    <div style="max-width:520px;margin:0 auto;background:#FCF8EC;border:2px solid #2B2630;border-radius:16px;overflow:hidden;">
      <div style="background:#256E7A;padding:20px 24px;">
        <h1 style="margin:0;color:#FBF6EA;font-size:22px;">Soady Poppers</h1>
        <p style="margin:4px 0 0;color:#F4CE3C;font-size:12px;letter-spacing:2px;text-transform:uppercase;">${headerLabel}</p>
      </div>
      <div style="padding:24px;">${bodyInner}</div>
    </div>
  </div>`;
}

// ---- Owner alert (to the shop) ----

async function sendOwnerEmail(n: OrderNotice): Promise<void> {
  const to = process.env.ORDER_ALERT_EMAIL;
  if (!to) {
    console.warn("[notify] ORDER_ALERT_EMAIL not set — skipping owner alert.");
    return;
  }

  const contact = [
    `Customer: ${n.customerName}`,
    n.customerPhone ? `Phone: ${n.customerPhone}` : null,
    n.customerEmail ? `Email: ${n.customerEmail}` : null,
    n.method === "delivery" && n.address ? `Deliver to: ${formatAddress(n.address)}` : null,
    n.note ? `Note: ${n.note}` : null,
  ].filter(Boolean);

  const text = `New order #${n.shortId} — ${methodLabel(n.method)}

${contact.join("\n")}

${itemLinesText(n)}

Subtotal: ${formatCents(n.subtotalCents)}${n.discountCents > 0 ? `\n${discountLabel(n)}: -${formatCents(n.discountCents)}` : ""}${n.feeCents > 0 ? `\nLocal delivery: ${formatCents(n.feeCents)}` : ""}
Tax: ${formatCents(n.taxCents)}
Total: ${formatCents(n.totalCents)}`;

  const contactHtml = contact
    .map((c) => `<p style="margin:2px 0;color:#2B2630;font-size:14px;">${c}</p>`)
    .join("");
  const html = emailShell(
    `New ${methodLabel(n.method)} order`,
    `<p style="margin:0 0 12px;color:#2B2630;font-size:16px;"><strong>Order #${n.shortId}</strong></p>
     <div style="margin:0 0 16px;">${contactHtml}</div>
     <table style="width:100%;border-collapse:collapse;font-size:14px;">${itemRowsHtml(n)}${totalsRowsHtml(n)}</table>`,
  );

  await sendEmail({
    to,
    subject: `🥤 New order #${n.shortId} — ${methodLabel(n.method)} — ${n.customerName}`,
    text,
    html,
    // Reply goes straight to the customer's email (no display name, so the
    // shop sees the actual address when they hit Reply).
    replyTo: n.customerEmail ? { email: n.customerEmail } : undefined,
  });
}

// ---- Customer confirmation ----

async function sendCustomerEmail(n: OrderNotice): Promise<void> {
  if (!n.customerEmail) return; // no email given — nothing to send

  const text = `Thanks for your order, ${n.customerName}!

Order #${n.shortId} — ${methodLabel(n.method)}

${itemLinesText(n)}

Subtotal: ${formatCents(n.subtotalCents)}${n.discountCents > 0 ? `\n${discountLabel(n)}: -${formatCents(n.discountCents)}` : ""}${n.feeCents > 0 ? `\nLocal delivery: ${formatCents(n.feeCents)}` : ""}
Tax: ${formatCents(n.taxCents)}
Total: ${formatCents(n.totalCents)}

We'll be in touch shortly. Thanks for supporting Soady Poppers!`;

  const html = emailShell(
    "Order Confirmed",
    `<p style="margin:0 0 4px;color:#2B2630;font-size:16px;">Thanks, ${n.customerName}! 🥤</p>
     <p style="margin:0 0 16px;color:#5B5560;font-size:14px;">Order <strong>#${n.shortId}</strong> &middot; ${methodLabel(n.method)}</p>
     <table style="width:100%;border-collapse:collapse;font-size:14px;">${itemRowsHtml(n)}${totalsRowsHtml(n)}</table>
     <p style="color:#5B5560;font-size:13px;margin:20px 0 0;">We'll have your order ready and reach out shortly. Thanks for supporting a local shop!</p>`,
  );

  // Customer replies go to the shop's inbox.
  const replyTo = process.env.CUSTOMER_REPLY_TO_EMAIL;
  await sendEmail({
    to: n.customerEmail,
    subject: `Your Soady Poppers order is confirmed 🥤 (#${n.shortId})`,
    text,
    html,
    replyTo: replyTo ? { email: replyTo, name: "Soady Poppers" } : undefined,
  });
}

/** Fire both emails; never throws (the order is already placed + paid). */
export async function notifyNewOrder(n: OrderNotice): Promise<void> {
  const results = await Promise.allSettled([sendOwnerEmail(n), sendCustomerEmail(n)]);
  for (const r of results) {
    if (r.status === "rejected") console.error("[notify] notification error:", r.reason);
  }
}

// ---- Status update (ready for pickup / out for delivery) ----

/** Email the customer when their order becomes ready or goes out for delivery. */
export async function notifyOrderStatus(o: {
  shortId: string;
  customerName: string;
  customerEmail?: string;
  status: "ready" | "out_for_delivery";
}): Promise<void> {
  if (!o.customerEmail) return;
  const ready = o.status === "ready";
  const subject = ready
    ? `Your Soady Poppers order is ready for pickup 🥤 (#${o.shortId})`
    : `Your Soady Poppers order is out for delivery 🥤 (#${o.shortId})`;
  const headline = ready ? "Ready for Pickup" : "Out for Delivery";
  const line = ready
    ? "Your order is ready — come grab it at the counter!"
    : "Your order is on its way to you!";

  const text = `Hi ${o.customerName},

${line}

Order #${o.shortId}

Thanks for supporting Soady Poppers!`;

  const html = emailShell(
    headline,
    `<p style="margin:0 0 4px;color:#2B2630;font-size:16px;">Hi ${o.customerName}! 🥤</p>
     <p style="margin:0 0 14px;color:#2B2630;font-size:15px;">${line}</p>
     <p style="margin:0;color:#5B5560;font-size:14px;">Order <strong>#${o.shortId}</strong></p>`,
  );

  const replyTo = process.env.CUSTOMER_REPLY_TO_EMAIL;
  await sendEmail({
    to: o.customerEmail,
    subject,
    text,
    html,
    replyTo: replyTo ? { email: replyTo, name: "Soady Poppers" } : undefined,
  });
}
