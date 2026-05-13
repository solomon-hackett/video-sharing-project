import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: ["localhost:3000", "*.app.github.dev"],
      bodySizeLimit: "500mb",
    },
  },
  images: {
    remotePatterns: [
      new URL("https://placehold.net/**"),
      new URL("https://solostream.ddns.net"),
    ],
    localPatterns: [
      {
        pathname: "/api/fetch/avatar",
      },
      {
        pathname: "/api/fetch/thumbnail",
      },
      {
        pathname: "/api/fetch/video",
      },
    ],
  },
};

export default nextConfig;
