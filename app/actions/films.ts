"use server";

import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import {
  r2Client,
  R2_BUCKET_NAME,
  R2_PUBLIC_URL,
  getPresignedUploadUrl,
} from "@/lib/r2/client";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/env";

function slugifyFileName(name: string) {
  const dot = name.lastIndexOf(".");
  const base = dot > 0 ? name.slice(0, dot) : name;
  const ext = dot > 0 ? name.slice(dot) : "";
  return `${base
    .toLowerCase()
    .replace(/[^a-z0-9-_]/g, "-")
    .slice(0, 60)}${ext}`;
}

function slugify(text: string) {
  return text
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9가-힣-]/g, "");
}

export async function createFilmThumbnailUploadUrl(input: {
  fileName: string;
  contentType: string;
}) {
  if (!isSupabaseConfigured) {
    return {
      success: false as const,
      error: "Supabase가 아직 연결되지 않았어요.",
    };
  }
  const key = `films/${Date.now()}-${slugifyFileName(input.fileName)}`;
  const uploadUrl = await getPresignedUploadUrl(key, input.contentType);
  const publicUrl = `${R2_PUBLIC_URL}/${key}`;
  return { success: true as const, uploadUrl, publicUrl };
}

export async function createFilm(input: {
  venue: string;
  title: string;
  videoUrl: string;
  thumbnailUrl: string;
  published: boolean;
}) {
  if (!isSupabaseConfigured) {
    return {
      success: false as const,
      error:
        "Supabase가 아직 연결되지 않았어요. .env.local 설정 후 이용해주세요.",
    };
  }
  if (!input.venue.trim())
    return { success: false as const, error: "예식장명은 필수예요." };
  if (!input.videoUrl.trim())
    return { success: false as const, error: "영상 링크는 필수예요." };
  if (!input.thumbnailUrl)
    return { success: false as const, error: "썸네일을 등록해주세요." };

  const supabase = createAdminClient();

  const { data: topRow } = await supabase
    .from("films")
    .select("sort_order")
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();
  const nextSortOrder = (topRow?.sort_order ?? -1) + 1;

  const { data, error } = await supabase
    .from("films")
    .insert({
      venue: input.venue.trim(),
      title: input.title.trim() || input.venue.trim(),
      slug: `${slugify(input.venue)}-${Date.now()}`,
      video_url: input.videoUrl.trim(),
      thumbnail_url: input.thumbnailUrl,
      published: input.published,
      sort_order: nextSortOrder,
    })
    .select()
    .single();

  if (error || !data)
    return {
      success: false as const,
      error: error?.message ?? "등록에 실패했습니다.",
    };
  return { success: true as const, filmId: data.id };
}

export async function updateFilm(
  id: string,
  input: {
    venue: string;
    title: string;
    videoUrl: string;
    thumbnailUrl: string;
    published: boolean;
  },
) {
  if (!input.venue.trim())
    return { success: false as const, error: "예식장명은 필수예요." };
  if (!input.videoUrl.trim())
    return { success: false as const, error: "영상 링크는 필수예요." };

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("films")
    .update({
      venue: input.venue.trim(),
      title: input.title.trim() || input.venue.trim(),
      video_url: input.videoUrl.trim(),
      thumbnail_url: input.thumbnailUrl,
      published: input.published,
    })
    .eq("id", id);

  if (error) return { success: false as const, error: error.message };
  return { success: true as const };
}

export async function deleteFilm(id: string, thumbnailUrl: string) {
  const key = thumbnailUrl.replace(`${R2_PUBLIC_URL}/`, "");
  await r2Client.send(
    new DeleteObjectCommand({ Bucket: R2_BUCKET_NAME, Key: key }),
  );

  const supabase = createAdminClient();
  const { error } = await supabase.from("films").delete().eq("id", id);
  if (error) return { success: false as const, error: error.message };
  return { success: true as const };
}

export async function reorderFilms(
  updates: { id: string; sortOrder: number }[],
) {
  const supabase = createAdminClient();
  const results = await Promise.all(
    updates.map((u) =>
      supabase.from("films").update({ sort_order: u.sortOrder }).eq("id", u.id),
    ),
  );
  const failed = results.find((r) => r.error);
  if (failed?.error)
    return { success: false as const, error: failed.error.message };
  return { success: true as const };
}
