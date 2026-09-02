// GET /api/square/catalog -> the normalized catalog the storefront consumes.
// Proves the read path (lib/catalog.ts) pulls live data from Square.

import { listCatalog } from "@/lib/catalog";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const catalog = await listCatalog();
    return Response.json({
      ok: true,
      categoryCount: catalog.categories.length,
      productCount: catalog.products.length,
      ...catalog,
    });
  } catch (err) {
    return Response.json(
      { ok: false, message: err instanceof Error ? err.message : String(err) },
      { status: 500 },
    );
  }
}
