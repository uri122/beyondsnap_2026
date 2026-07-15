/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        // Cloudflare R2 공개 접근 도메인. r2.dev 서브도메인을 쓰는 경우 아래 그대로,
        // 커스텀 도메인을 연결했다면 그 도메인으로 바꿔주세요.
        protocol: "https",
        hostname: "pub-*.r2.dev",
      },
      {
        // Supabase 연결 전, 화면 확인용 더미 데이터(lib/mock-data.ts)가 쓰는 이미지 도메인.
        // R2 붙이고 실제 데이터로 전환하면 이 항목은 지워도 됩니다.
        protocol: "https",
        hostname: "picsum.photos",
      },
    ],
  },
};

module.exports = nextConfig;
