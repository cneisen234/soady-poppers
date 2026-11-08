// Every public page (docs/site-conventions.md §6, in Pilot Light): Pilot Light
// reads them as Lena's knowledge. Checkout, the admin and the API are left out.

import type { MetadataRoute } from "next";

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.soadypoppers.com").replace(/\/+$/, "");

export default function sitemap(): MetadataRoute.Sitemap {
  return ["/", "/menu", "/order", "/big-poppas", "/about", "/visit"].map((path) => ({ url: `${SITE_URL}${path}` }));
}
