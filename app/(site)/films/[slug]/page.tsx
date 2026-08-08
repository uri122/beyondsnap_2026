import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { getFilmBySlug, getAdjacentFilms } from "@/lib/data/films";
import { getVideoEmbedUrl } from "@/lib/video";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const film = await getFilmBySlug(slug);
  if (!film) return {};

  const title = `${film.venue} 웨딩 영상 | ${film.title} - 비욘드스냅`;
  const description = `${film.title}에서 진행된 비욘드스냅 웨딩 영상, ${film.venue}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [{ url: film.thumbnail_url }],
    },
  };
}

export default async function FilmDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const film = await getFilmBySlug(slug);
  if (!film) notFound();

  const listHref = "/films";
  const listButtonClass =
    "min-w-20 shink-0 inline-flex justify-center items-center gap-1.5 rounded-sm border border-border px-4 py-2 text-xs font-medium text-muted-foreground hover:bg-muted";

  const embedUrl = getVideoEmbedUrl(film.video_url);

  // 구글이 영상 콘텐츠로 인식하도록 하는 구조화 데이터.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name: film.title,
    description: `${film.title} 웨딩 영상 - ${film.venue}`,
    thumbnailUrl: [film.thumbnail_url],
    uploadDate: film.created_at,
    embedUrl: embedUrl ?? undefined,
    contentUrl: film.video_url,
  };
  const jsonLdString = JSON.stringify(jsonLd).replace(/</g, "\\u003c");

  const { prev, next } = await getAdjacentFilms(film.sort_order);

  return (
    <section className="mx-auto max-w-6xl text-center">
      <Link href={listHref} className={listButtonClass}>
        목록으로
      </Link>

      <h1 className="mt-18 font-serif uppercase text-2xl md:text-3xl 3xl:text-5xl">
        {film.venue}
      </h1>
      <p className="mt-2 text-muted-foreground">{film.title}</p>

      <div className="relative mt-12 aspect-video w-full bg-black">
        {embedUrl ? (
          <iframe
            src={embedUrl}
            title={`${film.venue} ${film.title}`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 h-full w-full"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center text-white">
            <p>이 링크는 미리보기로 재생할 수 없어요.</p>
            <a
              href={film.video_url}
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-4"
            >
              새 창에서 영상 보기
            </a>
          </div>
        )}
      </div>

      {/* eslint-disable-next-line react/no-danger */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdString }}
      />

      {/* 하단: 이전/다음 + 목록으로 */}
      <div className="mt-20 border-t border-border pt-8 text-center ">
        <div className="flex justify-between items-center items-stretch gap-2 text-xs sm:text-sm md:gap-6">
          {prev ? (
            <Link
              href={`/films/${prev.slug}`}
              aria-label={`이전 영상: ${prev.venue} ${prev.title}`}
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
              href={`/films/${next.slug}`}
              aria-label={`다음 영상: ${next.venue} ${next.title}`}
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
    </section>
  );
}
