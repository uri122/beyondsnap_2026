import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/env";
import { mockProducts } from "@/lib/mock-data";
import type { ProductPackage } from "@/types/database";

export async function getProducts(): Promise<ProductPackage[]> {
  if (!isSupabaseConfigured) {
    return [...mockProducts].sort((a, b) => a.sort_order - b.sort_order);
  }

  const supabase = createClient();
  const { data } = await supabase.from("products").select("*").order("sort_order", { ascending: true });
  return data ?? [];
}
