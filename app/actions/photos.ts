"use server";

import { DeleteObjectCommand, DeleteObjectsCommand } from "@aws-sdk/client-s3";
import {
  r2Client,
  R2_BUCKET_NAME,
  R2_PUBLIC_URL,
  getPresignedUploadUrl,
} from "@/lib/r2/client";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/env";
import { revalidatePath } from "next/cache";

function slugifyFileName(name: string) {
  const dot = name.lastIndexOf(".");
  const base = dot > 0 ? name.slice(0, dot) : name;
  const ext = dot > 0 ? name.slice(dot) : "";
  return `${base
    .toLowerCase()
    .replace(/[^a-z0-9-_]/g, "-")
    .slice(0, 60)}${ext}`;
}

// 1단계: 이 파일을 올릴 수 있는 서명된 업로드 URL을 발급합니다.
// 실제 파일 바이트는 브라우저가 이 URL로 R2에 "직접" PUT 하므로(우리 서버를 거치지 않음),
// 사진이 많거나(수십 장) 용량이 커도 서버리스 함수 페이로드/시간 제한에 걸리지 않아요.
export async function createUploadUrl(input: {
  galleryId: string;
  fileName: string;
  contentType: string;
}) {
  if (!isSupabaseConfigured) {
    return {
      success: false as const,
      error: "Supabase가 아직 연결되지 않았어요.",
    };
  }

  const key = `${input.galleryId}/${Date.now()}-${slugifyFileName(input.fileName)}`;
  const uploadUrl = await getPresignedUploadUrl(key, input.contentType);
  const publicUrl = `${R2_PUBLIC_URL}/${key}`;

  return { success: true as const, uploadUrl, publicUrl, key };
}

// 2단계: 브라우저가 R2 업로드까지 마치면 호출 — DB에 메타데이터 row를 기록합니다.
export async function confirmPhotoUpload(input: {
  galleryId: string;
  imageUrl: string;
  thumbnailUrl?: string;
  sortOrder: number;
  width: number;
  height: number;
}) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("gallery_photos")
    .insert({
      gallery_id: input.galleryId,
      image_url: input.imageUrl,
      thumbnail_url: input.thumbnailUrl ?? null,
      sort_order: input.sortOrder,
      width: input.width,
      height: input.height,
    })
    .select()
    .single();

  if (error || !data)
    return {
      success: false as const,
      error: error?.message ?? "저장에 실패했습니다.",
    };

  revalidatePath("/ceremony/[slug]", "page");
  revalidatePath("/iphonesnap/[slug]", "page");
  return { success: true as const, photo: data };
}

// 사진 삭제: R2의 원본+썸네일 오브젝트, DB row를 함께 삭제
// 지운 사진이 현재 커버였다면, 남은 사진 중 정렬상 가장 앞선 사진으로 커버를 자동 교체
export async function deleteGalleryPhoto(
  galleryId: string,
  photoId: string,
  imageUrl: string,
  thumbnailUrl: string | null,
) {
  const keysToDelete = [imageUrl, thumbnailUrl]
    .filter((url): url is string => Boolean(url))
    .map((url) => url.replace(`${R2_PUBLIC_URL}/`, ""));

  if (keysToDelete.length > 0) {
    await r2Client.send(
      new DeleteObjectsCommand({
        Bucket: R2_BUCKET_NAME,
        Delete: { Objects: keysToDelete.map((Key) => ({ Key })) },
      }),
    );
  }

  const supabase = createAdminClient();

  const { error } = await supabase
    .from("gallery_photos")
    .delete()
    .eq("id", photoId);
  if (error) return { success: false, error: error.message };

  const { data: gallery } = await supabase
    .from("galleries")
    .select("cover_image_url")
    .eq("id", galleryId)
    .maybeSingle();

  const wasCover =
    Boolean(thumbnailUrl) && gallery?.cover_image_url === thumbnailUrl;

  if (wasCover) {
    const { data: nextPhoto } = await supabase
      .from("gallery_photos")
      .select("image_url, thumbnail_url")
      .eq("gallery_id", galleryId)
      .order("sort_order", { ascending: true })
      .limit(1)
      .maybeSingle();

    await supabase
      .from("galleries")
      .update({
        cover_image_url: nextPhoto
          ? (nextPhoto.thumbnail_url ?? nextPhoto.image_url)
          : null,
      })
      .eq("id", galleryId);
  }

  revalidatePath("/ceremony");
  revalidatePath("/iphonesnap");
  revalidatePath("/ceremony/[slug]", "page");
  revalidatePath("/iphonesnap/[slug]", "page");
  revalidatePath("/");
  return { success: true };
}

// 사진 순서 재배치 (드래그 정렬 후 일괄 반영)
export async function reorderPhotos(
  updates: { id: string; sortOrder: number }[],
) {
  const supabase = createAdminClient();

  const results = await Promise.all(
    updates.map((u) =>
      supabase
        .from("gallery_photos")
        .update({ sort_order: u.sortOrder })
        .eq("id", u.id),
    ),
  );

  const failed = results.find((r) => r.error);

  if (failed?.error)
    return { success: false as const, error: failed.error.message };

  revalidatePath("/ceremony/[slug]", "page");
  revalidatePath("/iphonesnap/[slug]", "page");
  return { success: true as const };
}
