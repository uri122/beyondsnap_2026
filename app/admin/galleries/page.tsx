import Link from "next/link";
import { getAllGalleries } from "@/lib/data/galleries";
import { NewGalleryForm } from "@/components/admin/NewGalleryForm";

export default async function AdminGalleriesPage() {
  const galleries = await getAllGalleries();

  return (
    <div>
      <h1 className="font-serif text-2xl">갤러리 관리</h1>

      <div className="mt-8 rounded-lg border border-border p-6">
        <h2 className="font-medium">새 갤러리 등록</h2>
        <div className="mt-4">
          <NewGalleryForm />
        </div>
      </div>

      <div className="mt-8 divide-y divide-border">
        {galleries.map((gallery) => (
          <Link
            key={gallery.id}
            href={`/admin/galleries/${gallery.id}`}
            className="flex items-center justify-between py-4 hover:bg-muted/50"
          >
            <div>
              <p className="font-medium">{gallery.venue}</p>
              <p className="text-sm text-muted-foreground">{gallery.title}</p>
            </div>
            <span className="text-sm text-muted-foreground">
              {gallery.published ? "공개" : "비공개"}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
