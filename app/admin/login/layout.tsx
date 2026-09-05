import type { Metadata } from "next";
import "../admin.css";

export const metadata: Metadata = {
  title: "Admin sign in — Soady Poppers",
  robots: { index: false, follow: false },
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="admin-login-wrap">{children}</div>;
}
