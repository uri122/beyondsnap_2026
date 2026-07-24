import { notFound } from "next/navigation";
import { getFilmById } from "@/lib/data/films";
import { EditFilmForm } from "@/components/admin/EditFilmForm";

export default async function AdminFilmDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const film = await getFilmById(params.id);
  if (!film) notFound();

  return (
    <div>
      <h1 className="font-serif text-2xl">영상 수정</h1>

      <div className="mt-8 max-w-2xl rounded-lg border border-border p-6">
        <EditFilmForm film={film} />
      </div>
    </div>
  );
}
