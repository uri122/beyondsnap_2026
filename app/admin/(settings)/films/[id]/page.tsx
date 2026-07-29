import Link from "next/link";
import { notFound } from "next/navigation";
import { getFilmById } from "@/lib/data/films";
import { EditFilmForm } from "@/components/admin/EditFilmForm";

export default async function AdminFilmDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const film = await getFilmById(id);
  if (!film) notFound();

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-2">
        <Link
          href="/admin/films"
          className="text-sm text-muted-foreground hover:underline"
        >
          필름 관리
        </Link>
        <span className="text-sm text-muted-foreground">/</span>
        <span className="text-sm">글 수정</span>
      </div>

      <div>
        <h1 className="font-serif text-2xl">{film.venue}</h1>
        <p className="text-muted-foreground">{film.title}</p>
      </div>

      <EditFilmForm film={film} />
    </div>
  );
}
