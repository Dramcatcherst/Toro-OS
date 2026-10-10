import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Preserve /_next/data paths so the public perimeter can reject them before routing.
  skipProxyUrlNormalize: true,
};

export default nextConfig;
