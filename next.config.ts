import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Ensure better-sqlite3 is treated as a Node dependency in server runtime
  serverExternalPackages: ["better-sqlite3"],
};

export default nextConfig;
