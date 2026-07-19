import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getGalleryBySlug, getGalleryPhotos } from "@/lib/data/galleries";
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

  return (
    <section className="mx-auto max-w-[960px] px-3 py-16 text-center sm:px-6 sm:py-24">
      <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
        {getCeremonyCategoryLabel(gallery.venue_type)}
      </p>
      <h1 className="mt-2 font-sans text-2xl font-medium md:text-3xl">{gallery.venue}</h1>
      <p className="mt-2 text-muted-foreground">{gallery.title}</p>

      <GalleryScroll photos={photos} altText={`${gallery.venue} 본식스냅`} />

      {photos.length === 0 && (
        <p className="mt-16 text-muted-foreground">등록된 사진이 없습니다.</p>
      )}

      <ScrollToTopButton />
    </section>
  );
}