/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    qualities: [90, 100],
    remotePatterns: [
      {
        // Cloudflare R2 공개 접근 도메인. r2.dev 서브도메인을 쓰는 경우 아래 그대로,
        // 커스텀 도메인을 연결했다면 그 도메인으로 바꿔주세요.
        protocol: "https",
        hostname: "pub-*.r2.dev",
      },
    ],
  },
  allowedDevOrigins: process.env.ALLOWED_DEV_ORIGINS?.split(","),
};

module.exports = nextConfig;
