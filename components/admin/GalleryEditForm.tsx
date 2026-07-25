"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CEREMONY_CATEGORIES } from "@/lib/categories";
import { updateGallery, deleteGallery } from "@/app/actions/galleries";
import type { CeremonyCategory, Gallery } from "@/types/database";

export function GalleryEditForm({ gallery }: { gallery: Gallery }) {
  const router = useRouter();
  const [venue, setVenue] = useState(gallery.venue);
  const [title, setTitle] = useState(gallery.title);
  const [venueType, setVenueType] = useState<CeremonyCategory>(
    gallery.venue_type,
  );
  const [published, setPublished] = useState(gallery.published);

  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    setError(null);
    setSaving(true);

    const result = await updateGallery(gallery.id, {
      venue,
      title,
      venueType,
      published,
    });

    if (!result.success) {
      setSaving(false);
      setError(result.error);
      return;
    }
    router.push("/admin/galleries");
    router.refresh();
  }

  async function handleDelete() {
    if (
      !confirm(
        `"${gallery.venue}" 갤러리를 정말 삭제할까요? 사진까지 전부 지워지고 되돌릴 수 없어요.`,
      )
    ) {
      return;
    }
    setDeleting(true);
    const result = await deleteGallery(gallery.id);
    setDeleting(false);

    if (!result.success) {
      alert(result.error ?? "삭제에 실패했어요.");
      return;
    }
    router.push("/admin/galleries");
    router.refresh();
  }

  return (
    <section className="rounded-lg border border-border p-6">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-lg">기본 정보</h2>
        {/* 공개 / 비공개 토글 */}
        <button
          type="button"
          role="switch"
          aria-checked={published}
          onClick={() => setPublished((v) => !v)}
          disabled={saving || deleting}
          className={`relative inline-flex h-8 w-20 shrink-0 items-center rounded-full transition-colors disabled:opacity-50 ${
            published ? "bg-green-500" : "bg-gray-400"
          }`}
        >
          <span
            className={`z-10 w-full select-none text-sm font-semibold text-white ${
              published ? "text-left pl-2.5" : "text-right pr-2.5"
            }`}
          >
            {published ? "공개" : "비공개"}
          </span>

          <span
            className={`absolute left-1 h-6 w-6 rounded-full bg-white shadow transition-transform duration-200 ${
              published ? "translate-x-12" : "translate-x-0"
            }`}
          />
        </button>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-muted-foreground">예식장명 *</label>
          <input
            value={venue}
            onChange={(e) => setVenue(e.target.value)}
            className="w-full rounded-md border border-border px-3 py-2"
            disabled={saving || deleting}
          />
        </div>
        <div>
          <label className="mb-1 block text-muted-foreground">제목 *</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-md border border-border px-3 py-2"
            disabled={saving || deleting}
          />
        </div>
        <div>
          <label className="mb-1 block text-muted-foreground">카테고리</label>
          <select
            value={venueType}
            onChange={(e) => setVenueType(e.target.value as CeremonyCategory)}
            className="w-full rounded-md border border-border px-3 py-2"
            disabled={saving || deleting}
          >
            {CEREMONY_CATEGORIES.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && <p className="mt-3 text-sm text-red-500">{error}</p>}
      {published !== gallery.published && !error && (
        <p className="mt-3 text-sm text-amber-600">
          공개 상태가 변경됐어요. 저장을 눌러야 실제로 반영돼요.
        </p>
      )}

      <div className="mt-5 flex items-center justify-between">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving || deleting}
          className="rounded-md bg-primary px-6 py-2 font-medium text-primary-foreground disabled:opacity-50"
        >
          {saving ? "저장 중..." : "저 장"}
        </button>

        <button
          type="button"
          onClick={handleDelete}
          disabled={saving || deleting}
          className="rounded-md border border-red-300 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
        >
          {deleting ? "삭제 중..." : "갤러리 삭제"}
        </button>
      </div>
    </section>
  );
}
