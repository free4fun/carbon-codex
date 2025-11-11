import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: { unoptimized: true },
  async redirects() {
    return [
      {
        source: "/collections",
        destination: "/categories",
        permanent: true,
      },
      {
        source: "/:locale/collections",
        destination: "/:locale/categories",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
