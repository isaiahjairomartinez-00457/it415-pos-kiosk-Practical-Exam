import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  outputFileTracingIncludes: {
    "/*": ["./data/kiosk.json"],
  },
};

export default nextConfig;
