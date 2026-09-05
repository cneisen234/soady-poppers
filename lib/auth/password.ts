// Admin password check — server-only (bcrypt runs in the Node runtime, never in
// the Edge proxy). There is one admin and no user table: the password is compared
// against a bcrypt hash held in ADMIN_PASSWORD_HASH. Generate the hash with
// `npm run admin:hash "<password>"`.

import "server-only";
import bcrypt from "bcryptjs";

/** Constant-time compare of a submitted password against the configured hash. */
export async function verifyPassword(password: string): Promise<boolean> {
  const configured = process.env.ADMIN_PASSWORD_HASH;
  if (!configured) throw new Error("ADMIN_PASSWORD_HASH is not set.");
  if (!password) return false;
  // The value is base64-encoded (env-safe — no `$` for Next.js to expand). A raw
  // bcrypt hash (starts with `$2`) is still accepted for flexibility.
  const hash = configured.startsWith("$2")
    ? configured
    : Buffer.from(configured, "base64").toString("utf8");
  try {
    return await bcrypt.compare(password, hash);
  } catch {
    return false;
  }
}
