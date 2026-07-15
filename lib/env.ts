// Supabase 환경변수가 채워졌는지 체크. 아직 없으면 각 데이터 조회 함수가
// 자동으로 lib/mock-data.ts의 더미 데이터를 대신 반환합니다.
export const isSupabaseConfigured = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);
