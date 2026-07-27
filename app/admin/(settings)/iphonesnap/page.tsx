import Link from "next/link";
import { getAllGalleries } from "@/lib/data/galleries";
import { GalleryList } from "@/components/admin/GalleryList";

export const dynamic = "force-dynamic";

export default async function AdminIphoneSnapPage() {
  const galleries = await getAllGalleries("iphone");

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold">아이폰스냅 관리</h1>
        <Link
          href="/admin/iphonesnap/new"
          className="rounded-md bg-primary px-4 py-2 font-medium text-primary-foreground"
        >
          새 글 등록
        </Link>
      </div>

      <GalleryList galleries={galleries} />
    </div>
  );
}
