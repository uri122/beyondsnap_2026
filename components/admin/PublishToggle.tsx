"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/env";

export function PublishToggle({ galleryId, published }: { galleryId: string; published: boolean }) {
  const router = useRouter();
  const supabase = createClient();
  const [isPublished, setIsPublished] = useState(published);

  const toggle = async () => {
    if (!isSupabaseConfigured) {
      alert("Supabase가 아직 연결되지 않았어요. .env.local 설정 후 이용해주세요.");
      return;
    }

    const next = !isPublished;
    setIsPublished(next);
    await supabase.from("galleries").update({ published: next }).eq("id", galleryId);
    router.refresh();
  };

  return (
    <button
      onClick={toggle}
      className={`rounded-full px-4 py-2 text-sm font-medium ${
        isPublished ? "bg-green-100 text-green-700" : "bg-muted text-muted-foreground"
      }`}
    >
      {isPublished ? "공개중" : "비공개"}
    </button>
  );
}
