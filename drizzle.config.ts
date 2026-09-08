// drizzle-kit configuration — used by the `db:*` scripts to generate and apply
// migrations from lib/db/schema.ts.
//
// The CLI runs outside Next.js, so it doesn't auto-load .env.local — we load it
// explicitly. Migrations use the DIRECT (non-pooled) connection: schema changes
// run as a single session and shouldn't go through the connection pooler.

import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

config({ path: ".env.local" });

const migrationUrl =
  process.env.POSTGRES_URL_NON_POOLING ?? process.env.DATABASE_URL;

if (!migrationUrl) {
  throw new Error(
    "Set POSTGRES_URL_NON_POOLING (preferred) or DATABASE_URL in .env.local before running drizzle-kit.",
  );
}

export default defineConfig({
  schema: "./lib/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: { url: migrationUrl },
  strict: true,
  verbose: true,
});
