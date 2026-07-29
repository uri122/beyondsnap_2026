"use server";

import { cookies } from "next/headers";
import { ADMIN_SESSION_COOKIE, createSessionToken } from "@/lib/auth/session";

// 타이밍 공격을 피하기 위한 단순 상수 시간 비교
function timingSafeEqual(a: string, b: string) {
  const encoder = new TextEncoder();
  const bufA = encoder.encode(a);
  const bufB = encoder.encode(b);
  if (bufA.length !== bufB.length) return false;
  let result = 0;
  for (let i = 0; i < bufA.length; i++) {
    result |= bufA[i] ^ bufB[i];
  }
  return result === 0;
}

export async function loginAdmin(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const password = String(formData.get("password") ?? "");

  const adminId = process.env.ADMIN_ID;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminId || !adminPassword) {
    return {
      success: false,
      error: "ADMIN_ID / ADMIN_PASSWORD 환경변수가 설정되지 않았습니다.",
    };
  }

  const isValid =
    timingSafeEqual(id, adminId) && timingSafeEqual(password, adminPassword);

  if (!isValid) {
    return {
      success: false,
      error: "아이디 또는 비밀번호가 올바르지 않습니다.",
    };
  }

  const token = await createSessionToken();
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7일
  });

  return { success: true };
}

export async function logoutAdmin() {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_SESSION_COOKIE);
}
