"use client";

import { useState } from "react";
import Image from "next/image";

// 화면 크기별 최대 표시 크기. 3xl(FHD)/4xl(QHD)/5xl(4K·UHD)는 tailwind.config.ts 브레이크포인트.
const SIZE_CLASSES =
  "sm:max-w-[900px] sm:max-h-[900px] " +
  "4xl:max-w-[1100px] 4xl:max-h-[1100px] " +
  "5xl:max-w-[1300px] 5xl:max-h-[1300px] ";

const IMAGE_SIZES =
  "(max-width: 640px) 100vw, (max-width: 1920px) 900px, (max-width: 2560px) 1100px, (max-width: 3840px) 1300px, 1300px";

type GalleryPhotoImageProps = {
  src: string;
  alt: string;
  loading?: "eager" | "lazy";
  width?: number | null;
  height?: number | null;
};

export function GalleryPhotoImage({
  src,
  alt,
  loading,
  width,
  height,
}: GalleryPhotoImageProps) {
  const [loaded, setLoaded] = useState(false);
  const opacityClass = loaded ? "opacity-100" : "opacity-0";

  // fill + 정확한 aspect-ratio로 박스를 잡고, next/image가 그 박스를 그대로 채움
  return (
    <span
      className={`relative mx-auto block w-full ${SIZE_CLASSES}`}
      style={{ aspectRatio: `${width} / ${height}` }}
    >
      <Image
        src={src}
        alt={alt}
        fill
        loading={loading}
        sizes={IMAGE_SIZES}
        quality={100}
        className={`object-contain transition-opacity duration-500 ease-out ${opacityClass}`}
        onLoad={() => setLoaded(true)}
      />
    </span>
  );
}
