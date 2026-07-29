import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/env";
import type { Faq } from "@/types/database";

export async function getFaqs(): Promise<Faq[]> {
  if (!isSupabaseConfigured) {
    return [];
  }

  const supabase = await createClient();
  const { data } = await supabase
    .from("faqs")
    .select("*")
    .order("sort_order", { ascending: true });
  return data ?? [];
}

export async function getFaqById(id: string): Promise<Faq | null> {
  if (!isSupabaseConfigured) {
    return null;
  }

  const supabase = await createClient();
  const { data } = await supabase
    .from("faqs")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  return data;
}
