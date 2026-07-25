import Link from "next/link";
import { getAllFilms } from "@/lib/data/films";
import { FilmList } from "@/components/admin/FilmList";

export const dynamic = "force-dynamic";

export default async function AdminFilmsPage() {
  const films = await getAllFilms();

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold">Films 관리</h1>
        <Link
          href="/admin/films/new"
          className="rounded-md bg-primary px-4 py-2 font-medium text-primary-foreground"
        >
          새 영상 등록
        </Link>
      </div>

      <FilmList films={films} />
    </div>
  );
}
