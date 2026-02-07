import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.digitaloceanspaces.com',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: 'topickx.com',
      },
      {
        protocol: 'https',
        hostname: 'www.topickx.com',
      },
    ],
  },
};

export default nextConfig;
