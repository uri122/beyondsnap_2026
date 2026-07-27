import { notFound } from "next/navigation";
import { getGalleryById, getGalleryPhotos } from "@/lib/data/galleries";
import { PhotoUploader } from "@/components/admin/PhotoUploader";
import { PhotoGrid } from "@/components/admin/PhotoGrid";
import { GalleryEditForm } from "@/components/admin/GalleryEditForm";

export const dynamic = "force-dynamic";

export default async function AdminIphoneSnapDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const gallery = await getGalleryById(params.id);
  if (!gallery || gallery.snap_type !== "iphone") notFound();

  const photos = await getGalleryPhotos(gallery.id);

  return (
    <div className="space-y-8">
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
