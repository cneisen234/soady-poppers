"use client";

// Hides storefront chrome (nav/footer/order bar) on the internal /admin console.
// Renders its children everywhere else. usePathname resolves during SSR too, so
// there's no flash of the storefront header on admin pages.

import { usePathname } from "next/navigation";

export default function HideOnAdmin({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) return null;
  return <>{children}</>;
}
