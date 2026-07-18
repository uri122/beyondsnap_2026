"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteGalleryPhoto, reorderPhotos } from "@/app/actions/photos";
import { setCoverImage } from "@/app/actions/galleries";
import type { GalleryPhoto } from "@/types/database";

export function PhotoGrid({
  galleryId,
  photos: initialPhotos,
  coverImageUrl,
}: {
  galleryId: string;
  photos: GalleryPhoto[];
  coverImageUrl: string | null;
}) {
  const router = useRouter();
  const [photos, setPhotos] = useState(initialPhotos);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function persistOrder(next: GalleryPhoto[]) {
    setPhotos(next);
    await reorderPhotos(next.map((p, i) => ({ id: p.id, sortOrder: i })));
  }

  function handleDrop(targetIndex: number) {
    if (dragIndex === null || dragIndex === targetIndex) return;
    const next = [...photos];
    const [moved] = next.splice(dragIndex, 1);
    next.splice(targetIndex, 0, moved);
    persistOrder(next);
    setDragIndex(null);
  }

  async function handleDelete(photo: GalleryPhoto) {
    setBusyId(photo.id);
    const result = await deleteGalleryPhoto(photo.id, photo.image_url);
    setBusyId(null);
    if (!result.success) {
      alert(result.error ?? "삭제에 실패했어요.");
      return;
    }
    setPhotos((prev) => prev.filter((p) => p.id !== photo.id));
    router.refresh();
  }

  async function handleSetCover(photo: GalleryPhoto) {
    setBusyId(photo.id);
    const result = await setCoverImage(galleryId, photo.image_url);
    setBusyId(null);
    if (!result.success) alert(result.error ?? "대표 사진 설정에 실패했어요.");
    else router.refresh();
  }

  if (photos.length === 0) {
    return <p className="mt-4 text-sm text-muted-foreground">아직 업로드된 사진이 없어요.</p>;
  }

  return (
    <>
      <p className="mt-4 text-sm text-muted-foreground">
        {photos.length}장 · 드래그해서 순서 변경, 사진에 마우스를 올려 대표 지정/삭제
      </p>
      <div className="mt-3 grid grid-cols-3 gap-3 md:grid-cols-5">
        {photos.map((photo, index) => {
          const isCover = coverImageUrl === photo.image_url;
          return (
            <div
              key={photo.id}
              draggable
              onDragStart={() => setDragIndex(index)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => handleDrop(index)}
              className={`group relative aspect-square overflow-hidden rounded-md border ${
                isCover ? "border-primary ring-2 ring-primary" : "border-border"
              } bg-muted`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photo.thumbnail_url ?? photo.image_url}
                alt=""
                className="h-full w-full object-cover"
              />
              {isCover && (
                <span className="absolute bottom-1 left-1 rounded bg-primary px-1.5 py-0.5 text-xs text-primary-foreground">
                  대표
                </span>
              )}
              {!isCover && (
                <button
                  type="button"
                  onClick={() => handleSetCover(photo)}
                  disabled={busyId === photo.id}
                  className="absolute bottom-1 left-1 rounded bg-black/60 px-1.5 py-0.5 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100 disabled:opacity-50"
                >
                  대표로 설정
                </button>
              )}
              <button
                type="button"
                onClick={() => handleDelete(photo)}
                disabled={busyId === photo.id}
                className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100 disabled:opacity-50"
              >
                ×
              </button>
            </div>
          );
        })}
      </div>
    </>
  );
}