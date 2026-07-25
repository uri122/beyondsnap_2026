"use client";

import { useState } from "react";
import Link from "next/link";
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
import { reorderFaqs } from "@/app/actions/faqs";
import { useSortableItem } from "@/hooks/useSortableItem";
import type { Faq } from "@/types/database";

function SortableFaqRow({ faq }: { faq: Faq }) {
  const { attributes, listeners, setNodeRef, style, isDragging } =
    useSortableItem(faq.id);

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
        href={`/admin/faq/${faq.id}`}
        className="flex-1 rounded-md p-2 hover:bg-muted/50"
      >
        <p className="font-medium">Q. {faq.question}</p>
        <p className="mt-1 text-sm text-muted-foreground">A. {faq.answer}</p>
      </Link>
    </div>
  );
}

export function FaqList({ faqs: initialFaqs }: { faqs: Faq[] }) {
  const [faqs, setFaqs] = useState(initialFaqs);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = faqs.findIndex((f) => f.id === active.id);
    const newIndex = faqs.findIndex((f) => f.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const previous = faqs;
    const next = arrayMove(faqs, oldIndex, newIndex);
    setFaqs(next);

    const result = await reorderFaqs(
      next.map((f, i) => ({ id: f.id, sortOrder: i })),
    );
    if (!result.success) {
      alert(result.error ?? "순서 변경에 실패했어요.");
      setFaqs(previous);
    }
  }

  if (faqs.length === 0) {
    return (
      <p className="mt-8 py-8 text-center text-sm text-muted-foreground">
        등록된 FAQ가 없습니다.
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
        items={faqs.map((f) => f.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="mt-8 divide-y divide-border">
          {faqs.map((faq) => (
            <SortableFaqRow key={faq.id} faq={faq} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
