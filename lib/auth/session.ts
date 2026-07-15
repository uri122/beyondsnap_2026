// 단순 아이디/비밀번호 관리자 로그인을 위한 세션 토큰 유틸.
// Supabase Auth 대신, 서명된 쿠키 하나로 로그인 상태를 관리합니다.
// crypto.subtle(Web Crypto)만 사용하므로 middleware(Edge Runtime)에서도 동작합니다.

export const ADMIN_SESSION_COOKIE = "admin_session";
const SESSION_DURATION_SECONDS = 60 * 60 * 24 * 7; // 7일

function getSecret() {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) {
    throw new Error(
      "ADMIN_SESSION_SECRET 환경변수가 없습니다. .env.local에 임의의 긴 문자열을 넣어주세요."
    );
  }
  return secret;
}

function toBase64Url(bytes: ArrayBuffer | Uint8Array) {
  const arr = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let str = "";
  arr.forEach((b) => (str += String.fromCharCode(b)));
  return btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(input: string) {
  const base64 = input.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
  const str = atob(padded);
  const bytes = new Uint8Array(str.length);
  for (let i = 0; i < str.length; i++) bytes[i] = str.charCodeAt(i);
  return bytes;
}

async function getHmacKey() {
  const encoder = new TextEncoder();
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(getSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

// "만료시각.서명" 형태의 토큰을 만듭니다.
export async function createSessionToken(): Promise<string> {
  const expiresAt = Math.floor(Date.now() / 1000) + SESSION_DURATION_SECONDS;
  const payload = String(expiresAt);
  const key = await getHmacKey();
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(payload)
  );
  return `${payload}.${toBase64Url(signature)}`;
}

// 토큰의 서명이 유효하고, 아직 만료되지 않았는지 확인합니다.
export async function verifySessionToken(token: string | undefined | null): Promise<boolean> {
  if (!token) return false;
  const [payload, signaturePart] = token.split(".");
  if (!payload || !signaturePart) return false;

  const expiresAt = Number(payload);
  if (!Number.isFinite(expiresAt) || expiresAt < Math.floor(Date.now() / 1000)) {
    return false;
  }

  try {
    const key = await getHmacKey();
    const signature = fromBase64Url(signaturePart);
    return crypto.subtle.verify("HMAC", key, signature, new TextEncoder().encode(payload));
  } catch {
    return false;
  }
}
