"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/env";

export async function createFaq(input: { question: string; answer: string; sortOrder: number }) {
  if (!isSupabaseConfigured) {
    return { success: false as const, error: "Supabase가 아직 연결되지 않았어요. .env.local 설정 후 이용해주세요." };
  }
  if (!input.question.trim() || !input.answer.trim()) {
    return { success: false as const, error: "질문과 답변을 모두 입력해주세요." };
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

export async function updateFaq(id: string, input: { question: string; answer: string }) {
  if (!isSupabaseConfigured) {
    return { success: false as const, error: "Supabase가 아직 연결되지 않았어요. .env.local 설정 후 이용해주세요." };
  }
  if (!input.question.trim() || !input.answer.trim()) {
    return { success: false as const, error: "질문과 답변을 모두 입력해주세요." };
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
    return { success: false as const, error: "Supabase가 아직 연결되지 않았어요. .env.local 설정 후 이용해주세요." };
  }

  const supabase = createAdminClient();
  const { error } = await supabase.from("faqs").delete().eq("id", id);

  if (error) return { success: false as const, error: error.message };
  return { success: true as const };
}

// FAQ 목록에서 위/아래 버튼을 눌렀을 때, 인접한 두 항목의 sort_order를 맞바꿉니다.
export async function swapFaqOrder(
  current: { id: string; sortOrder: number },
  target: { id: string; sortOrder: number }
) {
  if (!isSupabaseConfigured) {
    return { success: false as const, error: "Supabase가 아직 연결되지 않았어요. .env.local 설정 후 이용해주세요." };
  }

  const supabase = createAdminClient();

  const [{ error: error1 }, { error: error2 }] = await Promise.all([
    supabase.from("faqs").update({ sort_order: target.sortOrder }).eq("id", current.id),
    supabase.from("faqs").update({ sort_order: current.sortOrder }).eq("id", target.id),
  ]);

  const error = error1 ?? error2;
  if (error) return { success: false as const, error: error.message };
  return { success: true as const };
}