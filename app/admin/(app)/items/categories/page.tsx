import Link from "next/link";
import { asc, count } from "drizzle-orm";
import { db } from "@/lib/db";
import { categories, products } from "@/lib/db/schema";
import { createCategory } from "../actions";
import CategoryRow from "./category-row";

export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  const [cats, counts] = await Promise.all([
    db.select().from(categories).orderBy(asc(categories.sort), asc(categories.name)),
    db
      .select({ categoryId: products.categoryId, c: count() })
      .from(products)
      .groupBy(products.categoryId),
  ]);
  const countByCat = new Map(counts.map((r) => [r.categoryId, r.c]));

  return (
    <>
      <Link href="/admin/items" className="admin-link">
        ← Items
      </Link>
      <h1 className="admin-h1" style={{ marginTop: 6 }}>
        Categories
      </h1>
      <p className="admin-sub">
        Deleting a category leaves its items uncategorized — it never deletes items.
      </p>

      <div className="admin-card">
        {cats.map((c) => (
          <CategoryRow
            key={c.id}
            id={c.id}
            name={c.name}
            itemCount={countByCat.get(c.id) ?? 0}
          />
        ))}
        {cats.length === 0 && (
          <p className="admin-stub" style={{ margin: "6px 0" }}>
            No categories yet.
          </p>
        )}

        <form action={createCategory} className="admin-list-add">
          <input name="name" placeholder="New category name" className="admin-input" required />
          <button type="submit" className="admin-btn">
            + Add category
          </button>
        </form>
      </div>
    </>
  );
}
