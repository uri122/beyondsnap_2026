"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/env";
import { revalidatePath } from "next/cache";

export async function updateSiteSettings(
  rows: { key: string; value: string }[],
) {
  if (!isSupabaseConfigured) {
    return {
      success: false as const,
      error:
        "Supabase가 아직 연결되지 않았어요. .env.local 설정 후 이용해주세요.",
    };
  }

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("site_settings")
    .upsert(rows, { onConflict: "key" });

  if (error) return { success: false as const, error: error.message };

  revalidatePath("/", "layout");
  return { success: true as const };
}
