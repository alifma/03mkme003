import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Produces .next/standalone — a self-contained server that doesn't need
  // node_modules copied into the image. See docker/Dockerfile.
  output: "standalone",
};

export default nextConfig;
