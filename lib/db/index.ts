// Drizzle database client — server-only. The whole app talks to Postgres through
// this one `db` export so connection setup lives in exactly one place.
//
// Driver: Neon's serverless Pool (Vercel Postgres is Neon under the hood). We use
// the WebSocket pool rather than the HTTP driver so interactive transactions work
// — checkout (Step 5) needs to write an order + its items + the payment atomically.
//
// Pooling: point DATABASE_URL at Neon's POOLED connection string (the `-pooler`
// host). Serverless functions spin up many short-lived instances, and a pooled
// URL keeps them from exhausting Postgres connections. Migrations use the direct
// (non-pooled) URL instead — see drizzle.config.ts.

import { drizzle } from "drizzle-orm/neon-serverless";
import { Pool, neonConfig } from "@neondatabase/serverless";
import ws from "ws";
import * as schema from "./schema";

// Node's runtime has no built-in WebSocket for the driver to use; supply one.
// (Edge/browser provide their own, so only set it when missing.)
if (!neonConfig.webSocketConstructor) {
  neonConfig.webSocketConstructor = ws;
}

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error(
    "DATABASE_URL is not set — add the Vercel Postgres (Neon) pooled connection string to .env.local.",
  );
}

const pool = new Pool({ connectionString });

/** The shared Drizzle client. Import this everywhere; never construct another. */
export const db = drizzle(pool, { schema });
