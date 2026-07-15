"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/env";
import { CEREMONY_CATEGORIES } from "@/lib/categories";
import type { CeremonyCategory } from "@/types/database";

export function NewGalleryForm() {
  const router = useRouter();
  const supabase = createClient();
  const [title, setTitle] = useState("");
  const [venue, setVenue] = useState("");
  const [venueType, setVenueType] = useState<CeremonyCategory>("bright");
  const [loading, setLoading] = useState(false);

  const slugify = (text: string) =>
    text.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9가-힣-]/g, "");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isSupabaseConfigured) {
      alert("Supabase가 아직 연결되지 않았어요. .env.local 설정 후 이용해주세요. (지금은 더미 데이터로 화면만 확인 중)");
      return;
    }

    setLoading(true);

    const { data, error } = await supabase
      .from("galleries")
      .insert({
        title,
        venue,
        venue_type: venueType,
        slug: `${slugify(venue)}-${Date.now()}`,
        published: false,
        sort_order: 0,
      })
      .select()
      .single();

    setLoading(false);
    if (!error && data) {
      router.push(`/admin/galleries/${data.id}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap gap-3">
      <input
        placeholder="예식장명"
        value={venue}
        onChange={(e) => setVenue(e.target.value)}
        className="flex-1 rounded-md border border-border px-3 py-2"
        required
      />
      <input
        placeholder="제목"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="flex-1 rounded-md border border-border px-3 py-2"
        required
      />
      <select
        value={venueType}
        onChange={(e) => setVenueType(e.target.value as CeremonyCategory)}
        className="rounded-md border border-border px-3 py-2"
      >
        {CEREMONY_CATEGORIES.map((c) => (
          <option key={c.slug} value={c.slug}>
            {c.label}
          </option>
        ))}
      </select>
      <button
        type="submit"
        disabled={loading}
        className="rounded-md bg-primary px-4 py-2 text-primary-foreground disabled:opacity-50"
      >
        생성
      </button>
    </form>
  );
}
