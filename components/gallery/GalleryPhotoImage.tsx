"use client";

import { useState } from "react";
import Image from "next/image";

// width/height 정보가 없는 예전 사진(이번 최적화 이전에 업로드된 것)을 위한 임시 비율.
const PLACEHOLDER_ASPECT_RATIO = "3 / 4";

// 화면 크기별 최대 표시 크기. 3xl(FHD)/4xl(QHD)/5xl(4K·UHD)는 tailwind.config.ts 브레이크포인트.
const SIZE_CLASSES =
  "sm:max-w-[900px] sm:max-h-[900px] " +
  "4xl:max-w-[1050px] 4xl:max-h-[1050px] " +
  "5xl:max-w-[1150px] 5xl:max-h-[1150px] ";

const IMAGE_SIZES =
  "(max-width: 640px) 100vw, (max-width: 1920px) 900px, (max-width: 2560px) 1050px, (max-width: 3840px) 1150px, 1300px";

type GalleryPhotoImageProps = {
  src: string;
  alt: string;
  loading?: "eager" | "lazy";
  priority?: boolean;
  // DB에 저장된 실제 픽셀 크기. 예전 사진은 null일 수 있어요(마이그레이션 이전 업로드).
  width?: number | null;
  height?: number | null;
};

export function GalleryPhotoImage({
  src,
  alt,
  loading,
  priority,
  width,
  height,
}: GalleryPhotoImageProps) {
  const [loaded, setLoaded] = useState(false);
  const opacityClass = loaded ? "opacity-100" : "opacity-0";

  if (width && height) {
    // 실제 크기를 아는 신규 업로드 — fill + 정확한 aspect-ratio로 박스를 잡고,
    // next/image가 그 박스를 그대로 채우게 해요. 박스 크기를 따로 계산하지 않고
    // "박스 = 이미지"라서, 계산이 어긋나서 작게 나오는 문제가 구조적으로 생길 수 없어요.
    return (
      <span
        className={`relative mx-auto block w-full ${SIZE_CLASSES}`}
        style={{ aspectRatio: `${width} / ${height}` }}
      >
        <Image
          src={src}
          alt={alt}
          fill
          priority={priority}
          loading={priority ? undefined : loading}
          sizes={IMAGE_SIZES}
          quality={90}
          className={`object-contain transition-opacity duration-500 ease-out ${opacityClass}`}
          onLoad={() => setLoaded(true)}
        />
      </span>
    );
  }

  // width/height를 모르는 예전 사진 — 원래부터 900으로 잘 나오던 방식 그대로, 손 안 댐
  return (
    <span
      className={`relative mx-auto block w-full ${SIZE_CLASSES}`}
      style={{ aspectRatio: loaded ? "auto" : PLACEHOLDER_ASPECT_RATIO }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        loading={loading}
        decoding="async"
        onLoad={() => setLoaded(true)}
        className={`mx-auto h-auto w-full object-contain transition-opacity duration-500 ease-out sm:w-auto ${opacityClass} ${SIZE_CLASSES}`}
      />
    </span>
  );
}
