import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

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

// 브라우저가 우리 서버를 거치지 않고 R2로 "직접" PUT할 수 있는 임시 서명 URL(기본 5분).
// 사진이 수십 장 단위로 많을 때(예: 갤러리당 50장 내외) 서버리스 함수로 파일 바이트를
// 프록시하면 처리 시간/페이로드 제한에 걸리기 쉬워서, 발급만 서버가 하고 실제 업로드는
// 브라우저 → R2로 바로 나가도록 합니다.
export async function getPresignedUploadUrl(key: string, contentType: string) {
  const command = new PutObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: key,
    ContentType: contentType,
  });
  return getSignedUrl(r2Client, command, { expiresIn: 300 });
}
