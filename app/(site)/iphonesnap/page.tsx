import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getPublishedGalleries } from "@/lib/data/galleries";

export const metadata: Metadata = {
  title: "iPhone SNAP | 비욘드스냅",
  description: "비욘드스냅이 아이폰으로 담은 본식 스냅을 만나보세요.",
};

export const revalidate = 3600; // 1시간

export default async function IphoneSnapPage() {
  const galleries = await getPublishedGalleries("iphone");

  return (
    <section className="mx-auto max-w-11xl">
      <h1 className="text-center mt-10 font-serif italic text-4xl text-neutral-400 tracking-widest md:tracking-[0.5em]">
        i-BEYOND
      </h1>

      <div className="mt-20 grid grid-cols-2 gap-x-4 gap-y-16 md:grid-cols-3 xl:grid-cols-4 xl:gap-x-6 4xl:grid-cols-5">
        {galleries.map((gallery) => (
          <Link
            key={gallery.id}
            href={`/iphonesnap/${gallery.slug}`}
            className="group block"
          >
            <div className="relative aspect-[2/3] w-full overflow-hidden bg-muted">
              {gallery.cover_image_url && (
                <Image
                  src={gallery.cover_image_url}
                  alt={`${gallery.venue} 아이폰스냅 - ${gallery.title}`}
                  fill
                  quality={100}
                  sizes="(max-width: 768px) 70vw, (max-width: 1280px) 45vw, (max-width: 1920px) 35vw, 30vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
              )}
            </div>
            <div className="mt-3 md:mt-3">
              <p className="font-serif text-sm lg:text-xl font-medium text-foreground">
                {gallery.venue}
              </p>
              <p className="mt-1 text-xs lg:text-base text-muted-foreground">
                {gallery.title}
              </p>
            </div>
          </Link>
        ))}

        {galleries.length === 0 && (
          <p className="col-span-full text-center text-muted-foreground">
            아직 등록된 사진이 없습니다.
          </p>
        )}
      </div>
    </section>
  );
}
