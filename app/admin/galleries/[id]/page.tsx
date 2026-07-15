import { notFound } from "next/navigation";
import { getGalleryById, getGalleryPhotos } from "@/lib/data/galleries";
import { PhotoUploader } from "@/components/admin/PhotoUploader";
import { PublishToggle } from "@/components/admin/PublishToggle";

export default async function AdminGalleryDetailPage({ params }: { params: { id: string } }) {
  const gallery = await getGalleryById(params.id);
  if (!gallery) notFound();

  const photos = await getGalleryPhotos(gallery.id);

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl">{gallery.venue}</h1>
          <p className="text-muted-foreground">{gallery.title}</p>
        </div>
        <PublishToggle galleryId={gallery.id} published={gallery.published} />
      </div>

      <div className="mt-10 rounded-lg border border-border p-6">
        <h2 className="font-medium">사진 업로드</h2>
        <div className="mt-4">
          <PhotoUploader galleryId={gallery.id} existingCount={photos.length} />
        </div>
      </div>

      <div className="mt-8 grid grid-cols-3 gap-3 md:grid-cols-5">
        {photos.map((p) => (
          <div key={p.id} className="relative aspect-square overflow-hidden rounded bg-muted">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={p.thumbnail_url ?? p.image_url} alt="" className="h-full w-full object-cover" />
          </div>
        ))}
      </div>
    </div>
  );
}
