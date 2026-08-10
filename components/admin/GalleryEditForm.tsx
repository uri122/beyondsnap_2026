"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CEREMONY_CATEGORIES } from "@/lib/categories";
import { updateGallery, deleteGallery } from "@/app/actions/galleries";
import type { CeremonyCategory, Gallery } from "@/types/database";

export function GalleryEditForm({
  gallery,
  photoCount,
}: {
  gallery: Gallery;
  photoCount: number;
}) {
  const router = useRouter();
  const [venue, setVenue] = useState(gallery.venue);
  const [title, setTitle] = useState(gallery.title);
  const [venueType, setVenueType] = useState<CeremonyCategory>(
    gallery.venue_type ?? CEREMONY_CATEGORIES[0].slug,
  );
  const [published, setPublished] = useState(gallery.published);

  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isDslr = gallery.snap_type === "dslr";
  const listPath = isDslr ? "/admin/galleries" : "/admin/iphonesnap";
  const venueLabel = "장소 영문명";
  const deleteConfirmMessage = `"${gallery.title}" 글을 정말 삭제할까요? 사진까지 전부 지워지고 되돌릴 수 없어요.`;

  async function handleSave() {
    setError(null);

    if (published && !title.trim()) {
      setError("공개하려면 제목은 필수예요.");
      return;
    }
    if (published && photoCount === 0) {
      setError("공개하려면 사진을 최소 1장 이상 등록해주세요.");
      return;
    }

    setSaving(true);

    const result = await updateGallery(gallery.id, {
      venue,
      title,
      venueType: isDslr ? venueType : undefined,
      published,
    });

    if (!result.success) {
      setSaving(false);
      setError(result.error);
      return;
    }
    router.push(listPath);
  }

  async function handleDelete() {
    if (!confirm(deleteConfirmMessage)) return;

    setDeleting(true);
    const result = await deleteGallery(gallery.id);
    setDeleting(false);

    if (!result.success) {
      alert(result.error ?? "삭제에 실패했어요.");
      return;
    }
    router.push(listPath);
  }

  return (
    <section className="rounded-lg border border-border p-6">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-lg">기본 정보</h2>
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
          <label className="mb-1 block text-muted-foreground">
            {venueLabel} *
          </label>
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

        {/* 카테고리는 DSLR(예식) 갤러리에서만 노출 */}
        {isDslr && (
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
        )}
      </div>

      <div className="mt-8">
        {error && (
          <p className="mt-2 text-sm font-medium text-red-500">{error}</p>
        )}
        {published && photoCount === 0 && !error && (
          <p className="mt-2 text-sm text-amber-600">
            사진이 없어요. 저장 시 자동으로 비공개로 처리돼요.
          </p>
        )}
        {published !== gallery.published && !error && (
          <p className="mt-2 text-sm text-amber-600">
            공개 상태가 변경됐어요. 저장을 눌러야 실제로 반영돼요.
          </p>
        )}

        <div className="mt-3 flex items-center justify-between">
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
            {deleting ? "삭제 중..." : "삭 제"}
          </button>
        </div>
      </div>
    </section>
  );
}
