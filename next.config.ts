import type { NextConfig } from "next";

const nextConfig: NextConfig = {};
module.exports = {
  images: {
    remotePatterns: [new URL("https://placehold.net/**")],
  },
};

export default nextConfig;
