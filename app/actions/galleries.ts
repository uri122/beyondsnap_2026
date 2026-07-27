"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/env";
import type { CeremonyCategory, SnapType, Database } from "@/types/database";

type GalleryUpdate = Database["public"]["Tables"]["galleries"]["Update"];

function slugify(text: string) {
  return text
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9가-힣-]/g, "");
}

export async function createGallery(input: {
  venue: string;
  title: string;
  snapType: SnapType;
  venueType?: CeremonyCategory; // dslr일 때만 필수
  published: boolean;
}) {
  if (!isSupabaseConfigured) {
    return {
      success: false as const,
      error:
        "Supabase가 아직 연결되지 않았어요. .env.local 설정 후 이용해주세요.",
    };
  }

  if (!input.venue.trim()) {
    return { success: false as const, error: "예식장명은 필수예요." };
  }

  if (input.snapType === "dslr" && !input.venueType) {
    return { success: false as const, error: "카테고리를 선택해주세요." };
  }

  const supabase = createAdminClient();

  // 새 갤러리가 목록 맨 위(최신)로 오도록, 같은 snap_type 안에서 현재 최댓값 + 1을 부여
  const { data: topRow } = await supabase
    .from("galleries")
    .select("sort_order")
    .eq("snap_type", input.snapType)
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();
  const nextSortOrder = (topRow?.sort_order ?? -1) + 1;

  const { data, error } = await supabase
    .from("galleries")
    .insert({
      title: input.title.trim() || input.venue.trim(),
      venue: input.venue.trim(),
      venue_type: input.snapType === "dslr" ? input.venueType : null,
      snap_type: input.snapType,
      slug: `${slugify(input.venue)}-${Date.now()}`,
      published: input.published,
      sort_order: nextSortOrder,
    })
    .select()
    .single();

  if (error || !data) {
    return {
      success: false as const,
      error: error?.message ?? "갤러리 생성에 실패했습니다.",
    };
  }

  return { success: true as const, galleryId: data.id };
}

export async function setCoverImage(galleryId: string, imageUrl: string) {
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("galleries")
    .update({ cover_image_url: imageUrl })
    .eq("id", galleryId);

  if (error) return { success: false as const, error: error.message };
  return { success: true as const };
}

export async function reorderGalleries(
  updates: { id: string; sortOrder: number }[],
) {
  const supabase = createAdminClient();

  const results = await Promise.all(
    updates.map((u) =>
      supabase
        .from("galleries")
        .update({ sort_order: u.sortOrder })
        .eq("id", u.id),
    ),
  );

  const failed = results.find((r) => r.error);
  if (failed?.error)
    return { success: false as const, error: failed.error.message };
  return { success: true as const };
}

// venue_type은 dslr 갤러리만 편집 화면에 노출되므로 optional로 받습니다.
export async function updateGallery(
  galleryId: string,
  input: {
    venue: string;
    title: string;
    venueType?: CeremonyCategory;
    published: boolean;
  },
) {
  if (!input.venue.trim()) {
    return { success: false as const, error: "예식장명은 필수예요." };
  }

  const supabase = createAdminClient();
  const updatePayload: GalleryUpdate = {
    venue: input.venue.trim(),
    title: input.title.trim() || input.venue.trim(),
    published: input.published,
  };
  if (input.venueType) updatePayload.venue_type = input.venueType;

  const { error } = await supabase
    .from("galleries")
    .update(updatePayload)
    .eq("id", galleryId);

  if (error) return { success: false as const, error: error.message };
  return { success: true as const };
}

export async function deleteGallery(galleryId: string) {
  const supabase = createAdminClient();

  const { data: photos } = await supabase
    .from("gallery_photos")
    .select("image_url")
    .eq("gallery_id", galleryId);

  if (photos && photos.length > 0) {
    const { r2Client, R2_BUCKET_NAME, R2_PUBLIC_URL } =
      await import("@/lib/r2/client");
    const { DeleteObjectsCommand } = await import("@aws-sdk/client-s3");

    await r2Client.send(
      new DeleteObjectsCommand({
        Bucket: R2_BUCKET_NAME,
        Delete: {
          Objects: photos.map((p) => ({
            Key: p.image_url.replace(`${R2_PUBLIC_URL}/`, ""),
          })),
        },
      }),
    );
  }

  const { error } = await supabase
    .from("galleries")
    .delete()
    .eq("id", galleryId);
  if (error) return { success: false as const, error: error.message };
  return { success: true as const };
}
