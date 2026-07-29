import Link from "next/link";
import { notFound } from "next/navigation";
import { getGalleryById, getGalleryPhotos } from "@/lib/data/galleries";
import { PhotoUploader } from "@/components/admin/PhotoUploader";
import { PhotoGrid } from "@/components/admin/PhotoGrid";
import { GalleryEditForm } from "@/components/admin/GalleryEditForm";

export const dynamic = "force-dynamic"; // 관리자 페이지는 항상 최신 데이터로

export default async function AdminGalleryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const gallery = await getGalleryById(id);
  if (!gallery) notFound();

  const photos = await getGalleryPhotos(gallery.id);

  const isDslr = gallery.snap_type === "dslr";
  const listPath = isDslr ? "/admin/galleries" : "/admin/iphonesnap";

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-2">
        <Link
          href={listPath}
          className="text-sm text-muted-foreground hover:underline"
        >
          {isDslr ? "Ceremony" : "아이폰스냅"} 관리
        </Link>
        <span className="text-sm text-muted-foreground">/</span>
        <span className="text-sm">글 수정</span>
      </div>

      <div>
        <h1 className="font-serif text-2xl">{gallery.venue}</h1>
        <p className="text-muted-foreground">{gallery.title}</p>
      </div>

      <GalleryEditForm gallery={gallery} />

      <div className="rounded-lg border border-border p-6">
        <h2 className="font-medium">사진 업로드</h2>
        <div className="mt-4">
          <PhotoUploader galleryId={gallery.id} existingCount={photos.length} />
        </div>
      </div>

      <PhotoGrid
        galleryId={gallery.id}
        photos={photos}
        coverImageUrl={gallery.cover_image_url}
      />
    </div>
  );
}
