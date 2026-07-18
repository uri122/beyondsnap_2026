"use server";

import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { r2Client, R2_BUCKET_NAME, R2_PUBLIC_URL, getPresignedUploadUrl } from "@/lib/r2/client";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/env";

function slugifyFileName(name: string) {
  const dot = name.lastIndexOf(".");
  const base = dot > 0 ? name.slice(0, dot) : name;
  const ext = dot > 0 ? name.slice(dot) : "";
  return `${base.toLowerCase().replace(/[^a-z0-9-_]/g, "-").slice(0, 60)}${ext}`;
}

// 1단계: 이 파일을 올릴 수 있는 서명된 업로드 URL을 발급합니다.
// 실제 파일 바이트는 브라우저가 이 URL로 R2에 "직접" PUT 하므로(우리 서버를 거치지 않음),
// 사진이 많거나(수십 장) 용량이 커도 서버리스 함수 페이로드/시간 제한에 걸리지 않아요.
export async function createUploadUrl(input: { galleryId: string; fileName: string; contentType: string }) {
  if (!isSupabaseConfigured) {
    return { success: false as const, error: "Supabase가 아직 연결되지 않았어요." };
  }

  const key = `${input.galleryId}/${Date.now()}-${slugifyFileName(input.fileName)}`;
  const uploadUrl = await getPresignedUploadUrl(key, input.contentType);
  const publicUrl = `${R2_PUBLIC_URL}/${key}`;

  return { success: true as const, uploadUrl, publicUrl, key };
}

// 2단계: 브라우저가 R2 업로드까지 마치면 호출 — DB에 메타데이터 row를 기록합니다.
export async function confirmPhotoUpload(input: { galleryId: string; imageUrl: string; sortOrder: number }) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("gallery_photos")
    .insert({
      gallery_id: input.galleryId,
      image_url: input.imageUrl,
      sort_order: input.sortOrder,
    })
    .select()
    .single();

  if (error || !data) return { success: false as const, error: error?.message ?? "저장에 실패했습니다." };
  return { success: true as const, photo: data };
}

// 사진 삭제: R2 오브젝트와 DB row를 함께 지웁니다.
export async function deleteGalleryPhoto(photoId: string, imageUrl: string) {
  const key = imageUrl.replace(`${R2_PUBLIC_URL}/`, "");

  await r2Client.send(new DeleteObjectCommand({ Bucket: R2_BUCKET_NAME, Key: key }));

  const supabase = createAdminClient();
  const { error } = await supabase.from("gallery_photos").delete().eq("id", photoId);

  if (error) return { success: false, error: error.message };
  return { success: true };
}

// 사진 순서 재배치 (드래그 정렬 후 일괄 반영)
export async function reorderPhotos(updates: { id: string; sortOrder: number }[]) {
  const supabase = createAdminClient();

  const results = await Promise.all(
    updates.map((u) => supabase.from("gallery_photos").update({ sort_order: u.sortOrder }).eq("id", u.id))
  );

  const failed = results.find((r) => r.error);
  if (failed?.error) return { success: false as const, error: failed.error.message };
  return { success: true as const };
}
