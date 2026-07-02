import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "45mb",
    },
  },
  poweredByHeader: false,
};

export default nextConfig;
