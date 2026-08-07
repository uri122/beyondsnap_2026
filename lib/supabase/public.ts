import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

// 공개 페이지(로그인 여부와 무관한 읽기 전용 콘텐츠) 전용 클라이언트.
// anon key만 쓰고 쿠키를 전혀 들여다보지 않아서, 이걸 쓰는 라우트는
// Next.js가 정적 생성(SSG) 대상으로 판단할 수 있습니다.
export function createPublicClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
