import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import {
  getGalleryBySlug,
  getGalleryPhotos,
  getAdjacentGalleries,
  getGalleriesByCategory,
} from "@/lib/data/galleries";
import { GalleryScroll } from "@/components/gallery/GalleryScroll";
import { ScrollToTopButton } from "@/components/common/ScrollToTopButton";
import { getCeremonyCategoryLabel } from "@/lib/categories";

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const gallery = await getGalleryBySlug(params.slug);
  if (!gallery) return {};

  const title = `${gallery.venue} 본식스냅 | ${gallery.title} - 비욘드스냅`;
  const description =
    gallery.description ?? `${gallery.venue}에서 진행된 비욘드스냅 본식스냅 기록, ${gallery.title}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: gallery.cover_image_url ? [{ url: gallery.cover_image_url }] : undefined,
    },
  };
}

export default async function GalleryDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const gallery = await getGalleryBySlug(params.slug);
  if (!gallery) notFound();

  const photos = await getGalleryPhotos(gallery.id);
  const { prev, next } = await getAdjacentGalleries(gallery.venue_type, gallery.sort_order);
  const categoryGalleries = await getGalleriesByCategory(gallery.venue_type);

  const categoryLabel = getCeremonyCategoryLabel(gallery.venue_type);
  const listHref = `/ceremony?type=${gallery.venue_type}`;
  const otherGalleries = categoryGalleries.filter((g) => g.id !== gallery.id).slice(0, 4);
  
  return (
    <section className="mx-auto max-w-[960px] px-3 py-24 text-center sm:px-6 sm:py-24">
      {/* 상단: 목록으로 */}
      <Link
        href={listHref}
        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft size={14} aria-hidden="true" />
        {categoryLabel} 목록으로
      </Link>

      <p className="mt-6 text-xs uppercase tracking-[0.2em] text-muted-foreground">
        {categoryLabel}
      </p>
      <h1 className="mt-2 font-sans text-2xl font-medium md:text-3xl">{gallery.venue}</h1>
      <p className="mt-2 text-muted-foreground">{gallery.title}</p>

      <GalleryScroll photos={photos} altText={`${gallery.venue} 본식스냅`} />

      {photos.length === 0 && (
        <p className="mt-16 text-muted-foreground">등록된 사진이 없습니다.</p>
      )}

      {/* 하단: 이전/다음 + 목록으로 + 다른 갤러리 */}
      <div className="mt-20 border-t border-border pt-10 text-left">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {prev ? (
            <Link
              href={`/ceremony/${prev.slug}`}
              aria-label={`이전 갤러리: ${prev.venue}`}
              className="flex items-center gap-3 rounded-md border border-border p-4 hover:bg-muted/50"
            >
              <ArrowLeft size={16} className="shrink-0 text-muted-foreground" aria-hidden="true" />
              <span className="min-w-0">
                <span className="block text-xs text-muted-foreground">이전</span>
                <span className="block truncate font-medium">{prev.venue}</span>
              </span>
            </Link>
          ) : (
            <div />
          )}

          {next ? (
            <Link
              href={`/ceremony/${next.slug}`}
              aria-label={`다음 갤러리: ${next.venue}`}
              className="flex items-center justify-end gap-3 rounded-md border border-border p-4 text-right hover:bg-muted/50 sm:col-start-2"
            >
              <span className="min-w-0">
                <span className="block text-xs text-muted-foreground">다음</span>
                <span className="block truncate font-medium">{next.venue}</span>
              </span>
              <ArrowRight size={16} className="shrink-0 text-muted-foreground" aria-hidden="true" />
            </Link>
          ) : (
            <div />
          )}
        </div>

        <div className="mt-8 text-center">
          <Link
            href={listHref}
            className="inline-flex items-center gap-1.5 rounded-md border border-border px-5 py-2.5 text-sm font-medium hover:bg-muted"
          >
            {categoryLabel} 목록으로
          </Link>
        </div>

        {otherGalleries.length > 0 && (
          <div className="mt-16">
            <p className="text-sm font-medium text-muted-foreground">
              다른 {categoryLabel} 갤러리
            </p>
            <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {otherGalleries.map((g) => (
                <Link key={g.id} href={`/ceremony/${g.slug}`} className="group block">
                  <div className="relative aspect-[3/4] overflow-hidden rounded-md bg-muted">
                    {g.cover_image_url && (
                      <Image
                        src={g.cover_image_url}
                        alt={`${g.venue} 본식스냅`}
                        fill
                        sizes="(max-width: 640px) 45vw, 220px"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    )}
                  </div>
                  <p className="mt-2 truncate text-sm">{g.venue}</p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      <ScrollToTopButton />
    </section>
  );
}