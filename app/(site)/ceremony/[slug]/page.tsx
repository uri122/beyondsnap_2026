import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import {
  getGalleryBySlug,
  getGalleryPhotos,
  getAdjacentGalleries,
} from "@/lib/data/galleries";
import { GalleryScroll } from "@/components/gallery/GalleryScroll";
import { ScrollToTopButton } from "@/components/common/ScrollToTopButton";
import { getCeremonyCategoryLabel, isCeremonyCategory } from "@/lib/categories";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const gallery = await getGalleryBySlug(slug);
  if (!gallery || gallery.snap_type !== "dslr" || !gallery.venue_type)
    return {};

  const title = `${gallery.venue} 본식스냅 | ${gallery.title} - 비욘드스냅`;
  const description =
    gallery.description ??
    `${gallery.venue}에서 진행된 비욘드스냅 본식스냅 기록, ${gallery.title}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: gallery.cover_image_url
        ? [{ url: gallery.cover_image_url }]
        : undefined,
    },
  };
}

export default async function GalleryDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ type?: string }>;
}) {
  const { slug } = await params;
  const gallery = await getGalleryBySlug(slug);
  if (!gallery || gallery.snap_type !== "dslr" || !gallery.venue_type)
    notFound();

  const { type } = await searchParams;
  // 쿼리로 들어온 카테고리가 실제로 이 갤러리의 카테고리와 일치할 때만 "필터된 상태로 들어왔다"고 인정.
  // (다른 카테고리 값을 넣거나 존재하지 않는 값을 넣는 등의 URL 조작 방지)
  const categoryScope =
    type && isCeremonyCategory(type) && type === gallery.venue_type
      ? gallery.venue_type
      : null;

  const photos = await getGalleryPhotos(gallery.id);
  const { prev, next } = await getAdjacentGalleries(
    gallery.sort_order,
    categoryScope ?? undefined,
  );

  const categoryLabel = getCeremonyCategoryLabel(gallery.venue_type);
  const listHref = categoryScope
    ? `/ceremony?type=${categoryScope}`
    : "/ceremony";
  const detailQuery = categoryScope ? `?type=${categoryScope}` : "";

  const listButtonClass =
    "min-w-20 shink-0 inline-flex justify-center items-center gap-1.5 rounded-sm border border-border px-4 py-2 text-xs font-medium text-muted-foreground hover:bg-muted";

  return (
    <section className="mx-auto max-w-6xl text-center">
      <Link href={listHref} className={listButtonClass}>
        목록으로
      </Link>

      <p className="mt-15 text-xs uppercase tracking-[0.2em] text-accent-rose">
        {categoryLabel}
      </p>

      <h1 className="mt-8 font-serif uppercase text-2xl md:text-3xl 3xl:text-5xl">
        {gallery.venue}
      </h1>
      <p className="mt-2 text-muted-foreground">{gallery.title}</p>

      <GalleryScroll photos={photos} altText={`${gallery.venue} 본식스냅`} />

      {photos.length === 0 && (
        <p className="mt-16 text-muted-foreground">등록된 사진이 없습니다.</p>
      )}

      {/* 하단: 이전/다음 (한 줄, 컴팩트) + 목록으로 */}
      <div className="mt-20 border-t border-border pt-8 text-center ">
        <div className="flex justify-between items-center items-stretch gap-2 text-xs sm:text-sm md:gap-6">
          {prev ? (
            <Link
              href={`/ceremony/${prev.slug}${detailQuery}`}
              aria-label={`이전 갤러리: ${prev.venue} ${prev.title}`}
              className="min-w-40 flex-1 flex flex-col gap-0.5 rounded-md border border-border px-3 py-2 hover:bg-muted/50"
            >
              <div className="flex items-center gap-1.5">
                <ArrowLeft
                  size={14}
                  className="text-muted-foreground"
                  aria-hidden="true"
                />
                <span className="text-muted-foreground">이전</span>
              </div>
              <div className="pl-5 text-left">
                <span className="font-medium text-accent-rose">
                  {prev.title}
                </span>
              </div>
            </Link>
          ) : (
            <div className="flex-1" />
          )}

          {next ? (
            <Link
              href={`/ceremony/${next.slug}${detailQuery}`}
              aria-label={`다음 갤러리: ${next.venue} ${next.title}`}
              className="min-w-40 flex-1 flex flex-col items-end gap-1 rounded-md border border-border px-3 py-2 text-right hover:bg-muted/50"
            >
              <div className="flex items-center gap-1.5">
                <span className="text-muted-foreground">다음</span>
                <ArrowRight
                  size={14}
                  className="text-muted-foreground"
                  aria-hidden="true"
                />
              </div>
              <div className="pr-5">
                <span className="font-medium text-accent-rose">
                  {next.title}
                </span>
              </div>
            </Link>
          ) : (
            <div className="flex-1" />
          )}
        </div>

        <div className="mt-4 text-center">
          <Link href={listHref} className={listButtonClass}>
            목록으로
          </Link>
        </div>
      </div>

      <ScrollToTopButton />
    </section>
  );
}
