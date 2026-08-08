import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { PlayIcon } from "lucide-react";
import { getPublishedFilms } from "@/lib/data/films";

export const metadata: Metadata = {
  title: "FILMS | 비욘드스냅",
  description: "비욘드스냅이 촬영한 웨딩 영상을 만나보세요.",
};

export const revalidate = 3600; // 1시간

export default async function FilmsPage() {
  const films = await getPublishedFilms();

  return (
    <section className="mx-auto max-w-11xl">
      <h1 className="text-center mt-10 font-serif italic text-4xl text-neutral-400 tracking-widest md:tracking-[0.5em]">
        FILMS
      </h1>

      {films.length === 0 ? (
        <p className="mt-30 col-span-full text-center text-muted-foreground">
          아직 등록된 영상이 없습니다.
        </p>
      ) : (
        <div className="mt-30 grid grid-cols-1 gap-x-8 xl:gap-x-10 gap-y-15 xl:gap-y-18 md:grid-cols-2 xl:grid-cols-3 4xl:grid-cols-4">
          {films.map((film) => (
            <Link
              key={film.id}
              href={`/films/${film.slug}`}
              className="group block"
            >
              <div className="relative aspect-video w-full overflow-hidden rounded-md bg-muted">
                <Image
                  src={film.thumbnail_url}
                  alt={`${film.title} 웨딩필름 썸네일 - ${film.venue}`}
                  fill
                  quality={100}
                  sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center lg:bg-background/20 transition-colors duration-500 group-hover:bg-background/0">
                  <span className="flex h-14 w-14 items-center justify-center bg-background/60 rounded-full lg:opacity-60 text-foreground shadow-lg lg:group-hover:opacity-90">
                    <PlayIcon size={22} className="ml-1" fill="currentColor" />
                  </span>
                </div>
              </div>
              <p className="mt-3 font-serif text-lg font-medium text-foreground">
                {film.venue}
              </p>
              <p className="text-sm text-muted-foreground">{film.title}</p>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
