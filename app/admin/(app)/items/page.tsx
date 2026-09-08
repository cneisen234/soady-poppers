import Link from "next/link";
import { db } from "@/lib/db";
import { deleteProduct } from "./actions";
import ConfirmDelete from "../confirm-delete";
import { PenIcon, TrashIcon } from "../icons";
import { formatCents } from "@/lib/money";

export const dynamic = "force-dynamic";

function priceLabel(prices: number[]): string {
  if (prices.length === 0) return "—";
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  return min === max ? formatCents(min) : `${formatCents(min)}–${formatCents(max)}`;
}

export default async function AdminItemsPage() {
  const prods = await db.query.products.findMany({
    with: {
      category: true,
      variations: true,
      images: { orderBy: (i, { asc }) => [asc(i.sort)] },
    },
    orderBy: (p, { asc }) => [asc(p.sort), asc(p.name)],
  });

  return (
    <>
      <div className="admin-row-between">
        <h1 className="admin-h1">Items</h1>
        <div className="admin-actions">
          <Link href="/admin/items/categories" className="admin-btn ghost">
            Manage categories
          </Link>
          <Link href="/admin/items/new" className="admin-btn">
            + New item
          </Link>
        </div>
      </div>
      <p className="admin-sub">{prods.length} items</p>

      <div className="admin-tablewrap">
        <table className="admin-table cards item-cards">
          <thead>
            <tr>
              <th>Name</th>
              <th>Category</th>
              <th>Price</th>
              <th>Sizes</th>
              <th>Status</th>
              <th aria-label="Actions" />
            </tr>
          </thead>
          <tbody>
            {prods.map((p) => {
              const anyAvailable = p.variations.some((v) => v.available && !v.soldOut);
              const status = p.hidden
                ? { cls: "off", label: "Hidden" }
                : !p.available || !anyAvailable
                  ? { cls: "warn", label: "Out of stock" }
                  : { cls: "on", label: "Live" };
              return (
                <tr key={p.id}>
                  <td data-label="Name">
                    <Link href={`/admin/items/${p.id}`} className="admin-link">
                      {p.name}
                    </Link>
                  </td>
                  <td data-label="Category">
                    {p.category?.name ?? <span className="admin-muted">—</span>}
                  </td>
                  <td className="admin-num" data-label="Price">
                    {priceLabel(p.variations.map((v) => v.priceCents))}
                  </td>
                  <td className="admin-num" data-label="Sizes">
                    {p.variations.length}
                  </td>
                  <td data-label="Status">
                    <span className={`admin-tag ${status.cls}`}>{status.label}</span>
                  </td>
                  <td className="admin-num">
                    <div className="admin-actions">
                      <Link
                        href={`/admin/items/${p.id}`}
                        className="admin-btn sm ghost"
                        aria-label="Edit"
                        title="Edit"
                      >
                        <PenIcon />
                      </Link>
                      <ConfirmDelete
                        action={deleteProduct}
                        fields={{ id: p.id }}
                        title={`Delete “${p.name}”?`}
                        message="This permanently removes the item, its sizes, and its photos. This can’t be undone."
                        triggerLabel={<TrashIcon />}
                        triggerAriaLabel="Delete item"
                      />
                    </div>
                  </td>
                </tr>
              );
            })}
            {prods.length === 0 && (
              <tr>
                <td colSpan={6} className="admin-empty">
                  No items yet. Create one with “New item”.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
