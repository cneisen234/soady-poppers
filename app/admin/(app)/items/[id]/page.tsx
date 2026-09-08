import Link from "next/link";
import { notFound } from "next/navigation";
import { asc } from "drizzle-orm";
import { db } from "@/lib/db";
import { categories } from "@/lib/db/schema";
import { saveVariation } from "../actions";
import ImageManager from "./image-manager";
import ProductDetailsForm from "./product-details-form";
import VariationRow from "./variation-row";

export const dynamic = "force-dynamic";

export default async function EditItemPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [product, cats] = await Promise.all([
    db.query.products.findFirst({
      where: (p, { eq }) => eq(p.id, id),
      with: {
        variations: { orderBy: (v, { asc }) => [asc(v.sort), asc(v.name)] },
        images: { orderBy: (i, { asc }) => [asc(i.sort)] },
      },
    }),
    db.select().from(categories).orderBy(asc(categories.sort), asc(categories.name)),
  ]);

  if (!product) notFound();

  return (
    <>
      <Link href="/admin/items" className="admin-link">
        ← Items
      </Link>
      <h1 className="admin-h1" style={{ marginTop: 6 }}>
        {product.name}
      </h1>

      {/* ---- Details (auto-saves) ---- */}
      <ProductDetailsForm
        product={{
          id: product.id,
          name: product.name,
          description: product.description,
          categoryId: product.categoryId,
          available: product.available,
          hidden: product.hidden,
          taxRateBps: product.taxRateBps,
          trackInventory: product.trackInventory,
          stock: product.stock,
        }}
        categories={cats.map((c) => ({ id: c.id, name: c.name }))}
      />

      {/* ---- Variations (auto-save) ---- */}
      <div className="admin-card">
        <h2 className="admin-h2">Sizes &amp; prices</h2>
        <div className="admin-tablewrap">
          <table className="admin-table cards">
            <thead>
              <tr>
                <th>Name</th>
                <th>Price</th>
                <th>SKU</th>
                <th>Available</th>
                <th>Sold out</th>
                <th aria-label="Actions" />
              </tr>
            </thead>
            <tbody>
              {product.variations.map((v) => (
                <VariationRow
                  key={v.id}
                  productId={product.id}
                  v={{
                    id: v.id,
                    name: v.name,
                    priceCents: v.priceCents,
                    sku: v.sku,
                    available: v.available,
                    soldOut: v.soldOut,
                  }}
                />
              ))}
            </tbody>
          </table>
        </div>

        {/* Add variation */}
        <form action={saveVariation} className="admin-addrow">
          <input type="hidden" name="productId" value={product.id} />
          <input name="name" placeholder="Size name" className="admin-input sm" required />
          <input
            name="price"
            type="number"
            step="0.01"
            min="0"
            placeholder="Price"
            className="admin-input sm w-24"
            required
          />
          <input name="sku" placeholder="SKU (optional)" className="admin-input sm" />
          <button type="submit" className="admin-btn sm">
            + Add size
          </button>
        </form>
      </div>

      {/* ---- Photos ---- */}
      <div className="admin-card">
        <h2 className="admin-h2">Photos</h2>
        <p className="admin-sub" style={{ marginBottom: 16 }}>
          The primary photo shows on the storefront. Upload up to 8&nbsp;MB; large phone
          photos are fine.
        </p>
        <ImageManager
          productId={product.id}
          images={product.images.map((i) => ({ id: i.id, url: i.url, alt: i.alt }))}
        />
      </div>
    </>
  );
}
