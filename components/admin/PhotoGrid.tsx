"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import { deleteGalleryPhoto, reorderPhotos } from "@/app/actions/photos";
import { setCoverImage } from "@/app/actions/galleries";
import { useSortableItem } from "@/hooks/useSortableItem";
import type { GalleryPhoto } from "@/types/database";

function SortablePhotoTile({
  photo,
  isCover,
  busy,
  onSetCover,
  onDelete,
}: {
  photo: GalleryPhoto;
  isCover: boolean;
  busy: boolean;
  onSetCover: () => void;
  onDelete: () => void;
}) {
  const { attributes, listeners, setNodeRef, style, isDragging } =
    useSortableItem(photo.id);

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`group relative aspect-square touch-none overflow-hidden rounded-md border ${
        isCover ? "border-primary ring-2 ring-primary" : "border-border"
      } bg-muted ${isDragging ? "cursor-grabbing" : "cursor-grab"}`}
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
          onPointerDown={(e) => e.stopPropagation()}
          onClick={onSetCover}
          disabled={busy}
          className="absolute bottom-1 left-1 rounded bg-black/60 px-1.5 py-0.5 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100 disabled:opacity-50"
        >
          대표로 설정
        </button>
      )}
      <button
        type="button"
        onPointerDown={(e) => e.stopPropagation()}
        onClick={onDelete}
        disabled={busy}
        className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100 disabled:opacity-50"
      >
        ×
      </button>
    </div>
  );
}

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
  const [busyId, setBusyId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = photos.findIndex((p) => p.id === active.id);
    const newIndex = photos.findIndex((p) => p.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const previous = photos;
    const next = arrayMove(photos, oldIndex, newIndex);
    setPhotos(next);

    const result = await reorderPhotos(
      next.map((p, i) => ({ id: p.id, sortOrder: i })),
    );
    if (!result.success) {
      alert(result.error ?? "순서 변경에 실패했어요.");
      setPhotos(previous);
    }
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
    return (
      <p className="mt-4 text-sm text-muted-foreground">
        아직 업로드된 사진이 없어요.
      </p>
    );
  }

  return (
    <>
      <p className="mt-4 text-sm text-muted-foreground">
        {photos.length}장 · 드래그해서 순서 변경, 사진에 마우스를 올려 대표
        지정/삭제
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
          <div className="mt-3 grid grid-cols-3 gap-3 md:grid-cols-5">
            {photos.map((photo) => (
              <SortablePhotoTile
                key={photo.id}
                photo={photo}
                isCover={coverImageUrl === photo.image_url}
                busy={busyId === photo.id}
                onSetCover={() => handleSetCover(photo)}
                onDelete={() => handleDelete(photo)}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </>
  );
}
