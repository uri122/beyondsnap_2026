"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/env";

export async function createFaq(input: {
  question: string;
  answer: string;
  sortOrder: number;
}) {
  if (!isSupabaseConfigured) {
    return {
      success: false as const,
      error:
        "Supabase가 아직 연결되지 않았어요. .env.local 설정 후 이용해주세요.",
    };
  }
  if (!input.question.trim() || !input.answer.trim()) {
    return {
      success: false as const,
      error: "질문과 답변을 모두 입력해주세요.",
    };
  }

  const supabase = createAdminClient();
  const { error } = await supabase.from("faqs").insert({
    question: input.question.trim(),
    answer: input.answer.trim(),
    sort_order: input.sortOrder,
  });

  if (error) return { success: false as const, error: error.message };
  return { success: true as const };
}

export async function updateFaq(
  id: string,
  input: { question: string; answer: string },
) {
  if (!isSupabaseConfigured) {
    return {
      success: false as const,
      error:
        "Supabase가 아직 연결되지 않았어요. .env.local 설정 후 이용해주세요.",
    };
  }
  if (!input.question.trim() || !input.answer.trim()) {
    return {
      success: false as const,
      error: "질문과 답변을 모두 입력해주세요.",
    };
  }

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("faqs")
    .update({ question: input.question.trim(), answer: input.answer.trim() })
    .eq("id", id);

  if (error) return { success: false as const, error: error.message };
  return { success: true as const };
}

export async function deleteFaq(id: string) {
  if (!isSupabaseConfigured) {
    return {
      success: false as const,
      error:
        "Supabase가 아직 연결되지 않았어요. .env.local 설정 후 이용해주세요.",
    };
  }

  const supabase = createAdminClient();
  const { error } = await supabase.from("faqs").delete().eq("id", id);

  if (error) return { success: false as const, error: error.message };
  return { success: true as const };
}

export async function reorderFaqs(
  updates: { id: string; sortOrder: number }[],
) {
  if (!isSupabaseConfigured) {
    return {
      success: false as const,
      error:
        "Supabase가 아직 연결되지 않았어요. .env.local 설정 후 이용해주세요.",
    };
  }

  const supabase = createAdminClient();

  const results = await Promise.all(
    updates.map((u) =>
      supabase.from("faqs").update({ sort_order: u.sortOrder }).eq("id", u.id),
    ),
  );

  const failed = results.find((r) => r.error);
  if (failed?.error)
    return { success: false as const, error: failed.error.message };
  return { success: true as const };
}
