"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isSupabaseConfigured } from "@/lib/env";
import { CEREMONY_CATEGORIES } from "@/lib/categories";
import { createGallery, setCoverImage } from "@/app/actions/galleries";
import { createUploadUrl, confirmPhotoUpload } from "@/app/actions/photos";
import {
  resizeImageFile,
  createPreviewThumbnail,
  uploadFileDirect,
  runWithConcurrency,
} from "@/lib/client/upload";
import type { CeremonyCategory, SnapType } from "@/types/database";
import {
  DndContext,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  closestCenter,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  rectSortingStrategy,
  sortableKeyboardCoordinates,
  arrayMove,
} from "@dnd-kit/sortable";
import { useSortableItem } from "@/hooks/useSortableItem";
import { PhotoDropzone } from "@/components/admin/PhotoDropzone";
import {
  GALLERY_PHOTO_MAX_DIMENSION as RESIZE_MAX_DIMENSION,
  GALLERY_PHOTO_QUALITY as RESIZE_QUALITY,
  GALLERY_PHOTO_MAX_FILE_SIZE_MB as MAX_FILE_SIZE_MB,
  GALLERY_PHOTO_UPLOAD_CONCURRENCY as UPLOAD_CONCURRENCY,
  GALLERY_PHOTO_UPLOAD_HINT,
} from "@/lib/upload-config";

type QueuedPhoto = {
  id: string;
  file: File;
  previewUrl: string;
  progress: number;
  status: "pending" | "uploading" | "done" | "error";
};

function SortableQueuedPhotoTile({
  photo,
  index,
  isCover,
  submitting,
  onSetCover,
  onRemove,
}: {
  photo: QueuedPhoto;
  index: number;
  isCover: boolean;
  submitting: boolean;
  onSetCover: () => void;
  onRemove: () => void;
}) {
  const { attributes, listeners, setNodeRef, style, isDragging } =
    useSortableItem(photo.id, { disabled: submitting });

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...(submitting ? {} : { ...attributes, ...listeners })}
      className={`group relative aspect-square touch-none overflow-hidden rounded-md border ${
        isCover ? "border-primary ring-2 ring-primary" : "border-border"
      } ${submitting ? "" : isDragging ? "cursor-grabbing" : "cursor-grab"}`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={photo.previewUrl}
        alt=""
        loading="lazy"
        decoding="async"
        className="h-full w-full object-cover"
      />
      <span className="absolute left-1 top-1 rounded bg-black/60 px-1.5 py-0.5 text-xs text-white">
        {index + 1}
      </span>

      {isCover && (
        <span className="absolute bottom-1 left-1 rounded bg-primary px-1.5 py-0.5 text-xs text-primary-foreground">
          썸네일
        </span>
      )}

      {!submitting && (
        <>
          {!isCover && (
            <button
              type="button"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={onSetCover}
              className="absolute bottom-1 left-1 rounded bg-black/60 px-1.5 py-0.5 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100"
            >
              썸네일로 설정
            </button>
          )}
          <button
            type="button"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={onRemove}
            className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100"
          >
            ×
          </button>
        </>
      )}

      {submitting && (
        <div className="absolute inset-x-0 bottom-0 h-1 bg-black/30">
          <div
            className={`h-full transition-all ${photo.status === "error" ? "bg-red-500" : "bg-primary"}`}
            style={{ width: `${photo.progress}%` }}
          />
        </div>
      )}
    </div>
  );
}

// snapType: 'dslr'(예식) | 'iphone'(아이폰스냅). dslr일 때만 카테고리 select를 보여줍니다.
export function GalleryComposer({ snapType }: { snapType: SnapType }) {
  const router = useRouter();

  const [venue, setVenue] = useState("");
  const [title, setTitle] = useState("");
  const [venueType, setVenueType] = useState<CeremonyCategory>(
    CEREMONY_CATEGORIES[0].slug,
  );
  const [photos, setPhotos] = useState<QueuedPhoto[]>([]);
  const [coverId, setCoverId] = useState<string | null>(null);
  const [isPreparingFiles, setIsPreparingFiles] = useState(false);

  const [rejectedNames, setRejectedNames] = useState<string[]>([]);

  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const listPath =
    snapType === "dslr" ? "/admin/galleries" : "/admin/iphonesnap";

  const totalSizeMb =
    photos.reduce((sum, p) => sum + p.file.size, 0) / (1024 * 1024);
  const doneCount = photos.filter((p) => p.status === "done").length;

  useEffect(() => {
    if (photos.length === 0 || submitting) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [photos.length, submitting]);

  async function addFiles(fileList: FileList | File[]) {
    const files = Array.from(fileList);
    const validFiles: File[] = [];
    const rejected: string[] = [];

    for (const file of files) {
      const isImage = file.type.startsWith("image/");
      const isUnderLimit = file.size <= MAX_FILE_SIZE_MB * 1024 * 1024;
      if (isImage && isUnderLimit) validFiles.push(file);
      else rejected.push(file.name);
    }
    setRejectedNames(rejected);
    if (validFiles.length === 0) return;

    setIsPreparingFiles(true);
    const accepted: QueuedPhoto[] = await Promise.all(
      validFiles.map(async (file) => ({
        id: `${file.name}-${file.lastModified}-${Math.random().toString(36).slice(2, 8)}`,
        file,
        previewUrl: await createPreviewThumbnail(file),
        progress: 0,
        status: "pending" as const,
      })),
    );
    setIsPreparingFiles(false);

    setPhotos((prev) => {
      const next = [...prev, ...accepted];
      if (!coverId && next.length > 0) setCoverId(next[0].id);
      return next;
    });
  }

  function removePhoto(id: string) {
    setPhotos((prev) => {
      const target = prev.find((p) => p.id === id);
      if (target) URL.revokeObjectURL(target.previewUrl);
      const next = prev.filter((p) => p.id !== id);
      if (coverId === id) setCoverId(next[0]?.id ?? null);
      return next;
    });
  }

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setPhotos((prev) => {
      const oldIndex = prev.findIndex((p) => p.id === active.id);
      const newIndex = prev.findIndex((p) => p.id === over.id);
      if (oldIndex === -1 || newIndex === -1) return prev;
      return arrayMove(prev, oldIndex, newIndex);
    });
  }

  function updatePhoto(id: string, patch: Partial<QueuedPhoto>) {
    setPhotos((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...patch } : p)),
    );
  }

  async function uploadOnePhoto(
    photo: QueuedPhoto,
    galleryId: string,
    sortOrder: number,
  ) {
    updatePhoto(photo.id, { status: "uploading", progress: 0 });

    const {
      file: fileToSend,
      width,
      height,
    } = await resizeImageFile(photo.file, RESIZE_MAX_DIMENSION, RESIZE_QUALITY);

    const urlResult = await createUploadUrl({
      galleryId,
      fileName: fileToSend.name,
      contentType: fileToSend.type,
    });
    if (!urlResult.success) {
      updatePhoto(photo.id, { status: "error" });
      return { success: false as const, name: photo.file.name };
    }

    try {
      await uploadFileDirect(fileToSend, urlResult.uploadUrl, (percent) =>
        updatePhoto(photo.id, { progress: percent }),
      );
    } catch {
      updatePhoto(photo.id, { status: "error" });
      return { success: false as const, name: photo.file.name };
    }

    const confirmResult = await confirmPhotoUpload({
      galleryId,
      imageUrl: urlResult.publicUrl,
      sortOrder,
      width,
      height,
    });
    if (!confirmResult.success) {
      updatePhoto(photo.id, { status: "error" });
      return { success: false as const, name: photo.file.name };
    }

    updatePhoto(photo.id, { status: "done", progress: 100 });
    return {
      success: true as const,
      imageUrl: urlResult.publicUrl,
      isCover: photo.id === coverId,
    };
  }

  async function handleSubmit(mode: "draft" | "publish_ready") {
    setError(null);

    if (!isSupabaseConfigured) {
      setError(
        "Supabase가 아직 연결되지 않았어요. .env.local 설정 후 이용해주세요.",
      );
      return;
    }
    if (!venue.trim()) {
      setError("장소 영문명은 필수예요.");
      return;
    }
    if (mode === "publish_ready" && !title.trim()) {
      setError("등록하려면 제목도 입력해주세요.");
      return;
    }
    if (mode === "publish_ready" && photos.length === 0) {
      setError(
        "등록하려면 사진을 최소 1장 이상 추가해주세요. (임시저장은 사진 없이도 가능해요)",
      );
      return;
    }

    setSubmitting(true);

    const result = await createGallery({
      venue,
      title,
      snapType,
      venueType: snapType === "dslr" ? venueType : undefined,
      published: mode === "publish_ready",
    });
    if (!result.success) {
      setError(result.error);
      setSubmitting(false);
      return;
    }

    const galleryId = result.galleryId;
    const failedNames: string[] = [];
    let coverUrl: string | null = null;

    if (photos.length > 0) {
      await runWithConcurrency(
        photos,
        UPLOAD_CONCURRENCY,
        async (photo, index) => {
          const uploadResult = await uploadOnePhoto(photo, galleryId, index);
          if (!uploadResult.success) failedNames.push(uploadResult.name);
          else if (uploadResult.isCover) coverUrl = uploadResult.imageUrl;
        },
      );
    }

    if (coverUrl) {
      await setCoverImage(galleryId, coverUrl);
    }

    if (failedNames.length > 0) {
      alert(
        `갤러리는 저장됐지만 ${failedNames.length}개 사진 업로드는 실패했어요:\n${failedNames.join(", ")}\n상세 페이지에서 다시 시도해주세요.\n\n(콘솔에 CORS 관련 에러가 있다면 R2 버킷 CORS 설정을 확인해주세요)`,
      );
    }

    router.push(`${listPath}`);
  }

  return (
    <div className="space-y-8">
      <section className="rounded-lg border border-border p-6">
        <h2 className="font-medium">기본 정보</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
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

          {/* 카테고리는 DSLR(예식) 갤러리에서만 필요 */}
          {snapType === "dslr" && (
            <div>
              <label className="mb-1 block text-sm text-muted-foreground">
                카테고리
              </label>
              <select
                value={venueType}
                onChange={(e) =>
                  setVenueType(e.target.value as CeremonyCategory)
                }
                className="w-full rounded-md border border-border px-3 py-2"
                disabled={submitting}
              >
                {CEREMONY_CATEGORIES.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </section>

      <section className="rounded-lg border border-border p-6">
        <h2 className="font-medium">사진</h2>

        <p className="mt-2 text-xs text-muted-foreground">
          {GALLERY_PHOTO_UPLOAD_HINT}
        </p>

        <div className="mt-4">
          <PhotoDropzone onFiles={addFiles} disabled={submitting} />
        </div>

        {rejectedNames.length > 0 && (
          <p className="mt-2 text-sm text-red-500">
            다음 파일은 제외됐어요 (이미지 파일 {MAX_FILE_SIZE_MB}MB 이하만
            가능): {rejectedNames.join(", ")}
          </p>
        )}

        {isPreparingFiles && (
          <p className="mt-4 text-sm text-muted-foreground">
            미리보기 준비 중...
          </p>
        )}

        {photos.length > 0 && (
          <>
            <p className="mt-4 text-sm text-muted-foreground">
              {photos.length}장 선택됨 · 드래그해서 순서 변경
              {submitting && ` · 업로드 완료 ${doneCount}/${photos.length}`}
            </p>
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={photos.map((p) => p.id)}
                strategy={rectSortingStrategy}
              >
                <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4 md:grid-cols-6">
                  {photos.map((photo, index) => (
                    <SortableQueuedPhotoTile
                      key={photo.id}
                      photo={photo}
                      index={index}
                      isCover={coverId === photo.id}
                      submitting={submitting}
                      onSetCover={() => setCoverId(photo.id)}
                      onRemove={() => removePhoto(photo.id)}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          </>
        )}
      </section>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => handleSubmit("draft")}
          disabled={submitting}
          className="rounded-md border border-border px-4 py-3 text-sm font-medium disabled:opacity-50"
        >
          임시저장
        </button>
        <button
          type="button"
          onClick={() => handleSubmit("publish_ready")}
          disabled={submitting || photos.length === 0}
          title={
            photos.length === 0
              ? "사진을 최소 1장 이상 추가해주세요"
              : undefined
          }
          className="flex-1 rounded-md bg-primary px-4 py-3 text-sm font-medium text-primary-foreground disabled:opacity-50"
        >
          {submitting
            ? photos.length > 0
              ? `업로드 중... ${doneCount}/${photos.length}`
              : "저장 중..."
            : "등록하기"}
        </button>
      </div>
    </div>
  );
}
