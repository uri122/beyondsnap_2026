import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import {
  getGalleryBySlug,
  getGalleryPhotos,
  getAdjacentIphoneSnaps,
} from "@/lib/data/galleries";
import { GalleryScroll } from "@/components/gallery/GalleryScroll";
import { ScrollToTopButton } from "@/components/common/ScrollToTopButton";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const gallery = await getGalleryBySlug(slug);
  if (!gallery || gallery.snap_type !== "iphone") return {};

  const title = `${gallery.venue} 아이폰스냅 | ${gallery.title} - 비욘드스냅`;
  const description =
    gallery.description ??
    `${gallery.venue}에서 진행된 비욘드스냅 아이폰스냅 기록, ${gallery.title}`;

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

export default async function IphoneSnapDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const gallery = await getGalleryBySlug(slug);

  if (!gallery || gallery.snap_type !== "iphone") notFound();

  const photos = await getGalleryPhotos(gallery.id);
  const { prev, next } = await getAdjacentIphoneSnaps(gallery.sort_order);

  const listHref = "/iphonesnap";
  const listButtonClass =
    "min-w-20 shink-0 inline-flex justify-center items-center gap-1.5 rounded-sm border border-border px-4 py-2 text-xs font-medium text-muted-foreground hover:bg-muted";

  return (
    <section className="mx-auto max-w-6xl text-center">
      <Link href={listHref} className={listButtonClass}>
        목록으로
      </Link>

      <h1 className="mt-10 font-serif uppercase text-2xl md:text-3xl 3xl:text-5xl">
        {gallery.venue.split(",").map((line, idx) => (
          <p key={idx}>{line}</p>
        ))}
      </h1>
      <p className="mt-2 text-muted-foreground">{gallery.title}</p>

      <GalleryScroll photos={photos} altText={`${gallery.venue} 아이폰스냅`} />

      {photos.length === 0 && (
        <p className="mt-16 text-muted-foreground">등록된 사진이 없습니다.</p>
      )}

      <div className="mt-20 border-t border-border pt-8 text-center">
        <div className="flex justify-between items-center items-stretch gap-2 text-xs sm:text-sm md:gap-6">
          {prev ? (
            <Link
              href={`/iphonesnap/${prev.slug}`}
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
              href={`/iphonesnap/${next.slug}`}
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
