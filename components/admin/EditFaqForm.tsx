"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateFaq, deleteFaq } from "@/app/actions/faqs";
import type { Faq } from "@/types/database";

export function EditFaqForm({ faq }: { faq: Faq }) {
  const router = useRouter();
  const [question, setQuestion] = useState(faq.question);
  const [answer, setAnswer] = useState(faq.answer);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const result = await updateFaq(faq.id, { question, answer });

    setLoading(false);

    if (!result.success) {
      alert(result.error);
      return;
    }

    router.push("/admin/faq");
    router.refresh();
  };

  const handleDelete = async () => {
    if (!confirm("이 FAQ를 삭제할까요? 되돌릴 수 없습니다.")) return;

    const result = await deleteFaq(faq.id);

    if (!result.success) {
      alert(result.error);
      return;
    }

    router.push("/admin/faq");
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <label className="text-sm font-medium">
        질문
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          className="mt-1 w-full rounded-md border border-border px-3 py-2 text-sm font-normal"
          required
        />
      </label>

      <label className="text-sm font-medium">
        답변
        <textarea
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          className="mt-1 min-h-32 w-full rounded-md border border-border px-3 py-2 text-sm font-normal"
          required
        />
      </label>

      <p className="text-xs text-muted-foreground">
        노출 순서는 이 페이지가 아니라 FAQ 목록에서 위/아래 버튼으로 바꿀 수 있어요.
      </p>

      <div className="mt-2 flex gap-2">
        <button
          type="submit"
          disabled={loading}
          className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground disabled:opacity-50"
        >
          {loading ? "저장 중..." : "저장"}
        </button>
        <button
          type="button"
          onClick={handleDelete}
          disabled={loading}
          className="rounded-md bg-destructive/10 px-4 py-2 text-sm text-destructive hover:bg-destructive/20 disabled:opacity-50"
        >
          삭제
        </button>
      </div>
    </form>
  );
}