import Link from "next/link";
import { notFound } from "next/navigation";
import { asc } from "drizzle-orm";
import { db } from "@/lib/db";
import { categories } from "@/lib/db/schema";
import { updateProduct, saveVariation, deleteVariation } from "../actions";
import ImageManager from "./image-manager";
import ConfirmDelete from "../../confirm-delete";
import { FloppyIcon, TrashIcon } from "../../icons";

export const dynamic = "force-dynamic";

function dollars(cents: number): string {
  return (cents / 100).toFixed(2);
}

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

  const taxMode =
    product.taxRateBps == null ? "inherit" : product.taxRateBps === 0 ? "exempt" : "custom";

  return (
    <>
      <Link href="/admin/items" className="admin-link">
        ← Items
      </Link>
      <h1 className="admin-h1" style={{ marginTop: 6 }}>
        {product.name}
      </h1>

      {/* ---- Details ---- */}
      <form action={updateProduct} className="admin-card admin-form">
        <input type="hidden" name="id" value={product.id} />
        <h2 className="admin-h2">Details</h2>

        <label className="admin-field">
          <span>Name</span>
          <input name="name" required defaultValue={product.name} className="admin-input" />
        </label>

        <label className="admin-field">
          <span>Description</span>
          <textarea
            name="description"
            rows={2}
            defaultValue={product.description ?? ""}
            className="admin-input"
          />
        </label>

        <label className="admin-field">
          <span>Category</span>
          <select
            name="categoryId"
            defaultValue={product.categoryId ?? ""}
            className="admin-input"
          >
            <option value="">— None —</option>
            {cats.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>

        <div className="admin-grid2">
          <label className="admin-check">
            <input type="checkbox" name="available" defaultChecked={product.available} />
            <span>Available (turn off to pause this item)</span>
          </label>
          <label className="admin-check">
            <input type="checkbox" name="visible" defaultChecked={!product.hidden} />
            <span>Visible on storefront</span>
          </label>
        </div>

        <fieldset className="admin-fieldset">
          <legend>Tax</legend>
          <div className="admin-grid2">
            <label className="admin-field">
              <span>Tax treatment</span>
              <select name="taxMode" defaultValue={taxMode} className="admin-input">
                <option value="inherit">Use global rate</option>
                <option value="exempt">Tax exempt (0%)</option>
                <option value="custom">Custom rate…</option>
              </select>
            </label>
            <label className="admin-field">
              <span>Custom rate (%) — only used for “Custom”</span>
              <input
                name="taxRatePercent"
                type="number"
                step="0.01"
                min="0"
                defaultValue={
                  product.taxRateBps && product.taxRateBps > 0
                    ? product.taxRateBps / 100
                    : ""
                }
                className="admin-input"
                placeholder="e.g. 6"
              />
            </label>
          </div>
        </fieldset>

        <fieldset className="admin-fieldset">
          <legend>Inventory</legend>
          <div className="admin-grid2">
            <label className="admin-check">
              <input
                type="checkbox"
                name="trackInventory"
                defaultChecked={product.trackInventory}
              />
              <span>Track inventory (sell out at 0)</span>
            </label>
            <label className="admin-field">
              <span>Stock on hand — only used when tracking</span>
              <input
                name="stock"
                type="number"
                min="0"
                step="1"
                defaultValue={product.stock}
                className="admin-input"
              />
            </label>
          </div>
        </fieldset>

        <div className="admin-actions">
          <button type="submit" className="admin-btn" aria-label="Save details" title="Save details">
            <FloppyIcon />
          </button>
        </div>
      </form>

      {/* ---- Variations ---- */}
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
                <tr key={v.id}>
                  <td data-label="Name">
                    <form
                      action={saveVariation}
                      id={`var-${v.id}`}
                      className="admin-inline-form"
                    >
                      <input type="hidden" name="id" value={v.id} />
                      <input type="hidden" name="productId" value={product.id} />
                      <input name="name" defaultValue={v.name} className="admin-input sm" />
                    </form>
                  </td>
                  <td className="admin-num" data-label="Price">
                    <input
                      form={`var-${v.id}`}
                      name="price"
                      type="number"
                      step="0.01"
                      min="0"
                      defaultValue={dollars(v.priceCents)}
                      className="admin-input sm w-24"
                    />
                  </td>
                  <td data-label="SKU">
                    <input
                      form={`var-${v.id}`}
                      name="sku"
                      defaultValue={v.sku ?? ""}
                      className="admin-input sm"
                    />
                  </td>
                  <td className="admin-center" data-label="Available">
                    <input
                      form={`var-${v.id}`}
                      type="checkbox"
                      name="available"
                      defaultChecked={v.available}
                    />
                  </td>
                  <td className="admin-center" data-label="Sold out">
                    <input
                      form={`var-${v.id}`}
                      type="checkbox"
                      name="soldOut"
                      defaultChecked={v.soldOut}
                    />
                  </td>
                  <td className="admin-num">
                    <div className="admin-actions">
                      <button
                        type="submit"
                        form={`var-${v.id}`}
                        className="admin-btn sm ghost"
                        aria-label="Save"
                        title="Save"
                      >
                        <FloppyIcon />
                      </button>
                      <ConfirmDelete
                        action={deleteVariation}
                        fields={{ id: v.id, productId: product.id }}
                        title={`Delete the “${v.name}” size?`}
                        triggerLabel={<TrashIcon />}
                        triggerAriaLabel="Delete size"
                      />
                    </div>
                  </td>
                </tr>
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
