// Session token sign/verify — kept Edge-safe (jose + Web Crypto, no next/headers,
// no Node APIs) so it can run in proxy.ts (the Edge middleware) as well as in
// server code. Do NOT import next/headers or bcrypt here.

import { SignJWT, jwtVerify } from "jose";

export const SESSION_COOKIE = "admin_session";
const ALG = "HS256";

function key(): Uint8Array {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error("AUTH_SECRET is not set.");
  return new TextEncoder().encode(secret);
}

/** Sign a session token for the single admin, expiring at `expiresAt`. */
export async function signSession(expiresAt: Date): Promise<string> {
  return new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: ALG })
    .setSubject("admin")
    .setIssuedAt()
    .setExpirationTime(expiresAt)
    .sign(key());
}

/** True only for a valid, unexpired admin token. Never throws. */
export async function verifySession(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  try {
    const { payload } = await jwtVerify(token, key(), { algorithms: [ALG] });
    return payload.role === "admin";
  } catch {
    return false;
  }
}
