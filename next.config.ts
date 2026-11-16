import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@prisma/client", "prisma"],
  async rewrites() {
    return [
      { source: "/liens", destination: "/liens.html" },
      { source: "/lien", destination: "/liens.html" },
    ];
  },
};

export default nextConfig;
