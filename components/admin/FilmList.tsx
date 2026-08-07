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
import { reorderFilms } from "@/app/actions/films";
import { useSortableItem } from "@/hooks/useSortableItem";
import type { Film } from "@/types/database";

function SortableFilmRow({ film }: { film: Film }) {
  const { attributes, listeners, setNodeRef, style, isDragging } =
    useSortableItem(film.id);

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
        href={`/admin/films/${film.id}`}
        className="flex flex-1 items-center justify-between gap-3 rounded-md px-2 py-3 hover:bg-muted/50"
      >
        <div className="flex items-center gap-3">
          <div className="relative h-18 w-32 shrink-0 overflow-hidden rounded-md border border-border bg-muted">
            <Image
              src={film.thumbnail_url}
              alt=""
              fill
              quality={100}
              className="object-cover"
              sizes="128px"
            />
          </div>
          <p className="font-medium">{film.title}</p>
        </div>
        <span className="text-muted-foreground">
          {film.published ? "공개" : "비공개"}
        </span>
      </Link>
    </div>
  );
}

export function FilmList({ films: initialFilms }: { films: Film[] }) {
  const [films, setFilms] = useState(initialFilms);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = films.findIndex((f) => f.id === active.id);
    const newIndex = films.findIndex((f) => f.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const previous = films;
    const next = arrayMove(films, oldIndex, newIndex);
    setFilms(next);

    const result = await reorderFilms(
      next.map((f, i) => ({ id: f.id, sortOrder: next.length - 1 - i })),
    );
    if (!result.success) {
      alert(result.error ?? "순서 변경에 실패했어요.");
      setFilms(previous);
    }
  }

  if (films.length === 0) {
    return (
      <p className="py-8 text-sm text-muted-foreground">
        아직 등록된 영상이 없어요.
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
        items={films.map((f) => f.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="mt-8 divide-y divide-border">
          {films.map((film) => (
            <SortableFilmRow key={film.id} film={film} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
