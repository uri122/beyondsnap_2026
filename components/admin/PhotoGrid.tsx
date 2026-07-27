"use client";

import { useEffect, useState } from "react";
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
  disabled,
  onSetCover,
  onDelete,
}: {
  photo: GalleryPhoto;
  isCover: boolean;
  busy: boolean;
  disabled: boolean;
  onSetCover: () => void;
  onDelete: () => void;
}) {
  const { attributes, listeners, setNodeRef, style, isDragging } =
    useSortableItem(photo.id, {
      disabled,
    });

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
  // savedPhotos: 서버에 실제 반영된(취소 시 되돌아갈) 순서
  const [savedPhotos, setSavedPhotos] = useState(initialPhotos);
  // photos: 화면에 보여지는(드래그로 아직 저장 전인) 순서
  const [photos, setPhotos] = useState(initialPhotos);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [savingOrder, setSavingOrder] = useState(false);

  const isOrderDirty = photos.some((p, i) => p.id !== savedPhotos[i]?.id);

  // 순서를 바꿔둔 채로 실수로 탭을 닫는 걸 막아줍니다.
  useEffect(() => {
    if (!isOrderDirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isOrderDirty]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  // 드래그가 끝나도 서버에 저장하지 않고, 화면 상태만 바꿉니다.
  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = photos.findIndex((p) => p.id === active.id);
    const newIndex = photos.findIndex((p) => p.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    setPhotos((prev) => arrayMove(prev, oldIndex, newIndex));
  }

  async function handleSaveOrder() {
    setSavingOrder(true);
    const result = await reorderPhotos(
      photos.map((p, i) => ({ id: p.id, sortOrder: i })),
    );
    setSavingOrder(false);

    if (!result.success) {
      alert(result.error ?? "순서 저장에 실패했어요.");
      return;
    }
    setSavedPhotos(photos);
    router.refresh();
  }

  function handleCancelOrder() {
    setPhotos(savedPhotos);
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
    setSavedPhotos((prev) => prev.filter((p) => p.id !== photo.id));
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
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {photos.length}장 · 드래그해서 순서 변경, 사진에 마우스를 올려 대표
          지정/삭제
        </p>

        {isOrderDirty && (
          <div className="flex shrink-0 gap-2">
            <button
              type="button"
              onClick={handleCancelOrder}
              disabled={savingOrder}
              className="rounded-md border border-border px-3 py-1.5 text-xs font-medium hover:bg-muted disabled:opacity-50"
            >
              취소
            </button>
            <button
              type="button"
              onClick={handleSaveOrder}
              disabled={savingOrder}
              className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground disabled:opacity-50"
            >
              {savingOrder ? "저장 중..." : "순서 저장"}
            </button>
          </div>
        )}
      </div>

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
                disabled={savingOrder}
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
