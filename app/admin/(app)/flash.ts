import "server-only";
import { cookies } from "next/headers";

// A one-shot "flash" message set by a server action and shown by the client
// Toaster on the next render. The nonce lets identical consecutive messages
// still trigger a fresh toast; the Toaster clears the cookie after showing it.
export const TOAST_COOKIE = "admin_toast";

export async function flashToast(message: string): Promise<void> {
  const store = await cookies();
  store.set(TOAST_COOKIE, `${Date.now()}|${message}`, {
    path: "/admin",
    maxAge: 15,
    sameSite: "lax",
  });
}
