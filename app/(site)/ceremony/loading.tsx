export default function FilmsLoading() {
  return (
    <section className="mx-auto max-w-11xl px-4 pt-24 pb-30 sm:px-6 lg:px-12 xl:pt-30">
      <h1 className="text-center mt-10 font-serif italic text-4xl text-neutral-400 tracking-widest md:tracking-[0.5em]">
        CEREMONY
      </h1>

      <div role="status" aria-live="polite" className="mt-10">
        <span className="sr-only">목록을 불러오는 중입니다</span>

        <div
          className="grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 xl:grid-cols-3"
          aria-hidden="true"
        >
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-video w-full rounded-md bg-muted" />
              <div className="mt-3 h-5 w-2/3 rounded bg-muted" />
              <div className="mt-2 h-4 w-1/3 rounded bg-muted" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
