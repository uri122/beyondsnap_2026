import Link from "next/link";
import { FilmComposer } from "@/components/admin/FilmComposer";

export default function NewFilmPage() {
  return (
    <div>
      <div className="flex items-center gap-2">
        <Link
          href="/admin/films"
          className="text-sm text-muted-foreground hover:underline"
        >
          필름 관리
        </Link>
        <span className="text-sm text-muted-foreground">/</span>
        <span className="text-sm">새 영상 등록</span>
      </div>
      <h1 className="mt-2 font-serif text-2xl">새 영상 등록</h1>

      <div className="mt-8">
        <FilmComposer />
      </div>
    </div>
  );
}
