"use client";

import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import { useLightboxStore } from "@/store/useLightboxStore";
import type { GalleryPhoto } from "@/types/database";

export function GalleryScroll({
  photos,
  altText = "",
}: {
  photos: GalleryPhoto[];
  altText?: string;
}) {
  const { isOpen, index, images, open, close, setIndex } = useLightboxStore();
  const urls = photos.map((p) => p.image_url);

  return (
    <>
      <div className="mx-auto mt-10 flex max-w-[900px] flex-col items-center gap-10 sm:mt-16 sm:gap-24 lg:gap-28">
        {photos.map((photo, i) => (
          <button
            key={photo.id}
            type="button"
            onClick={() => open(urls, i)}
            className="block w-full cursor-zoom-in"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photo.image_url}
              alt={altText ? `${altText} 사진 ${i + 1}` : ""}
              loading={i < 2 ? "eager" : "lazy"}
              decoding="async"
              className="mx-auto h-auto w-full max-w-[900px] object-contain sm:max-h-[900px] sm:w-auto"
            />
          </button>
        ))}
      </div>

      <Lightbox
        open={isOpen}
        close={close}
        index={index}
        slides={images.map((src) => ({ src }))}
        on={{ view: ({ index }) => setIndex(index) }}
      />
    </>
  );
}