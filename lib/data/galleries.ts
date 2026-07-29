import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/env";
import type { Gallery, GalleryPhoto, SnapType } from "@/types/database";

export async function getPublishedGalleries(
  snapType: SnapType = "dslr",
): Promise<Gallery[]> {
  if (!isSupabaseConfigured) return [];

  const supabase = await createClient();
  const { data } = await supabase
    .from("galleries")
    .select("*")
    .eq("published", true)
    .eq("snap_type", snapType)
    .order("sort_order", { ascending: false });

  return data ?? [];
}

export async function getAllGalleries(
  snapType: SnapType = "dslr",
): Promise<Gallery[]> {
  if (!isSupabaseConfigured) return [];

  const supabase = createAdminClient();
  const { data } = await supabase
    .from("galleries")
    .select("*")
    .eq("snap_type", snapType)
    .order("sort_order", { ascending: false });

  return data ?? [];
}

// 카테고리 필터는 DSLR(예식) 갤러리 전용이라 snap_type을 'dslr'로 고정합니다.
export async function getGalleriesByCategory(
  category: string,
): Promise<Gallery[]> {
  if (!isSupabaseConfigured) return [];

  const supabase = await createClient();
  const { data } = await supabase
    .from("galleries")
    .select("*")
    .eq("published", true)
    .eq("snap_type", "dslr")
    .eq("venue_type", category)
    .order("sort_order", { ascending: false });

  return data ?? [];
}

export async function getLatestGalleryByCategory(
  category: string,
): Promise<Gallery | null> {
  if (!isSupabaseConfigured) return null;

  const supabase = await createClient();
  const { data } = await supabase
    .from("galleries")
    .select("*")
    .eq("published", true)
    .eq("snap_type", "dslr")
    .eq("venue_type", category)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return data;
}

// slug는 타입 상관없이 전역 유니크라 그대로 둡니다.
export async function getGalleryBySlug(slug: string): Promise<Gallery | null> {
  if (!isSupabaseConfigured) return null;

  const supabase = await createClient();
  const { data } = await supabase
    .from("galleries")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  return data;
}

export async function getGalleryById(id: string): Promise<Gallery | null> {
  if (!isSupabaseConfigured) return null;

  const supabase = createAdminClient();
  const { data } = await supabase
    .from("galleries")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  return data;
}

export async function getGalleryPhotos(
  galleryId: string,
): Promise<GalleryPhoto[]> {
  if (!isSupabaseConfigured) return [];

  const supabase = createAdminClient();
  const { data } = await supabase
    .from("gallery_photos")
    .select("*")
    .eq("gallery_id", galleryId)
    .order("sort_order", { ascending: true });

  return data ?? [];
}

// DSLR(예식) 전용: 같은 카테고리 안에서 이전/다음
export async function getAdjacentGalleries(
  category: string,
  currentSortOrder: number,
): Promise<{ prev: Gallery | null; next: Gallery | null }> {
  if (!isSupabaseConfigured) return { prev: null, next: null };

  const supabase = await createClient();

  const [{ data: prevData }, { data: nextData }] = await Promise.all([
    supabase
      .from("galleries")
      .select("*")
      .eq("published", true)
      .eq("snap_type", "dslr")
      .eq("venue_type", category)
      .gt("sort_order", currentSortOrder)
      .order("sort_order", { ascending: true })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("galleries")
      .select("*")
      .eq("published", true)
      .eq("snap_type", "dslr")
      .eq("venue_type", category)
      .lt("sort_order", currentSortOrder)
      .order("sort_order", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  return { prev: prevData, next: nextData };
}

// 아이폰스냅 전용: 카테고리가 없으므로 snap_type 전체 안에서 이전/다음
export async function getAdjacentIphoneSnaps(
  currentSortOrder: number,
): Promise<{ prev: Gallery | null; next: Gallery | null }> {
  if (!isSupabaseConfigured) return { prev: null, next: null };

  const supabase = await createClient();

  const [{ data: prevData }, { data: nextData }] = await Promise.all([
    supabase
      .from("galleries")
      .select("*")
      .eq("published", true)
      .eq("snap_type", "iphone")
      .gt("sort_order", currentSortOrder)
      .order("sort_order", { ascending: true })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("galleries")
      .select("*")
      .eq("published", true)
      .eq("snap_type", "iphone")
      .lt("sort_order", currentSortOrder)
      .order("sort_order", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  return { prev: prevData, next: nextData };
}
