// Pilot Light's calls to this site (docs/site-conventions.md §3, in Pilot Light),
// through the site module: every request is checked (signed, recent, never
// repeated) before this site's own code runs. `ping` is built in.
//
// Declared in Pilot Light with `npm run site:actions` (site-actions.json):
//   order-status: after the owner moves an order to Ready or Out for delivery,
//   email the customer (the same email this site's admin sent).

import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { orders } from "@/lib/db/schema";
import { notifyOrderStatus } from "@/lib/notifications";
import { pilotLightRoute, SiteActionRefused, type SiteActionRequest } from "@/lib/pilot-light";

async function orderStatus(req: SiteActionRequest) {
  if (req.operation !== "status" || !req.id) throw new SiteActionRefused("this action is for order status changes");
  if (req.to !== "ready" && req.to !== "out_for_delivery") return { message: "sent no email (there's none for that status)" };
  const [order] = await db
    .select({ shortId: orders.shortId, customerName: orders.customerName, customerEmail: orders.customerEmail })
    .from(orders)
    .where(eq(orders.id, req.id))
    .limit(1);
  if (!order) throw new SiteActionRefused("that order isn't on the website");
  const sent = await notifyOrderStatus({ shortId: order.shortId, customerName: order.customerName, customerEmail: order.customerEmail ?? undefined, status: req.to });
  if (!sent) return { message: "didn't email the customer: they didn't leave an email address" };
  if (!sent.ok) throw new SiteActionRefused(sent.reason === "server-misconfigured" ? "the website's email isn't set up" : "the email couldn't be sent");
  // Read by the owner after "Your website …" (docs/site-conventions.md §3).
  return { message: `emailed the customer that their order is ${req.to === "out_for_delivery" ? "out for delivery" : "ready"}` };
}

export const POST = pilotLightRoute({ "order-status": orderStatus });
