import Image from "next/image";
import Link from "next/link";
import { getSiteSettings } from "@/lib/data/settings";
import { getLatestGalleryByCategory } from "@/lib/data/galleries";
import { CEREMONY_CATEGORIES } from "@/lib/categories";

export default async function IntroPage() {
  const categoryShortcuts = await Promise.all(
    CEREMONY_CATEGORIES.map(async (category) => ({
      ...category,
      gallery: await getLatestGalleryByCategory(category.slug),
    }))
  );

  return (
    <>
      {/* 풀블리드 히어로: 헤더(h-16=4rem)를 뺀 나머지 화면을 이미지로 꽉 채움 */}
      <section className="relative h-[calc(100svh-4rem)] w-full overflow-hidden">
        <Image
          src="/images/hero-main.jpg"
          alt="비욘드스냅 대표 컷"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        {/* <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" /> */}
      </section>

      {/* 세레모니 카테고리 숏컷: 각 카테고리 최신 게시글의 대표이미지 */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-32 text-center">
        <h2 className="text-lg sm:text-xl tracking-[0.3em] text-neutral-800 mb-2">VENUE STYLE</h2>
        <p className="text-xs font-light tracking-wide text-neutral-400 mb-12 sm:mb-16">
          베뉴의 특성에 맞춘 비욘드스냅의 시선을 확인하세요
        </p>

        <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4">

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-4">
            {categoryShortcuts.map((slug, label, gallery) => (
              <Link 
                key={slug} 
                href={`/ceremony?type=${slug}`}
                className="relative aspect-[4/5] overflow-hidden group bg-neutral-50 block"
              >
                <Image
                  src={gallery?.thumbnailUrl}
                  alt={label}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  sizes="(max-w-640px) 100vw, (max-w-1024px) 50vw, 25vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent sm:bg-black/30 sm:group-hover:bg-black/50 transition-colors duration-500" />
                
                <div className="absolute inset-0 flex flex-col items-center justify-end sm:justify-center p-6 text-white text-center">
                  <span className="text-xs sm:text-sm tracking-[0.2em] font-light border border-white/40 px-5 py-2 backdrop-blur-[2px] mb-2 sm:mb-0">
                    {label}
                  </span>
                </div>
              </Link>
            ))}
          </div>
          </div>

      </section>
    </>
  );
}
