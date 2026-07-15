import Image from "next/image";
import Link from "next/link";
import { getPublishedGalleries } from "@/lib/data/galleries";
import { CEREMONY_CATEGORIES } from "@/lib/categories";

// 카테고리별 대표(첫번째) 이미지를 커버로 보여주는 인덱스 페이지
export default async function CeremonyIndexPage() {
  const galleries = await getPublishedGalleries();

  return (
    <section className="mx-auto max-w-7xl px-4 py-16">
      <h1 className="font-serif text-3xl">세레모니</h1>
      <p className="mt-2 text-muted-foreground">베뉴별로 본식스냅 작업을 둘러보세요</p>

      <div className="mt-10 grid grid-cols-2 gap-6 md:grid-cols-4">
        {CEREMONY_CATEGORIES.map((category) => {
          const cover = galleries.find((g) => g.venue_type === category.slug)?.cover_image_url;
          return (
            <Link key={category.slug} href={`/ceremony/${category.slug}`} className="group block">
              <div className="relative aspect-[3/4] w-full overflow-hidden rounded-lg bg-muted">
                {cover && (
                  <Image
                    src={cover}
                    alt={category.label}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                )}
              </div>
              <p className="mt-3 text-center font-medium">{category.label}</p>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
