import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/env";
import { mockFaqs } from "@/lib/mock-data";
import type { Faq } from "@/types/database";

export async function getFaqs(): Promise<Faq[]> {
  if (!isSupabaseConfigured) {
    return [...mockFaqs].sort((a, b) => a.sort_order - b.sort_order);
  }

  const supabase = createClient();
  const { data } = await supabase.from("faqs").select("*").order("sort_order", { ascending: true });
  return data ?? [];
}

export async function getFaqById(id: string): Promise<Faq | null> {
  if (!isSupabaseConfigured) {
    return mockFaqs.find((f) => f.id === id) ?? null;
  }

  const supabase = createClient();
  const { data } = await supabase.from("faqs").select("*").eq("id", id).maybeSingle();
  return data;
}