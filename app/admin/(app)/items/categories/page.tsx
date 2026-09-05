import Link from "next/link";
import { asc, count } from "drizzle-orm";
import { db } from "@/lib/db";
import { categories, products } from "@/lib/db/schema";
import { createCategory, renameCategory, deleteCategory } from "../actions";
import ConfirmDelete from "../../confirm-delete";
import { FloppyIcon, TrashIcon } from "../../icons";

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
        {cats.map((c) => {
          const n = countByCat.get(c.id) ?? 0;
          return (
            <div className="admin-list-row" key={c.id}>
              <form action={renameCategory} id={`cat-${c.id}`} className="admin-list-main">
                <input type="hidden" name="id" value={c.id} />
                <input name="name" defaultValue={c.name} className="admin-input" aria-label="Category name" />
              </form>
              <span className="admin-list-count">
                {n} {n === 1 ? "item" : "items"}
              </span>
              <button
                type="submit"
                form={`cat-${c.id}`}
                className="admin-btn sm ghost"
                aria-label="Save"
                title="Save"
              >
                <FloppyIcon />
              </button>
              <ConfirmDelete
                action={deleteCategory}
                fields={{ id: c.id }}
                title={`Delete “${c.name}”?`}
                message="Items in this category become uncategorized — they are not deleted."
                triggerLabel={<TrashIcon />}
                triggerAriaLabel="Delete category"
              />
            </div>
          );
        })}
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
