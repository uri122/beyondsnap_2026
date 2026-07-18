import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

// 관리자 전용 서버 클라이언트 (service_role 키 사용, RLS 우회).
//
// 왜 필요한가: 관리자 로그인을 Supabase Auth가 아니라 자체 아이디/비밀번호 +
// 서명된 쿠키(lib/auth/session.ts)로 처리하기 때문에, 관리자가 요청을 보내도
// Supabase 입장에서는 "인증된 세션"이 아니에요 (RLS의 auth.role() = 'authenticated'
// 조건을 만족 못 함). 그래서 갤러리/사진 등 관리자 쓰기 작업은 이 서비스 롤 클라이언트로
// 처리하고, "이 요청이 관리자가 맞는지"는 middleware.ts + 각 서버 액션에서
// 이미 검증된 뒤라는 전제로 사용합니다.
//
// 절대 규칙:
// - 이 파일은 "use server" 액션 등 서버 코드에서만 import 하세요.
// - SUPABASE_SERVICE_ROLE_KEY를 클라이언트 컴포넌트나 NEXT_PUBLIC_* 변수로 노출하면 안 됩니다.
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY 환경변수가 필요합니다."
    );
  }

  return createClient<Database>(url, serviceRoleKey, {
    auth: { persistSession: false },
    global: {
      // Next.js가 fetch()를 캐싱하는 바람에 저장 직후에도 예전 값이 보이는 걸 방지
      fetch: (input, init) => fetch(input, { ...init, cache: "no-store" }),
    },
  });
}