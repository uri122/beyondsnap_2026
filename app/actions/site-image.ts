"use server";

import { PutObjectCommand } from "@aws-sdk/client-s3";
import { r2Client, R2_BUCKET_NAME, R2_PUBLIC_URL } from "@/lib/r2/client";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/env";
import { UPLOAD_CACHE_CONTROL } from "@/lib/r2/constants";
import { revalidatePath } from "next/cache";

export async function uploadSiteImage(formData: FormData) {
  if (!isSupabaseConfigured) {
    return {
      success: false,
      error:
        "Supabase가 아직 연결되지 않았어요. .env.local 설정 후 이용해주세요.",
    };
  }

  const file = formData.get("file") as File | null;
  const settingKey = formData.get("settingKey") as string | null;

  if (!file || !settingKey) {
    return { success: false, error: "파일 또는 설정 키가 없습니다." };
  }

  const key = `site/${settingKey}-${Date.now()}-${file.name}`;
  const bytes = Buffer.from(await file.arrayBuffer());

  await r2Client.send(
    new PutObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key,
      Body: bytes,
      ContentType: file.type,
      CacheControl: UPLOAD_CACHE_CONTROL,
    }),
  );

  const imageUrl = `${R2_PUBLIC_URL}/${key}`;

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("site_settings")
    .upsert({ key: settingKey, value: imageUrl }, { onConflict: "key" });

  if (error) return { success: false, error: error.message };

  revalidatePath("/", "layout");
  return { success: true, url: imageUrl };
}
