import OrdersBrowser from "./orders-browser";

export const dynamic = "force-dynamic";

export default function AdminOrdersPage() {
  return (
    <>
      <h1 className="admin-h1">Orders</h1>
      <p className="admin-sub">
        Active orders to work through, and everything that's finished.
      </p>
      <OrdersBrowser />
    </>
  );
}
