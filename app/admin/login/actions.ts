"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { verifyPassword } from "@/lib/auth/password";
import { createSession } from "@/lib/auth/session";

export type LoginState = { error?: string };

// Lightweight brute-force throttle. Per-instance in-memory only (serverless spins
// up multiple instances), so it's a speed bump, not a hard limit — enough for a
// single-admin login. A durable limiter could move to the DB later.
const attempts = new Map<string, { count: number; first: number }>();
const WINDOW_MS = 5 * 60 * 1000;
const MAX_ATTEMPTS = 8;

export async function login(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const password = String(formData.get("password") ?? "");
  const hdrs = await headers();
  const ip = hdrs.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";

  const now = Date.now();
  const rec = attempts.get(ip);
  const windowOpen = rec && now - rec.first < WINDOW_MS;
  if (windowOpen && rec!.count >= MAX_ATTEMPTS) {
    return { error: "Too many attempts. Try again in a few minutes." };
  }

  if (!(await verifyPassword(password))) {
    attempts.set(
      ip,
      windowOpen ? { count: rec!.count + 1, first: rec!.first } : { count: 1, first: now },
    );
    // Small constant delay to blunt automated guessing.
    await new Promise((r) => setTimeout(r, 400));
    return { error: "Incorrect password." };
  }

  attempts.delete(ip);
  await createSession();
  redirect("/admin");
}
