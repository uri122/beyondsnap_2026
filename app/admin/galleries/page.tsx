import Link from "next/link";
import { getAllGalleries } from "@/lib/data/galleries";
import { GalleryList } from "@/components/admin/GalleryList";

export const dynamic = "force-dynamic"; // 관리자 페이지는 항상 최신 데이터로

export default async function AdminGalleriesPage() {
  const galleries = await getAllGalleries();

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-2xl">갤러리 관리</h1>
        <Link
          href="/admin/galleries/new"
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
        >
          새 갤러리 등록
        </Link>
      </div>

      <GalleryList galleries={galleries} />
    </div>
  );
}