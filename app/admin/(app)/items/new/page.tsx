import Link from "next/link";
import { asc } from "drizzle-orm";
import { db } from "@/lib/db";
import { categories } from "@/lib/db/schema";
import { createProduct } from "../actions";

export const dynamic = "force-dynamic";

export default async function NewItemPage() {
  const cats = await db
    .select()
    .from(categories)
    .orderBy(asc(categories.sort), asc(categories.name));

  return (
    <>
      <h1 className="admin-h1">New item</h1>
      <p className="admin-sub">Create the item, then add sizes, pricing, and a photo.</p>
      <form action={createProduct} className="admin-card admin-form">
        <label className="admin-field">
          <span>Name</span>
          <input
            name="name"
            required
            autoFocus
            className="admin-input"
            placeholder="e.g. Love You Cherry Much"
          />
        </label>
        <label className="admin-field">
          <span>Category</span>
          <select name="categoryId" className="admin-input" defaultValue="">
            <option value="">— None —</option>
            {cats.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <div className="admin-actions">
          <Link href="/admin/items" className="admin-btn ghost">
            Cancel
          </Link>
          <button type="submit" className="admin-btn">
            Create &amp; continue
          </button>
        </div>
      </form>
    </>
  );
}
