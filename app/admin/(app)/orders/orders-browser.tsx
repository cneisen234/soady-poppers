"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { statusLabel, statusTagClass } from "@/lib/order-status";
import { formatCents } from "@/lib/money";
import { formatOrderTime } from "@/lib/datetime";

type Row = {
  id: string;
  shortId: string;
  createdAt: string;
  customerName: string;
  method: string;
  totalCents: number;
  status: string;
};

type Tab = "active" | "completed" | "discounts" | "coupons";

export default function OrdersBrowser({
  discountsPanel,
  couponsPanel,
}: {
  discountsPanel: ReactNode;
  couponsPanel: ReactNode;
}) {
  const [tab, setTab] = useState<Tab>("active");
  const [q, setQ] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  const [method, setMethod] = useState("all");
  const [sort, setSort] = useState("newest");

  const [rows, setRows] = useState<Row[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const reqId = useRef(0);

  // Debounce the search box.
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(q.trim()), 300);
    return () => clearTimeout(t);
  }, [q]);

  const load = useCallback(
    async (reset: boolean, nextCursor?: string | null) => {
      const params = new URLSearchParams({ scope: tab, method, sort });
      if (debouncedQ) params.set("q", debouncedQ);
      if (!reset && nextCursor) params.set("cursor", nextCursor);

      if (reset) setLoading(true);
      else setLoadingMore(true);
      const myReq = ++reqId.current;

      try {
        const res = await fetch(`/api/admin/orders?${params.toString()}`);
        const data = await res.json();
        if (myReq !== reqId.current) return; // a newer request superseded this one
        const incoming: Row[] = data.orders ?? [];
        setRows((prev) => (reset ? incoming : [...prev, ...incoming]));
        setCursor(data.nextCursor ?? null);
      } catch {
        if (myReq === reqId.current && reset) setRows([]);
      } finally {
        if (myReq === reqId.current) {
          setLoading(false);
          setLoadingMore(false);
        }
      }
    },
    [tab, method, sort, debouncedQ],
  );

  // Refetch from the top whenever the tab / filters / sort change.
  // The Discounts and Coupons tabs aren't order data, so they never fetch.
  useEffect(() => {
    if (tab !== "discounts" && tab !== "coupons") load(true);
  }, [load, tab]);

  return (
    <>
      <div className="admin-tabs">
        <button
          type="button"
          className={`admin-tab ${tab === "active" ? "active" : ""}`}
          onClick={() => setTab("active")}
        >
          Active
        </button>
        <button
          type="button"
          className={`admin-tab ${tab === "completed" ? "active" : ""}`}
          onClick={() => setTab("completed")}
        >
          Completed
        </button>
        <button
          type="button"
          className={`admin-tab ${tab === "discounts" ? "active" : ""}`}
          onClick={() => setTab("discounts")}
        >
          Discounts
        </button>
        <button
          type="button"
          className={`admin-tab ${tab === "coupons" ? "active" : ""}`}
          onClick={() => setTab("coupons")}
        >
          Coupons
        </button>
      </div>

      {tab === "discounts" ? (
        discountsPanel
      ) : tab === "coupons" ? (
        couponsPanel
      ) : (
      <>
      <div className="admin-filters">
        <div className="admin-search">
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search order # or name…"
            className="admin-input sm no-native-clear"
            aria-label="Search orders"
          />
          {q && (
            <button
              type="button"
              className="admin-search-clear"
              aria-label="Clear search"
              onClick={() => setQ("")}
            >
              ✕
            </button>
          )}
        </div>
        <select
          value={method}
          onChange={(e) => setMethod(e.target.value)}
          className="admin-input sm"
          aria-label="Filter by method"
        >
          <option value="all">All methods</option>
          <option value="pickup">Pickup</option>
          <option value="delivery">Delivery</option>
        </select>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="admin-input sm"
          aria-label="Sort"
        >
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
        </select>
      </div>

      <div className="admin-tablewrap">
        <table className="admin-table cards item-cards">
          <thead>
            <tr>
              <th>Order</th>
              <th>Placed</th>
              <th>Customer</th>
              <th>Method</th>
              <th>Total</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((o) => (
              <tr key={o.id}>
                <td data-label="Order">
                  <div className="admin-order-cell">
                    <span className="admin-order-id">#{o.shortId}</span>
                    <Link
                      href={`/admin/orders/${o.id}`}
                      className="admin-btn sm"
                      aria-label={`Open order #${o.shortId}`}
                    >
                      Open
                    </Link>
                  </div>
                </td>
                <td data-label="Placed">{formatOrderTime(o.createdAt)}</td>
                <td data-label="Customer">{o.customerName}</td>
                <td data-label="Method" style={{ textTransform: "capitalize" }}>
                  {o.method}
                </td>
                <td className="admin-num" data-label="Total">
                  {formatCents(o.totalCents)}
                </td>
                <td data-label="Status">
                  <span className={`admin-tag ${statusTagClass(o.status)}`}>
                    {statusLabel(o.status)}
                  </span>
                </td>
              </tr>
            ))}
            {!loading && rows.length === 0 && (
              <tr>
                <td colSpan={6} className="admin-empty">
                  {tab === "active" ? "No active orders." : "No completed orders."}
                </td>
              </tr>
            )}
            {loading && (
              <tr>
                <td colSpan={6} className="admin-empty">
                  Loading…
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {cursor && !loading && (
        <div style={{ display: "flex", justifyContent: "center", marginTop: 18 }}>
          <button
            type="button"
            className="admin-btn ghost"
            onClick={() => load(false, cursor)}
            disabled={loadingMore}
          >
            {loadingMore ? "Loading…" : "Load more"}
          </button>
        </div>
      )}
      </>
      )}
    </>
  );
}
