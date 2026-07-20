"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowUp, ArrowDown } from "lucide-react";
import { swapFaqOrder } from "@/app/actions/faqs";
import type { Faq } from "@/types/database";

export function FaqList({ faqs }: { faqs: Faq[] }) {
  const router = useRouter();
  const [pendingId, setPendingId] = useState<string | null>(null);

  const move = async (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= faqs.length) return;

    const current = faqs[index];
    const target = faqs[targetIndex];
    setPendingId(current.id);

    const result = await swapFaqOrder(
      { id: current.id, sortOrder: current.sort_order },
      { id: target.id, sortOrder: target.sort_order }
    );

    setPendingId(null);

    if (!result.success) {
      alert(result.error);
      return;
    }

    router.refresh();
  };

  if (faqs.length === 0) {
    return (
      <p className="mt-8 py-8 text-center text-sm text-muted-foreground">
        등록된 FAQ가 없습니다.
      </p>
    );
  }

  return (
    <div className="mt-8 divide-y divide-border">
      {faqs.map((faq, index) => (
        <div key={faq.id} className="flex items-center gap-3 py-4">
          <div className="flex shrink-0 flex-col">
            <button
              type="button"
              onClick={() => move(index, "up")}
              disabled={index === 0 || pendingId !== null}
              aria-label="위로 이동"
              className="rounded p-1 text-muted-foreground hover:bg-muted disabled:opacity-30"
            >
              <ArrowUp size={16} />
            </button>
            <button
              type="button"
              onClick={() => move(index, "down")}
              disabled={index === faqs.length - 1 || pendingId !== null}
              aria-label="아래로 이동"
              className="rounded p-1 text-muted-foreground hover:bg-muted disabled:opacity-30"
            >
              <ArrowDown size={16} />
            </button>
          </div>

          <Link
            href={`/admin/faq/${faq.id}`}
            className="flex-1 rounded-md p-2 -m-2 hover:bg-muted/50"
          >
            <p className="font-medium">Q. {faq.question}</p>
            <p className="mt-1 text-sm text-muted-foreground">A. {faq.answer}</p>
          </Link>
        </div>
      ))}
    </div>
  );
}