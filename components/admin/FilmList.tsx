"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { reorderFilms } from "@/app/actions/films";
import type { Film } from "@/types/database";

export function FilmList({ films: initialFilms }: { films: Film[] }) {
  const [films, setFilms] = useState(initialFilms);
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  async function persistOrder(next: Film[]) {
    setFilms(next);
    await reorderFilms(
      next.map((f, i) => ({ id: f.id, sortOrder: next.length - 1 - i })),
    );
  }

  function handleDrop(targetIndex: number) {
    if (dragIndex === null || dragIndex === targetIndex) return;
    const next = [...films];
    const [moved] = next.splice(dragIndex, 1);
    next.splice(targetIndex, 0, moved);
    persistOrder(next);
    setDragIndex(null);
  }

  if (films.length === 0) {
    return (
      <p className="py-8 text-sm text-muted-foreground">
        아직 등록된 영상이 없어요.
      </p>
    );
  }

  return (
    <div className="mt-8 divide-y divide-border">
      {films.map((film, index) => (
        <div
          key={film.id}
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
            href={`/admin/films/${film.id}`}
            className="flex flex-1 items-center justify-between gap-3 rounded-md px-2 py-3 hover:bg-muted/50"
          >
            <div className="flex items-center gap-3">
              <div className="relative h-12 w-20 shrink-0 overflow-hidden rounded-md border border-border bg-muted">
                <Image
                  src={film.thumbnail_url}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="80px"
                />
              </div>
              <p className="font-medium">{film.title}</p>
            </div>
            <span className="text-sm text-muted-foreground">
              {film.published ? "공개" : "비공개"}
            </span>
          </Link>
        </div>
      ))}
    </div>
  );
}
