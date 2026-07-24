import Image from "next/image";
import Link from "next/link";
import { getSiteSettings } from "@/lib/data/settings";
import { getLatestGalleryByCategory } from "@/lib/data/galleries";
import { CEREMONY_CATEGORIES } from "@/lib/categories";

export default async function IntroPage() {
  const [categoryShortcuts, settings] = await Promise.all([
    Promise.all(
      CEREMONY_CATEGORIES.map(async (category) => ({
        ...category,
        gallery: await getLatestGalleryByCategory(category.slug),
      })),
    ),
    getSiteSettings(["hero_image_url"]),
  ]);

  // 관리자 화면(사이트 기본정보)에서 등록한 이미지가 있으면 그걸 쓰고,
  // 아직 등록 전이면 기존 정적 이미지로 대체합니다.
  const heroImageUrl = settings.hero_image_url || "/images/hero-main.jpg";

  return (
    <>
      <section className="relative h-[calc(100dvh-3rem)] md:h-screen w-full overflow-hidden">
        <Image
          src={heroImageUrl}
          alt="비욘드스냅 대표 컷"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
      </section>

      {/* 세레모니 카테고리 숏컷: 각 카테고리 최신 게시글의 대표이미지 */}
      <section className="w-full max-w-7xl 4xl:max-w-10xl mx-auto px-4 sm:px-6 lg:px-8 pt-25 pb-35 sm:pt-30 sm:pb-40 text-center">
        <h2 className="text-xl sm:text-3xl tracking-[0.3em] text-neutral-800 mb-2 uppercase">
          Beyond the Venue
        </h2>
        <p className="text-xs tracking-wide text-neutral-500 mb-12 sm:mb-16">
          베뉴의 특성에 맞춘 비욘드스냅의 시선을 확인하세요
        </p>

        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4 md:gap-5">
          {categoryShortcuts.map(({ slug, label, labelEn, gallery }) => (
            <Link
              key={slug}
              href={`/ceremony?type=${slug}`}
              aria-label={`${label} 갤러리 보기`}
              className="group relative block aspect-[2/3] overflow-hidden bg-neutral-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2 drop-shadow-[0_1px_3px_rgba(0,0,0,0.1)]"
            >
              {gallery?.cover_image_url && (
                <Image
                  src={gallery.cover_image_url}
                  alt={`${label} 스타일로 촬영된 본식스냅 대표 사진`}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 25vw"
                  className="object-cover"
                />
              )}

              <div className="absolute inset-0 bg-black/30 transition-colors duration-500 motion-safe:group-hover:bg-black/50" />

              <div className="absolute inset-0 flex items-center justify-center p-6">
                <h3 className="text-sm tracking-[0.3em] text-background/80 px-5 py-2 pl-6 border-1 border-neutral-50/30 bg-black/30">
                  {labelEn}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
