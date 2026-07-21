"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createFaq } from "@/app/actions/faqs";

export function NewFaqForm({ nextSortOrder }: { nextSortOrder: number }) {
  const router = useRouter();
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const result = await createFaq({ question, answer, sortOrder: nextSortOrder });

    setLoading(false);

    if (!result.success) {
      alert(result.error);
      return;
    }

    setQuestion("");
    setAnswer("");
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <label className="text-sm font-medium">
        질문
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="예: 예약은 얼마나 전에 해야 하나요?"
          className="mt-1 w-full rounded-md border border-border px-3 py-2 text-sm font-normal"
          required
        />
      </label>

      <label className="text-sm font-medium">
        답변
        <textarea
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          className="mt-1 min-h-24 w-full rounded-md border border-border px-3 py-2 text-sm font-normal"
          required
        />
      </label>

      <button
        type="submit"
        disabled={loading}
        className="self-start rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground disabled:opacity-50"
      >
        {loading ? "등록 중..." : "등록"}
      </button>
    </form>
  );
}