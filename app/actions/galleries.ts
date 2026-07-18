"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/env";
import type { CeremonyCategory } from "@/types/database";

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
  venueType: CeremonyCategory;
  published: boolean;
}) {
  if (!isSupabaseConfigured) {
    return {
      success: false as const,
      error: "Supabase가 아직 연결되지 않았어요. .env.local 설정 후 이용해주세요.",
    };
  }

  if (!input.venue.trim()) {
    return { success: false as const, error: "예식장명은 필수예요." };
  }

  const supabase = createAdminClient();

  // 새 갤러리가 목록 맨 위(최신)로 오도록 현재 최댓값 + 1을 부여
  const { data: topRow } = await supabase
    .from("galleries")
    .select("sort_order")
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();
  const nextSortOrder = (topRow?.sort_order ?? -1) + 1;

  const { data, error } = await supabase
    .from("galleries")
    .insert({
      title: input.title.trim() || input.venue.trim(),
      venue: input.venue.trim(),
      venue_type: input.venueType,
      slug: `${slugify(input.venue)}-${Date.now()}`,
      published: input.published,
      sort_order: nextSortOrder,
    })
    .select()
    .single();

  if (error || !data) {
    return { success: false as const, error: error?.message ?? "갤러리 생성에 실패했습니다." };
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

// 갤러리 목록 순서 재배치. R2 파일이나 이미지에는 손 안 대고 sort_order 컬럼만
// 업데이트하는 거라 트래픽/용량에 영향은 거의 없어요 (작은 DB 쓰기 요청 몇 번뿐).
export async function reorderGalleries(updates: { id: string; sortOrder: number }[]) {
  const supabase = createAdminClient();

  const results = await Promise.all(
    updates.map((u) => supabase.from("galleries").update({ sort_order: u.sortOrder }).eq("id", u.id))
  );

  const failed = results.find((r) => r.error);
  if (failed?.error) return { success: false as const, error: failed.error.message };
  return { success: true as const };
}

// 예식장명/제목/카테고리/공개여부를 한 번에 저장 (슬러그·대표사진은 안 건드림)
export async function updateGallery(
  galleryId: string,
  input: { venue: string; title: string; venueType: CeremonyCategory; published: boolean }
) {
  if (!input.venue.trim()) {
    return { success: false as const, error: "예식장명은 필수예요." };
  }

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("galleries")
    .update({
      venue: input.venue.trim(),
      title: input.title.trim() || input.venue.trim(),
      venue_type: input.venueType,
      published: input.published,
    })
    .eq("id", galleryId);

  if (error) return { success: false as const, error: error.message };
  return { success: true as const };
}

// 갤러리 통째로 삭제: R2에 올라간 사진 파일들부터 지우고 나서 갤러리 row를 지웁니다.
// gallery_photos row는 FK에 on delete cascade가 걸려있어서 자동으로 같이 지워져요.
export async function deleteGallery(galleryId: string) {
  const supabase = createAdminClient();

  const { data: photos } = await supabase
    .from("gallery_photos")
    .select("image_url")
    .eq("gallery_id", galleryId);

  if (photos && photos.length > 0) {
    const { r2Client, R2_BUCKET_NAME, R2_PUBLIC_URL } = await import("@/lib/r2/client");
    const { DeleteObjectsCommand } = await import("@aws-sdk/client-s3");

    await r2Client.send(
      new DeleteObjectsCommand({
        Bucket: R2_BUCKET_NAME,
        Delete: {
          Objects: photos.map((p) => ({ Key: p.image_url.replace(`${R2_PUBLIC_URL}/`, "") })),
        },
      })
    );
  }

  const { error } = await supabase.from("galleries").delete().eq("id", galleryId);
  if (error) return { success: false as const, error: error.message };
  return { success: true as const };
}