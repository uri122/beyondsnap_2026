import { GalleryPhotoImage } from "@/components/gallery/GalleryPhotoImage";
import type { GalleryPhoto } from "@/types/database";

export function GalleryScroll({
  photos,
  altText = "",
}: {
  photos: GalleryPhoto[];
  altText?: string;
}) {
  return (
    <div className="mx-auto mt-10 flex max-w-[900px] flex-col items-center gap-10 sm:mt-16 sm:gap-24 lg:gap-28 3xl:max-w-[900px] 4xl:max-w-[1100px] 5xl:max-w-[1300px]">
      {photos.map((photo, i) => (
        <GalleryPhotoImage
          key={photo.id}
          src={photo.image_url}
          alt={altText ? `${altText} 사진 ${i + 1}` : ""}
          loading={i < 2 ? "eager" : "lazy"}
          width={photo.width}
          height={photo.height}
        />
      ))}
    </div>
  );
}
