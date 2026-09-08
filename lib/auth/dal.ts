// Data Access Layer guard — the REAL authorization check. The proxy only does an
// optimistic redirect; every admin page/action/route calls requireAdmin() so a
// forged or missing session is caught at the point data is accessed.
//
// Wrapped in React `cache` so it runs once per request even if called in both a
// layout and a page.

import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { isAuthenticated } from "./session";

export const requireAdmin = cache(async (): Promise<void> => {
  if (!(await isAuthenticated())) redirect("/admin/login");
});
