"use client";

import { useEffect, useRef, useState } from "react";
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
import type { CeremonyCategory } from "@/types/database";
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

const MAX_FILE_SIZE_MB = 30;
const RESIZE_MAX_WIDTH = 1600; // 이 너비를 넘는 사진만 축소, 이하는 원본 유지
const RESIZE_QUALITY = 0.82;
const UPLOAD_CONCURRENCY = 4;

type QueuedPhoto = {
  id: string;
  file: File;
  previewUrl: string; // 작게 생성한 미리보기용 썸네일 (원본 아님 — 화면 버벅임 방지)
  progress: number; // 0-100
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
    useSortableItem(photo.id, {
      disabled: submitting,
    });

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
          대표
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
              대표로 설정
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

export function GalleryComposer() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [venue, setVenue] = useState("");
  const [title, setTitle] = useState("");
  const [venueType, setVenueType] = useState<CeremonyCategory>(
    CEREMONY_CATEGORIES[0].slug,
  );
  const [photos, setPhotos] = useState<QueuedPhoto[]>([]);
  const [coverId, setCoverId] = useState<string | null>(null);
  const [isPreparingFiles, setIsPreparingFiles] = useState(false);

  const [isDragOver, setIsDragOver] = useState(false);
  const [rejectedNames, setRejectedNames] = useState<string[]>([]);

  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const totalSizeMb =
    photos.reduce((sum, p) => sum + p.file.size, 0) / (1024 * 1024);
  const doneCount = photos.filter((p) => p.status === "done").length;

  // 사진을 선택해둔 채로 실수로 탭을 닫거나 새로고침하는 걸 막아줍니다.
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
    // 고해상도 원본을 그대로 <img>에 물리면 수십 장일 때 브라우저가 버벅여서,
    // 미리보기용 작은 썸네일을 먼저 만들어둡니다 (업로드용 리사이즈와는 별개).
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
    } = await resizeImageFile(photo.file, RESIZE_MAX_WIDTH, RESIZE_QUALITY);

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
      setError("예식장명은 필수예요.");
      return;
    }
    if (mode === "publish_ready" && !title.trim()) {
      setError(
        "등록하려면 제목도 입력해주세요. (임시저장은 예식장명만으로도 가능해요)",
      );
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
      venueType,
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

    router.push(`/admin/galleries/${galleryId}`);
    router.refresh();
  }

  return (
    <div className="space-y-8">
      {/* 기본 정보 */}
      <section className="rounded-lg border border-border p-6">
        <h2 className="font-medium">기본 정보</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm text-muted-foreground">
              예식장명 *
            </label>
            <input
              value={venue}
              onChange={(e) => setVenue(e.target.value)}
              placeholder="예: 그랜드 하얏트 서울"
              className="w-full rounded-md border border-border px-3 py-2"
              disabled={submitting}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-muted-foreground">
              제목
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="예: 봄날의 기록"
              className="w-full rounded-md border border-border px-3 py-2"
              disabled={submitting}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-muted-foreground">
              카테고리
            </label>
            <select
              value={venueType}
              onChange={(e) => setVenueType(e.target.value as CeremonyCategory)}
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
        </div>
      </section>

      {/* 사진 업로드 */}
      <section className="rounded-lg border border-border p-6">
        <h2 className="font-medium">사진</h2>

        <p className="mt-2 text-sm text-muted-foreground">
          권장 규격: 가로 {RESIZE_MAX_WIDTH}px 이하 · JPG 또는 PNG · 장당{" "}
          {MAX_FILE_SIZE_MB}MB 이하. 트래픽/용량 절약을 위해 가로{" "}
          {RESIZE_MAX_WIDTH}px가 넘는 사진은 업로드 시 자동으로{" "}
          {RESIZE_MAX_WIDTH}px로 축소돼요 (이하인 사진은 원본 그대로 유지).
        </p>

        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragOver(true);
          }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragOver(false);
            if (e.dataTransfer.files) addFiles(e.dataTransfer.files);
          }}
          onClick={() => fileInputRef.current?.click()}
          className={`mt-4 flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed px-6 py-10 text-center transition-colors ${
            isDragOver ? "border-primary bg-primary/5" : "border-border"
          }`}
        >
          <p className="text-sm">
            사진을 여기로 드래그하거나 클릭해서 선택하세요
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            여러 장 한 번에 선택 가능 (50장 정도도 OK)
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => e.target.files && addFiles(e.target.files)}
          />
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
              {photos.length}장 선택됨 · 총 {totalSizeMb.toFixed(1)}MB ·
              드래그해서 순서 변경, 사진에 마우스를 올려 대표 사진 지정
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
            </DndContext>{" "}
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
