import { NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/lib/env";
import { createPublicClient } from "@/lib/supabase/public";

export const dynamic = "force-dynamic"; // 캐시 타면 의미 없으니 항상 실행

export async function GET() {
  if (!isSupabaseConfigured) {
    return NextResponse.json({ ok: false, reason: "not configured" });
  }
  const supabase = createPublicClient();
  const { error } = await supabase.from("site_settings").select("key").limit(1); // 실제 쿼리 1건 — 이게 Supabase 입장에서 "활동"으로 카운트됨

  return NextResponse.json({ ok: !error, ts: Date.now() });
}
