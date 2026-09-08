// Session cookie management — server-only (reads/writes the httpOnly cookie).
// Setting/deleting cookies is only allowed in Server Actions and Route Handlers.

import "server-only";
import { cookies } from "next/headers";
import { SESSION_COOKIE, signSession, verifySession } from "./jwt";

const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

/** Issue a signed session cookie for the admin. Call from a Server Action. */
export async function createSession(): Promise<void> {
  const expiresAt = new Date(Date.now() + MAX_AGE_MS);
  const token = await signSession(expiresAt);
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // localhost is http in dev
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

/** Clear the session cookie. Call from a Server Action / Route Handler. */
export async function destroySession(): Promise<void> {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

/** True when the current request carries a valid admin session. */
export async function isAuthenticated(): Promise<boolean> {
  const store = await cookies();
  return verifySession(store.get(SESSION_COOKIE)?.value);
}
