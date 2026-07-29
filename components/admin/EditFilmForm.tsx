"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  updateFilm,
  deleteFilm,
  createFilmThumbnailUploadUrl,
} from "@/app/actions/films";
import { resizeImageFile, uploadFileDirect } from "@/lib/client/upload";
import { getVideoEmbedUrl } from "@/lib/video";
import type { Film } from "@/types/database";

const THUMBNAIL_RESIZE_MAX_WIDTH = 1280;
const THUMBNAIL_RESIZE_QUALITY = 0.85;

export function EditFilmForm({ film }: { film: Film }) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [venue, setVenue] = useState(film.venue);
  const [title, setTitle] = useState(film.title);
  const [videoUrl, setVideoUrl] = useState(film.video_url);
  const [published, setPublished] = useState(film.published);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreviewUrl, setThumbnailPreviewUrl] = useState(
    film.thumbnail_url,
  );

  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const embedPreviewAvailable = videoUrl.trim()
    ? Boolean(getVideoEmbedUrl(videoUrl.trim()))
    : null;

  function handleFileSelect(fileList: FileList | null) {
    const file = fileList?.[0];
    if (!file) return;
    setThumbnailFile(file);
    setThumbnailPreviewUrl(URL.createObjectURL(file));
  }

  async function handleSave() {
    setError(null);
    setSaving(true);

    let thumbnailUrl = film.thumbnail_url;

    if (thumbnailFile) {
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
        setSaving(false);
        setError(urlResult.error);
        return;
      }
      try {
        await uploadFileDirect(fileToSend, urlResult.uploadUrl, () => {});
      } catch {
        setSaving(false);
        setError("썸네일 업로드에 실패했어요. 다시 시도해주세요.");
        return;
      }
      thumbnailUrl = urlResult.publicUrl;
    }

    const result = await updateFilm(film.id, {
      venue,
      title,
      videoUrl,
      thumbnailUrl,
      published,
    });

    if (!result.success) {
      setSaving(false);
      setError(result.error);
      return;
    }
    router.push("/admin/films");
    router.refresh();
  }

  async function handleDelete() {
    if (!confirm(`"${film.title}" 영상을 정말 삭제할까요? 되돌릴 수 없어요.`)) {
      return;
    }
    setDeleting(true);
    const result = await deleteFilm(film.id, film.thumbnail_url);
    setDeleting(false);

    if (!result.success) {
      alert(result.error ?? "삭제에 실패했어요.");
      return;
    }
    router.push("/admin/films");
    router.refresh();
  }

  return (
    <section className="rounded-lg border border-border p-6 space-y-6">
      <div className="flex items-center justify-between gap-20">
        <div className="flex-1">
          <label className="mb-1 block text-sm text-muted-foreground">
            장소 영문명 *
          </label>
          <input
            value={venue}
            onChange={(e) => setVenue(e.target.value)}
            placeholder="예: The Link Seoul, a Tribute Portfolio Hotel"
            className="w-full rounded-md border border-border px-3 py-2"
            disabled={saving || deleting}
          />
        </div>

        <button
          type="button"
          role="switch"
          aria-checked={published}
          onClick={() => setPublished((v) => !v)}
          disabled={saving || deleting}
          className={`relative inline-flex h-8 w-20 shrink-0 items-center rounded-full transition-colors disabled:opacity-50 ${
            published ? "bg-green-500" : "bg-gray-400"
          }`}
        >
          <span
            className={`z-10 w-full select-none text-sm font-semibold text-white ${
              published ? "text-left pl-2.5" : "text-right pr-2.5"
            }`}
          >
            {published ? "공개" : "비공개"}
          </span>
          <span
            className={`absolute left-1 h-6 w-6 rounded-full bg-white shadow transition-transform duration-200 ${
              published ? "translate-x-12" : "translate-x-0"
            }`}
          />
        </button>
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
          disabled={saving || deleting}
        />
      </div>

      <div>
        <label className="mb-1 block text-sm text-muted-foreground">
          영상 링크 *
        </label>
        <input
          value={videoUrl}
          onChange={(e) => setVideoUrl(e.target.value)}
          className="w-full rounded-md border border-border px-3 py-2"
          disabled={saving || deleting}
        />
        {videoUrl.trim() && embedPreviewAvailable === false && (
          <p className="mt-1 text-xs text-amber-600">
            유튜브/비메오 링크가 아니면 사이트에서 미리보기 재생 대신 "새 창에서
            보기" 링크로 표시돼요.
          </p>
        )}
      </div>

      <div>
        <p className="mb-1 text-sm text-muted-foreground">썸네일 이미지</p>
        <div className="relative mb-3 aspect-video w-full max-w-sm overflow-hidden rounded-md bg-muted">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={thumbnailPreviewUrl}
            alt="썸네일 미리보기"
            className="h-full w-full object-cover"
          />
        </div>
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
          disabled={saving || deleting}
          className="rounded-md border border-border bg-background px-4 py-2 text-sm font-medium hover:bg-muted disabled:opacity-50"
        >
          이미지 교체
        </button>
        {thumbnailFile && (
          <span className="ml-3 text-xs font-medium text-muted-foreground">
            새 이미지가 선택됐어요. 저장을 눌러야 반영돼요.
          </span>
        )}
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="flex items-center justify-between border-t border-border pt-5">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving || deleting}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
        >
          {saving ? "저장 중..." : "저 장"}
        </button>

        <button
          type="button"
          onClick={handleDelete}
          disabled={saving || deleting}
          className="rounded-md border border-red-300 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
        >
          {deleting ? "삭제 중..." : "삭 제"}
        </button>
      </div>
    </section>
  );
}
