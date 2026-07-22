import Image from "next/image";
import Link from "next/link";
import { getPublishedGalleries, getGalleriesByCategory } from "@/lib/data/galleries";
import { CEREMONY_CATEGORIES, isCeremonyCategory } from "@/lib/categories";
import type { CeremonyCategory } from "@/types/database";

export default async function CeremonyPage({
  searchParams,
}: {
  searchParams: { type?: string };
}) {
  const rawType = searchParams.type ?? "";
  const activeCategory: CeremonyCategory | null = isCeremonyCategory(rawType)
    ? (rawType as CeremonyCategory)
    : null;

  const galleries = activeCategory
    ? await getGalleriesByCategory(activeCategory)
    : await getPublishedGalleries();

  const navItems = [
    { key: "all", href: "/ceremony", label: "ALL", labelKr: "전체", active: !activeCategory },
    ...CEREMONY_CATEGORIES.map((category) => ({
      key: category.slug,
      href: `/ceremony?type=${category.slug}`,
      label: category.labelEn,
      labelKr: category.label,
      active: activeCategory === category.slug,
    })),
  ];

  return (
    <section className="mx-auto max-w-11xl px-4 pt-30 pb-15 sm:px-6 lg:px-12">
      <h1 className="text-center mt-10 font-serif italic text-4xl text-neutral-400 tracking-[0.5em]">CEREMONY</h1>

      <nav className="mt-8 flex flex-wrap items-center justify-center text-xs md:text-sm font-medium uppercase tracking-[0.1em] text-muted-foreground">
        {navItems.map((item, i) => (
          <span key={item.key} className="flex items-center">
            {i > 0 && <span className="mx-3 text-border">/</span>}
            <Link
              href={item.href}
              className={`border-b pb-1 transition-colors ${
                item.active
                  ? "border-foreground text-foreground"
                  : "border-transparent hover:text-foreground"
              }`}
            >
              {item.label}
            </Link>
          </span>
        ))}
      </nav>

      <div className="mt-15 grid grid-cols-2 gap-x-6 gap-y-16 md:grid-cols-3 xl:grid-cols-4 4xl:grid-cols-5">
        {galleries.map((gallery) => (
          <Link key={gallery.id} href={`/ceremony/${gallery.slug}`} className="group block">
            <div className="relative aspect-[2/3] w-full overflow-hidden bg-muted">
              {gallery.cover_image_url && (
                <Image
                  src={gallery.cover_image_url}
                  alt={`${gallery.venue} 본식스냅 - ${gallery.title}`}
                  fill
                  quality={90}
                  sizes="(max-width: 768px) 70vw, (max-width: 1280px) 45vw, (max-width: 1920px) 35vw, 30vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
              )}
            </div>
            <div className="mt-4">
              <p className="font-serif text-lg md:text-xl font-medium text-foreground">{gallery.venue}</p>
              <p className="mt-1 text-sm md:text-base font-semibold text-muted-foreground">{gallery.title}</p>
            </div>
          </Link>
        ))}

        {galleries.length === 0 && (
          <p className="col-span-full text-center text-muted-foreground">
            아직 등록된 베뉴가 없습니다.
          </p>
        )}
      </div>
    </section>
  );
}