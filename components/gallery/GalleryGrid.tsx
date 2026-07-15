"use client";

import Image from "next/image";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import { useLightboxStore } from "@/store/useLightboxStore";
import type { GalleryPhoto } from "@/types/database";

export function GalleryGrid({ photos }: { photos: GalleryPhoto[] }) {
  const { isOpen, index, images, open, close, setIndex } = useLightboxStore();
  const urls = photos.map((p) => p.image_url);

  return (
    <>
      <div className="mt-10 grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
        {photos.map((photo, i) => (
          <button
            key={photo.id}
            onClick={() => open(urls, i)}
            className="relative aspect-square overflow-hidden bg-muted"
          >
            <Image
              src={photo.thumbnail_url ?? photo.image_url}
              alt=""
              fill
              className="object-cover transition-transform hover:scale-105"
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
