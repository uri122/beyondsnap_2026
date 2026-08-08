export default function IphoneSnapLoading() {
  return (
    <section className="mx-auto max-w-11xl">
      <h1 className="text-center mt-10 font-serif italic text-4xl text-neutral-400 tracking-widest md:tracking-[0.5em]">
        i-BEYOND
      </h1>

      <div role="status" aria-live="polite" className="mt-20">
        <span className="sr-only">목록을 불러오는 중입니다</span>

        <div
          className="grid grid-cols-2 gap-x-4 gap-y-16 md:grid-cols-3 xl:grid-cols-4 xl:gap-x-6 4xl:grid-cols-5"
          aria-hidden="true"
        >
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-[2/3] w-full rounded-md bg-muted" />
              <div className="mt-3 h-5 w-2/3 rounded bg-muted" />
              <div className="mt-2 h-4 w-1/3 rounded bg-muted" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
