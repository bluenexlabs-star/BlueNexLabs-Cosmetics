import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["127.0.0.1", "localhost"],
  async redirects() {
    return [
      {
        source: "/terms-and-conditions",
        destination: "/terms",
        permanent: true,
      },
      {
        source: "/shop-peptides",
        destination: "/shop",
        permanent: true,
      },
      {
        source: "/shop-peptides/p/:slug",
        destination: "/shop/:slug",
        permanent: true,
      },
      {
        source: "/shop/retatrutide-10mg",
        destination: "/shop/retatrutide-30mg",
        permanent: true,
      },
      {
        source: "/shop/retatrutide-20mg",
        destination: "/shop/retatrutide-30mg",
        permanent: true,
      },
    ];
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.squarespace-cdn.com" },
      { protocol: "https", hostname: "static1.squarespace.com" },
    ],
  },
};

export default nextConfig;
