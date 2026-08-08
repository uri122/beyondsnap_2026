export default function FilmDetailLoading() {
  return (
    <section className="mx-auto max-w-6xl text-center">
      <div className="inline-block h-8 w-24 animate-pulse rounded-sm bg-muted" />

      <div role="status" aria-live="polite">
        <span className="sr-only">영상 정보를 불러오는 중입니다</span>

        <div
          className="mt-15 flex flex-col items-center gap-3"
          aria-hidden="true"
        >
          <div className="h-3 w-16 animate-pulse rounded bg-muted" />
          <div className="h-8 w-56 animate-pulse rounded bg-muted" />
          <div className="h-4 w-40 animate-pulse rounded bg-muted" />
        </div>

        <div
          className="relative mt-10 aspect-video w-full animate-pulse overflow-hidden rounded-md bg-muted"
          aria-hidden="true"
        />
      </div>
    </section>
  );
}
