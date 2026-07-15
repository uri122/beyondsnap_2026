import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/env";
import { mockGalleries, mockGalleryPhotos } from "@/lib/mock-data";
import type { Gallery, GalleryPhoto } from "@/types/database";

export async function getPublishedGalleries(): Promise<Gallery[]> {
  if (!isSupabaseConfigured) {
    return mockGalleries.filter((g) => g.published).sort((a, b) => a.sort_order - b.sort_order);
  }

  const supabase = createClient();
  const { data } = await supabase
    .from("galleries")
    .select("*")
    .eq("published", true)
    .order("sort_order", { ascending: true });

  return data ?? [];
}

export async function getAllGalleries(): Promise<Gallery[]> {
  if (!isSupabaseConfigured) {
    return [...mockGalleries].sort((a, b) => b.created_at.localeCompare(a.created_at));
  }

  const supabase = createClient();
  const { data } = await supabase.from("galleries").select("*").order("created_at", { ascending: false });
  return data ?? [];
}

export async function getGalleriesByCategory(category: string): Promise<Gallery[]> {
  if (!isSupabaseConfigured) {
    return mockGalleries
      .filter((g) => g.published && g.venue_type === category)
      .sort((a, b) => a.sort_order - b.sort_order);
  }

  const supabase = createClient();
  const { data } = await supabase
    .from("galleries")
    .select("*")
    .eq("published", true)
    .eq("venue_type", category)
    .order("sort_order", { ascending: true });

  return data ?? [];
}

export async function getLatestGalleryByCategory(category: string): Promise<Gallery | null> {
  if (!isSupabaseConfigured) {
    return (
      mockGalleries
        .filter((g) => g.published && g.venue_type === category)
        .sort((a, b) => b.created_at.localeCompare(a.created_at))[0] ?? null
    );
  }

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
  if (!isSupabaseConfigured) {
    return mockGalleries.find((g) => g.slug === slug) ?? null;
  }

  const supabase = createClient();
  const { data } = await supabase.from("galleries").select("*").eq("slug", slug).maybeSingle();
  return data;
}

export async function getGalleryById(id: string): Promise<Gallery | null> {
  if (!isSupabaseConfigured) {
    return mockGalleries.find((g) => g.id === id) ?? null;
  }

  const supabase = createClient();
  const { data } = await supabase.from("galleries").select("*").eq("id", id).maybeSingle();
  return data;
}

export async function getGalleryPhotos(galleryId: string): Promise<Gallery[]> {
  if (!isSupabaseConfigured) {
    return mockGalleries
      .filter((p) => p.id === galleryId)
      .sort((a, b) => a.sort_order - b.sort_order);
  }

  const supabase = createClient();
  const { data } = await supabase
    .from("gallery_photos")
    .select("*")
    .eq("gallery_id", galleryId)
    .order("sort_order", { ascending: true });

  return data ?? [];
}
