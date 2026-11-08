import type { NextConfig } from "next";

// Pilot Light: the local one while this runs in development (next dev), the live one everywhere else.
const PILOT_LIGHT = process.env.NODE_ENV === "development" ? "http://localhost:3000" : "https://pilotlight.kindlingdigital.org";

const nextConfig: NextConfig = {
  // The shop is run from Pilot Light now: the old admin's pages (its login included) send people there.
  async redirects() {
    return [{ source: "/admin/:path*", destination: PILOT_LIGHT, permanent: true }];
  },
};

export default nextConfig;
