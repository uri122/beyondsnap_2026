"use client";

import { useState } from "react";
import Link from "next/link";
import { reorderGalleries } from "@/app/actions/galleries";
import type { Gallery } from "@/types/database";

export function GalleryList({ galleries: initialGalleries }: { galleries: Gallery[] }) {
  const [galleries, setGalleries] = useState(initialGalleries);
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  async function persistOrder(next: Gallery[]) {
    setGalleries(next);
    // 목록이 최신순(내림차순)으로 보이는 상태라, 맨 위 항목이 가장 큰 sort_order를 갖도록 매핑
    await reorderGalleries(next.map((g, i) => ({ id: g.id, sortOrder: next.length - 1 - i })));
  }

  function handleDrop(targetIndex: number) {
    if (dragIndex === null || dragIndex === targetIndex) return;
    const next = [...galleries];
    const [moved] = next.splice(dragIndex, 1);
    next.splice(targetIndex, 0, moved);
    persistOrder(next);
    setDragIndex(null);
  }

  if (galleries.length === 0) {
    return <p className="py-8 text-sm text-muted-foreground">아직 등록된 갤러리가 없어요.</p>;
  }

  return (
    <div className="mt-8 divide-y divide-border">
      {galleries.map((gallery, index) => (
        <div
          key={gallery.id}
          onDragOver={(e) => e.preventDefault()}
          onDrop={() => handleDrop(index)}
          className="flex items-center gap-2"
        >
          <span
            draggable
            onDragStart={() => setDragIndex(index)}
            title="드래그해서 순서 변경"
            className="cursor-grab select-none px-2 py-3 text-lg leading-none text-muted-foreground active:cursor-grabbing"
          >
            ⠿
          </span>

          <Link
            href={`/admin/galleries/${gallery.id}`}
            className="flex flex-1 items-center justify-between gap-3 rounded-md px-2 py-3 hover:bg-muted/50"
          >
            <div className="flex items-center gap-3">
              {gallery.cover_image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={gallery.cover_image_url}
                  alt=""
                  className="h-12 w-12 rounded-md border border-border object-cover"
                />
              ) : (
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md border border-dashed border-border text-[10px] text-muted-foreground">
                  사진없음
                </div>
              )}
              <div>
                <p className="font-medium">{gallery.venue}</p>
                <p className="text-sm text-muted-foreground">{gallery.title}</p>
              </div>
            </div>
            <span className="text-sm text-muted-foreground">
              {gallery.published ? "공개" : "비공개"}
            </span>
          </Link>
        </div>
      ))}
    </div>
  );
}