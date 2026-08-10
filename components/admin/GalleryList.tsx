"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
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
  verticalListSortingStrategy,
  sortableKeyboardCoordinates,
  arrayMove,
} from "@dnd-kit/sortable";
import { reorderGalleries } from "@/app/actions/galleries";
import { useSortableItem } from "@/hooks/useSortableItem";
import type { Gallery } from "@/types/database";

function SortableGalleryRow({ gallery }: { gallery: Gallery }) {
  const { attributes, listeners, setNodeRef, style, isDragging } =
    useSortableItem(gallery.id);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-2 bg-background"
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        aria-label="드래그해서 순서 변경"
        title="드래그해서 순서 변경"
        className={`touch-none select-none rounded px-2 py-3 text-lg leading-none text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring ${
          isDragging ? "cursor-grabbing" : "cursor-grab"
        }`}
      >
        ⠿
      </button>

      <Link
        href={`/admin/galleries/${gallery.id}`}
        className="flex flex-1 items-center justify-between gap-3 px-2 py-3 hover:bg-muted/50"
      >
        <div className="flex items-center gap-4">
          <div className="relative w-[60px] h-[80px]">
            {gallery.cover_image_url ? (
              <Image
                src={gallery.cover_image_url}
                alt="커버 이미지"
                className="border border-border object-cover rounded-sm"
                fill
                sizes="60px"
              />
            ) : (
              <div className="flex h-full w-full shrink-0 items-center justify-center rounded-sm border border-dashed border-border text-[10px] text-muted-foreground">
                사진없음
              </div>
            )}
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase">
              {gallery.venue_type}
            </p>
            <p className="font-medium">{gallery.venue}</p>
            <p className="text-muted-foreground">{gallery.title}</p>
          </div>
        </div>
        <span className="text-muted-foreground">
          {gallery.published ? "공개" : "비공개"}
        </span>
      </Link>
    </div>
  );
}

export function GalleryList({
  galleries: initialGalleries,
}: {
  galleries: Gallery[];
}) {
  const [galleries, setGalleries] = useState(initialGalleries);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = galleries.findIndex((g) => g.id === active.id);
    const newIndex = galleries.findIndex((g) => g.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const previous = galleries;
    const next = arrayMove(galleries, oldIndex, newIndex);
    setGalleries(next);

    // 목록이 최신순(내림차순)으로 보이는 상태라, 맨 위 항목이 가장 큰 sort_order를 갖도록 매핑
    const result = await reorderGalleries(
      next.map((g, i) => ({ id: g.id, sortOrder: next.length - 1 - i })),
    );
    if (!result.success) {
      alert(result.error ?? "순서 변경에 실패했어요.");
      setGalleries(previous); // 실패 시 드래그 전 상태로 롤백
    }
  }

  if (galleries.length === 0) {
    return (
      <p className="py-8 text-sm text-muted-foreground">
        아직 등록된 글이 없어요.
      </p>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={galleries.map((g) => g.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="mt-8 divide-y divide-border">
          {galleries.map((gallery) => (
            <SortableGalleryRow key={gallery.id} gallery={gallery} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
