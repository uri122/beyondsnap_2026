import { createUploadUrl, confirmPhotoUpload } from "@/app/actions/photos";
import {
  resizeImageFile,
  createCroppedThumbnail,
  uploadFileDirect,
} from "@/lib/client/upload";
import {
  GALLERY_PHOTO_MAX_DIMENSION,
  GALLERY_PHOTO_QUALITY,
  GALLERY_THUMBNAIL_ASPECT,
  GALLERY_THUMBNAIL_WIDTH,
  GALLERY_THUMBNAIL_QUALITY,
} from "@/lib/upload-config";

export type UploadGalleryPhotoParams = {
  galleryId: string;
  file: File;
  sortOrder: number;
  onProgress?: (percent: number) => void;
};

export type UploadGalleryPhotoResult =
  | {
      success: true;
      imageUrl: string;
      thumbnailUrl?: string;
      width: number;
      height: number;
    }
  | { success: false };

// 갤러리 사진 1장을 등록하는 전체 파이프라인:
// 원본 리사이즈 → (실패해도 무시되는) 크롭 썸네일 생성 → 원본/썸네일 각각
// presigned URL 발급 → R2 직접 업로드 → DB에 메타데이터 confirm.
//
// GalleryComposer(신규 등록, 로컬 state)와 PhotoUploader(기존 글 추가, zustand store)가
// 상태 관리 방식만 다르고 이 파이프라인 자체는 100% 동일해서 여기로 뺐습니다.
// 상태 업데이트는 onProgress 콜백으로만 밖으로 흘려보내고, 이 함수 자체는
// React 상태를 전혀 갖지 않는 순수 비동기 함수입니다 (그래서 "훅"이 아닙니다).
export async function uploadGalleryPhoto({
  galleryId,
  file,
  sortOrder,
  onProgress,
}: UploadGalleryPhotoParams): Promise<UploadGalleryPhotoResult> {
  const {
    file: fileToSend,
    width,
    height,
  } = await resizeImageFile(file, GALLERY_PHOTO_MAX_DIMENSION, GALLERY_PHOTO_QUALITY);

  // 리스트용 크롭 썸네일 준비 (실패해도 원본 업로드는 계속 진행)
  let thumbFile: File | null = null;
  try {
    thumbFile = await createCroppedThumbnail(
      file,
      GALLERY_THUMBNAIL_ASPECT,
      GALLERY_THUMBNAIL_WIDTH,
      GALLERY_THUMBNAIL_QUALITY,
    );
  } catch {
    // 무시하고 원본으로 폴백
  }

  const urlResult = await createUploadUrl({
    galleryId,
    fileName: fileToSend.name,
    contentType: fileToSend.type,
  });
  if (!urlResult.success) return { success: false };

  let thumbnailUrl: string | undefined;
  if (thumbFile) {
    const thumbUrlResult = await createUploadUrl({
      galleryId,
      fileName: thumbFile.name,
      contentType: thumbFile.type,
    });
    if (thumbUrlResult.success) {
      try {
        await uploadFileDirect(thumbFile, thumbUrlResult.uploadUrl, () => {});
        thumbnailUrl = thumbUrlResult.publicUrl;
      } catch {
        // 무시 (썸네일 없이 원본으로 폴백)
      }
    }
  }

  try {
    await uploadFileDirect(fileToSend, urlResult.uploadUrl, (percent) =>
      onProgress?.(percent),
    );
  } catch {
    return { success: false };
  }

  const confirmResult = await confirmPhotoUpload({
    galleryId,
    imageUrl: urlResult.publicUrl,
    thumbnailUrl,
    sortOrder,
    width,
    height,
  });
  if (!confirmResult.success) return { success: false };

  return {
    success: true,
    imageUrl: urlResult.publicUrl,
    thumbnailUrl,
    width,
    height,
  };
}
