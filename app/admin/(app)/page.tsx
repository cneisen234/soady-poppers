import { count } from "drizzle-orm";
import { db } from "@/lib/db";
import { products, categories, orders, settings } from "@/lib/db/schema";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const [prod, cat, ord, setting] = await Promise.all([
    db.select({ c: count() }).from(products),
    db.select({ c: count() }).from(categories),
    db.select({ c: count() }).from(orders),
    db.select().from(settings).limit(1),
  ]);

  const accepting = setting[0]?.acceptingOrders ?? true;

  return (
    <>
      <h1 className="admin-h1">Dashboard</h1>
      <p className="admin-sub">
        Online ordering is{" "}
        <span className={`admin-pill ${accepting ? "on" : "off"}`}>
          {accepting ? "● accepting orders" : "● paused"}
        </span>
      </p>

      <div className="admin-stat-grid">
        <div className="admin-stat">
          <div className="n">{prod[0]?.c ?? 0}</div>
          <div className="l">Products</div>
        </div>
        <div className="admin-stat">
          <div className="n">{cat[0]?.c ?? 0}</div>
          <div className="l">Categories</div>
        </div>
        <div className="admin-stat">
          <div className="n">{ord[0]?.c ?? 0}</div>
          <div className="l">Orders</div>
        </div>
      </div>

      <div className="admin-card">
        <p className="admin-stub" style={{ margin: 0 }}>
          Item management arrives in Step 4, order management and settings in Step 6.
          The counts above read live from Postgres — auth and the shell are working.
        </p>
      </div>
    </>
  );
}
