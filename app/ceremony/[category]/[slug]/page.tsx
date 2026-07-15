import { notFound } from "next/navigation";
import { getGalleryBySlug, getGalleryPhotos } from "@/lib/data/galleries";
import { GalleryGrid } from "@/components/gallery/GalleryGrid";

export default async function GalleryDetailPage({
  params,
}: {
  params: { category: string; slug: string };
}) {
  const gallery = await getGalleryBySlug(params.slug);
  if (!gallery || gallery.venue_type !== params.category) notFound();

  const photos = await getGalleryPhotos(gallery.id);

  return (
    <section className="mx-auto max-w-7xl px-4 py-16">
      <h1 className="font-serif text-3xl">{gallery.venue}</h1>
      <p className="mt-2 text-muted-foreground">{gallery.title}</p>

      <GalleryGrid photos={photos} />
    </section>
  );
}
