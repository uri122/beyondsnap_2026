import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/env";
import { mockSiteSettings } from "@/lib/mock-data";

export async function getSiteSettings(
  keys: string[],
): Promise<Record<string, string>> {
  if (!isSupabaseConfigured) {
    return Object.fromEntries(
      keys.map((key) => [key, mockSiteSettings[key] ?? ""]),
    );
  }

  const supabase = createClient();
  const { data } = await supabase
    .from("site_settings")
    .select("key, value")
    .in("key", keys);

  const rows = (data ?? []) as { key: string; value: string | null }[];
  return Object.fromEntries(rows.map((s) => [s.key, s.value ?? ""]));
}
