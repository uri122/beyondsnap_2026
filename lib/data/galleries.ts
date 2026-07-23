import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/env";
import type { Gallery, GalleryPhoto } from "@/types/database";

export async function getPublishedGalleries(): Promise<Gallery[]> {
  if (!isSupabaseConfigured) return [];

  const supabase = createClient();
  const { data } = await supabase
    .from("galleries")
    .select("*")
    .eq("published", true)
    .order("sort_order", { ascending: false });

  return data ?? [];
}

export async function getAllGalleries(): Promise<Gallery[]> {
  if (!isSupabaseConfigured) return [];

  const supabase = createAdminClient();
  const { data } = await supabase.from("galleries").select("*").order("sort_order", { ascending: false });
  return data ?? [];
}

export async function getGalleriesByCategory(category: string): Promise<Gallery[]> {
  if (!isSupabaseConfigured) return [];

  const supabase = createClient();
  const { data } = await supabase
    .from("galleries")
    .select("*")
    .eq("published", true)
    .eq("venue_type", category)
    .order("sort_order", { ascending: false });

  return data ?? [];
}

export async function getLatestGalleryByCategory(category: string): Promise<Gallery | null> {
  if (!isSupabaseConfigured) return null;

  const supabase = createClient();
  const { data } = await supabase
    .from("galleries")
    .select("*")
    .eq("published", true)
    .eq("venue_type", category)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return data;
}

export async function getGalleryBySlug(slug: string): Promise<Gallery | null> {
  if (!isSupabaseConfigured) return null;

  const supabase = createClient();
  const { data } = await supabase.from("galleries").select("*").eq("slug", slug).maybeSingle();
  return data;
}

export async function getGalleryById(id: string): Promise<Gallery | null> {
  if (!isSupabaseConfigured) return null;

  const supabase = createAdminClient();
  const { data } = await supabase.from("galleries").select("*").eq("id", id).maybeSingle();
  return data;
}

export async function getGalleryPhotos(galleryId: string): Promise<GalleryPhoto[]> {
  if (!isSupabaseConfigured) return [];

  const supabase = createAdminClient();
  const { data } = await supabase
    .from("gallery_photos")
    .select("*")
    .eq("gallery_id", galleryId)
    .order("sort_order", { ascending: true });

  return data ?? [];
}

export async function getAdjacentGalleries(
  category: string,
  currentSortOrder: number
): Promise<{ prev: Gallery | null; next: Gallery | null }> {
  if (!isSupabaseConfigured) return { prev: null, next: null };

  const supabase = createClient();

  const [{ data: prevData }, { data: nextData }] = await Promise.all([
    supabase
      .from("galleries")
      .select("*")
      .eq("published", true)
      .eq("venue_type", category)
      .gt("sort_order", currentSortOrder)
      .order("sort_order", { ascending: true })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("galleries")
      .select("*")
      .eq("published", true)
      .eq("venue_type", category)
      .lt("sort_order", currentSortOrder)
      .order("sort_order", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  return { prev: prevData, next: nextData };
}