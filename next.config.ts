import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  serverExternalPackages: ["pino", "pino-pretty"],
  skipTrailingSlashRedirect: true,  
  eslint: {
    ignoreDuringBuilds: true
  }
};

export default nextConfig;
