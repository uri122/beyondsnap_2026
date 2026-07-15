import { S3Client } from "@aws-sdk/client-s3";

// Cloudflare R2는 S3 호환 API를 제공하므로 AWS SDK를 그대로 사용하되
// endpoint만 R2 계정 엔드포인트로 바꿔줍니다. 서버(Server Action)에서만 사용하세요 —
// 자격증명이 브라우저에 노출되면 안 됩니다.
export const r2Client = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

export const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME!;
// 퍼블릭 접근용 베이스 URL: r2.dev 서브도메인 또는 연결한 커스텀 도메인
export const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL!;
