// GET /api/admin/orders — keyset-paginated orders for the admin browser.
// Params: scope=active|completed, q, method=all|pickup|delivery, sort=newest|oldest, cursor.

import { and, asc, desc, eq, ilike, inArray, or, sql, type SQL } from "drizzle-orm";
import { db } from "@/lib/db";
import { orders } from "@/lib/db/schema";
import { isAuthenticated } from "@/lib/auth/session";
import { ACTIVE_STATUSES, COMPLETED_STATUSES } from "@/lib/order-status";

export const dynamic = "force-dynamic";

const LIMIT = 20;

function encodeCursor(o: { createdAt: Date; id: string }): string {
  return Buffer.from(`${o.createdAt.toISOString()}|${o.id}`).toString("base64url");
}
function decodeCursor(c: string): { ts: Date; id: string } | null {
  try {
    const s = Buffer.from(c, "base64url").toString("utf8");
    const i = s.indexOf("|");
    if (i < 0) return null;
    return { ts: new Date(s.slice(0, i)), id: s.slice(i + 1) };
  } catch {
    return null;
  }
}

export async function GET(req: Request) {
  if (!(await isAuthenticated())) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const scope = url.searchParams.get("scope") === "completed" ? "completed" : "active";
  const q = (url.searchParams.get("q") ?? "").trim();
  const method = url.searchParams.get("method") ?? "all";
  const oldest = url.searchParams.get("sort") === "oldest";
  const cursor = url.searchParams.get("cursor");

  const statuses = scope === "completed" ? COMPLETED_STATUSES : ACTIVE_STATUSES;
  const conds: SQL[] = [inArray(orders.status, [...statuses])];
  if (method === "pickup" || method === "delivery") {
    conds.push(eq(orders.method, method));
  }
  if (q) {
    conds.push(or(ilike(orders.shortId, `%${q}%`), ilike(orders.customerName, `%${q}%`))!);
  }
  if (cursor) {
    const d = decodeCursor(cursor);
    if (d) {
      conds.push(
        oldest
          ? sql`(${orders.createdAt}, ${orders.id}) > (${d.ts}, ${d.id})`
          : sql`(${orders.createdAt}, ${orders.id}) < (${d.ts}, ${d.id})`,
      );
    }
  }

  const rows = await db
    .select({
      id: orders.id,
      shortId: orders.shortId,
      createdAt: orders.createdAt,
      customerName: orders.customerName,
      method: orders.method,
      totalCents: orders.totalCents,
      status: orders.status,
    })
    .from(orders)
    .where(and(...conds))
    .orderBy(
      oldest ? asc(orders.createdAt) : desc(orders.createdAt),
      oldest ? asc(orders.id) : desc(orders.id),
    )
    .limit(LIMIT + 1);

  const hasMore = rows.length > LIMIT;
  const page = rows.slice(0, LIMIT);
  const nextCursor = hasMore ? encodeCursor(page[page.length - 1]) : null;

  return Response.json({
    orders: page.map((o) => ({
      id: o.id,
      shortId: o.shortId,
      createdAt: o.createdAt.toISOString(),
      customerName: o.customerName,
      method: o.method,
      totalCents: o.totalCents,
      status: o.status,
    })),
    nextCursor,
  });
}
