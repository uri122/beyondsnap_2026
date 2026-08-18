/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: !process.env.VERCEL,
    qualities: [90, 100],
    formats: ["image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "pub-*.r2.dev",
      },
    ],
  },
  allowedDevOrigins: process.env.ALLOWED_DEV_ORIGINS?.split(","),
};

if (!process.env.VERCEL) {
  const { initOpenNextCloudflareForDev } = require("@opennextjs/cloudflare");
  initOpenNextCloudflareForDev();
}


module.exports = nextConfig;
