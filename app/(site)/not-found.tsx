import Link from "next/link";

export default function SiteNotFound() {
  return (
    <section className="mx-auto flex min-h-[70vh] max-w-2xl flex-col items-center justify-center px-4 text-center">
      <p className="font-serif italic text-6xl text-neutral-300">404</p>
      <h1 className="mt-6 font-serif text-2xl">페이지를 찾을 수 없어요</h1>
      <p className="mt-3 text-muted-foreground">
        주소가 바뀌었거나, 더 이상 존재하지 않는 페이지예요.
      </p>
    </section>
  );
}
