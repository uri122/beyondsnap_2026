import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getGalleriesByCategory } from "@/lib/data/galleries";
import { isCeremonyCategory, getCeremonyCategoryLabel } from "@/lib/categories";

export default async function CeremonyCategoryPage({ params }: { params: { category: string } }) {
  if (!isCeremonyCategory(params.category)) notFound();

  const galleries = await getGalleriesByCategory(params.category);
  const label = getCeremonyCategoryLabel(params.category);

  return (
    <section className="mx-auto max-w-7xl px-4 py-16">
      <h1 className="font-serif text-3xl">세레모니 · {label}</h1>

      <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {galleries.map((gallery) => (
          <Link
            key={gallery.id}
            href={`/ceremony/${params.category}/${gallery.slug}`}
            className="group block overflow-hidden rounded-lg"
          >
            <div className="relative aspect-[4/5] w-full overflow-hidden bg-muted">
              {gallery.cover_image_url && (
                <Image
                  src={gallery.cover_image_url}
                  alt={gallery.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              )}
            </div>
            <div className="mt-3">
              <p className="font-medium">{gallery.venue}</p>
              <p className="text-sm text-muted-foreground">{gallery.title}</p>
            </div>
          </Link>
        ))}
        {galleries.length === 0 && (
          <p className="text-muted-foreground">아직 등록된 갤러리가 없습니다.</p>
        )}
      </div>
    </section>
  );
}
