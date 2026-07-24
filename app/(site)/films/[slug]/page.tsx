import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getFilmBySlug } from "@/lib/data/films";
import { getVideoEmbedUrl } from "@/lib/video";

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const film = await getFilmBySlug(params.slug);
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
  params: { slug: string };
}) {
  const film = await getFilmBySlug(params.slug);
  if (!film) notFound();

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

  return (
    <section className="mx-auto max-w-6xl px-4 py-24 text-center sm:px-6">
      <Link
        href="/films"
        className="inline-flex justify-center items-center rounded-sm border border-border px-4 py-2 text-xs font-medium hover:bg-muted"
      >
        목록으로
      </Link>

      <h1 className="mt-18 font-serif text-2xl md:text-3xl">{film.venue}</h1>
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
    </section>
  );
}
