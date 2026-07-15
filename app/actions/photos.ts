"use server";

import { PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { r2Client, R2_BUCKET_NAME, R2_PUBLIC_URL } from "@/lib/r2/client";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/env";

// 관리자가 사진을 업로드하면: 파일은 R2(오브젝트 스토리지)로, 메타데이터(URL)는
// Supabase Postgres의 gallery_photos 테이블로 나눠 저장합니다.
export async function uploadGalleryPhoto(formData: FormData) {
  if (!isSupabaseConfigured) {
    return { success: false, error: "Supabase가 아직 연결되지 않았어요. .env.local 설정 후 이용해주세요." };
  }

  const file = formData.get("file") as File | null;
  const galleryId = formData.get("galleryId") as string | null;
  const sortOrder = Number(formData.get("sortOrder") ?? 0);

  if (!file || !galleryId) {
    return { success: false, error: "파일 또는 갤러리 정보가 없습니다." };
  }

  const key = `${galleryId}/${Date.now()}-${file.name}`;
  const bytes = Buffer.from(await file.arrayBuffer());

  await r2Client.send(
    new PutObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key,
      Body: bytes,
      ContentType: file.type,
    })
  );

  const imageUrl = `${R2_PUBLIC_URL}/${key}`;

  const supabase = createClient();
  const { error } = await supabase.from("gallery_photos").insert({
    gallery_id: galleryId,
    image_url: imageUrl,
    sort_order: sortOrder,
  });

  if (error) return { success: false, error: error.message };
  return { success: true, url: imageUrl };
}

// 사진 삭제: R2 오브젝트와 DB row를 함께 지웁니다.
export async function deleteGalleryPhoto(photoId: string, imageUrl: string) {
  const key = imageUrl.replace(`${R2_PUBLIC_URL}/`, "");

  await r2Client.send(new DeleteObjectCommand({ Bucket: R2_BUCKET_NAME, Key: key }));

  const supabase = createClient();
  const { error } = await supabase.from("gallery_photos").delete().eq("id", photoId);

  if (error) return { success: false, error: error.message };
  return { success: true };
}
