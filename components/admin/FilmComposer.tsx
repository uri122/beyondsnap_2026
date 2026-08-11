"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { isSupabaseConfigured } from "@/lib/env";
import { createFilm, createFilmThumbnailUploadUrl } from "@/app/actions/films";
import { resizeImageFile, uploadFileDirect } from "@/lib/client/upload";
import { getVideoEmbedUrl } from "@/lib/video";

const THUMBNAIL_RESIZE_MAX_WIDTH = 1280; // 16:9 썸네일 기준, 이 이상은 필요 없음
const THUMBNAIL_RESIZE_QUALITY = 0.85;

export function FilmComposer() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [venue, setVenue] = useState("");
  const [title, setTitle] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [published, setPublished] = useState(false);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreviewUrl, setThumbnailPreviewUrl] = useState<string | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const embedPreviewAvailable = videoUrl.trim()
    ? Boolean(getVideoEmbedUrl(videoUrl.trim()))
    : null;

  function handleFileSelect(fileList: FileList | null) {
    const file = fileList?.[0];
    if (!file) return;
    setThumbnailFile(file);
    setThumbnailPreviewUrl(URL.createObjectURL(file));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!isSupabaseConfigured) {
      setError(
        "Supabase가 아직 연결되지 않았어요. .env.local 설정 후 이용해주세요.",
      );
      return;
    }
    if (!venue.trim()) {
      setError("장소명은 필수예요.");
      return;
    }
    if (!title.trim()) {
      setError("제목은 필수예요.");
      return;
    }
    if (!videoUrl.trim()) {
      setError("영상 링크는 필수예요.");
      return;
    }
    if (!thumbnailFile) {
      setError("썸네일 이미지를 등록해주세요.");
      return;
    }

    setSubmitting(true);

    const { file: fileToSend } = await resizeImageFile(
      thumbnailFile,
      THUMBNAIL_RESIZE_MAX_WIDTH,
      THUMBNAIL_RESIZE_QUALITY,
    );

    const urlResult = await createFilmThumbnailUploadUrl({
      fileName: fileToSend.name,
      contentType: fileToSend.type,
    });
    if (!urlResult.success) {
      setSubmitting(false);
      setError(urlResult.error);
      return;
    }

    try {
      await uploadFileDirect(fileToSend, urlResult.uploadUrl, () => {});
    } catch {
      setSubmitting(false);
      setError("썸네일 업로드에 실패했어요. 다시 시도해주세요.");
      return;
    }

    const result = await createFilm({
      venue,
      title,
      videoUrl,
      thumbnailUrl: urlResult.publicUrl,
      published,
    });

    setSubmitting(false);

    if (!result.success) {
      setError(result.error);
      return;
    }

    router.push("/admin/films");
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 rounded-lg border border-border p-6"
    >
      <div>
        <label className="mb-1 block text-sm text-muted-foreground">
          장소 영문명 *
        </label>
        <input
          value={venue}
          onChange={(e) => setVenue(e.target.value)}
          placeholder="예: The Link Seoul, a Tribute Portfolio Hotel"
          className="w-full rounded-md border border-border px-3 py-2"
          disabled={submitting}
        />
      </div>
      <div>
        <label className="mb-1 block text-sm text-muted-foreground">
          제목 *
        </label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="예: 더 링크 서울, 베일리홀"
          className="w-full rounded-md border border-border px-3 py-2"
          disabled={submitting}
        />
      </div>

      <div>
        <label className="mb-1 block text-sm text-muted-foreground">
          영상 링크 *
        </label>
        <input
          value={videoUrl}
          onChange={(e) => setVideoUrl(e.target.value)}
          placeholder="예: https://www.youtube.com/watch?v=..., https://tv.naver.com/v/..., https://vimeo.com/..."
          className="w-full rounded-md border border-border px-3 py-2"
          disabled={submitting}
        />
      </div>

      <div>
        <p className="mb-1 text-sm text-muted-foreground">
          썸네일 이미지 * (16:9 권장)
        </p>
        {thumbnailPreviewUrl && (
          <div className="relative mb-3 aspect-video w-full max-w-sm overflow-hidden rounded-md bg-muted">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={thumbnailPreviewUrl}
              alt="썸네일 미리보기"
              className="h-full w-full object-cover"
            />
          </div>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={submitting}
          className="rounded-md border border-border bg-background px-4 py-2 text-sm font-medium hover:bg-muted disabled:opacity-50"
        >
          {thumbnailPreviewUrl ? "이미지 교체" : "이미지 선택"}
        </button>
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={published}
          onChange={(e) => setPublished(e.target.checked)}
          disabled={submitting}
        />
        바로 공개하기
      </label>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground disabled:opacity-50"
      >
        {submitting ? "등록 중..." : "등록하기"}
      </button>
    </form>
  );
}
