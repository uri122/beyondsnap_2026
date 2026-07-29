import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/env";
import type { Film } from "@/types/database";

export async function getPublishedFilms(): Promise<Film[]> {
  if (!isSupabaseConfigured) return [];
  const supabase = await createClient();
  const { data } = await supabase
    .from("films")
    .select("*")
    .eq("published", true)
    .order("sort_order", { ascending: false });
  return data ?? [];
}

export async function getAllFilms(): Promise<Film[]> {
  if (!isSupabaseConfigured) return [];
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("films")
    .select("*")
    .order("sort_order", { ascending: false });
  return data ?? [];
}

export async function getFilmById(id: string): Promise<Film | null> {
  if (!isSupabaseConfigured) return null;
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("films")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  return data;
}

export async function getFilmBySlug(slug: string): Promise<Film | null> {
  if (!isSupabaseConfigured) return null;

  const supabase = await createClient();
  const { data } = await supabase
    .from("films")
    .select("*")
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();

  return data;
}
