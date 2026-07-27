import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/env";
import type { ProductPackage } from "@/types/database";

export async function getProducts(): Promise<ProductPackage[]> {
  if (!isSupabaseConfigured) {
    return [];
  }

  const supabase = createClient();
  const { data } = await supabase
    .from("products")
    .select("*")
    .order("sort_order", { ascending: true });
  return data ?? [];
}
