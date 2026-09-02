// Sandbox connectivity check for Step 1.
//
// GET /api/square/health
//   - Reports which credentials are present (without leaking them).
//   - If credentials exist, pings Square: lists locations (proves auth) and
//     reads the catalog (proves the inventory/catalog API is reachable).
//
// This is a build-time diagnostic. Remove or lock it down before launch.

import { square, squareEnv, locationId } from "@/lib/square";

export const dynamic = "force-dynamic"; // always run live, never prerender

function present(name: string): boolean {
  return Boolean(process.env[name]);
}

export async function GET() {
  const config = {
    SQUARE_ENV: squareEnv,
    SQUARE_ACCESS_TOKEN: present("SQUARE_ACCESS_TOKEN"),
    SQUARE_APPLICATION_ID: present("SQUARE_APPLICATION_ID"),
    SQUARE_LOCATION_ID: present("SQUARE_LOCATION_ID"),
  };

  if (!config.SQUARE_ACCESS_TOKEN) {
    return Response.json(
      {
        ok: false,
        status: "waiting-for-keys",
        message:
          "Paste your Square Sandbox access token into .env.local, then restart.",
        config,
      },
      { status: 200 },
    );
  }

  try {
    const client = square();

    // 1. List locations — proves the access token authenticates.
    const locations = await client.locations.list();
    const locs = (locations.locations ?? []).map((l) => ({
      id: l.id,
      name: l.name,
      status: l.status,
      currency: l.currency,
    }));
    const wantId = process.env.SQUARE_LOCATION_ID;
    const configuredLocationFound = wantId
      ? locs.some((l) => l.id === wantId)
      : null; // null = no location configured yet; copy an id below into .env.local

    // 2. List catalog — proves the catalog/inventory API is reachable.
    const catalog = await client.catalog.list();
    let catalogCount = 0;
    for await (const _item of catalog) catalogCount++;

    return Response.json({
      ok: true,
      status: "connected",
      env: squareEnv,
      config,
      configuredLocationFound,
      locations: locs,
      catalogItemCount: catalogCount,
    });
  } catch (err) {
    return Response.json(
      {
        ok: false,
        status: "error",
        message: err instanceof Error ? err.message : String(err),
        config,
      },
      { status: 500 },
    );
  }
}
