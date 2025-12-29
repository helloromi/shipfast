import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    // Force le root pour éviter que Next choisisse /Users/pauloromi à cause d'autres lockfiles
    root: __dirname,
  },
};

export default nextConfig;
