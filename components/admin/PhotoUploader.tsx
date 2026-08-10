"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createUploadUrl, confirmPhotoUpload } from "@/app/actions/photos";
import {
  resizeImageFile,
  createCroppedThumbnail,
  uploadFileDirect,
  runWithConcurrency,
} from "@/lib/client/upload";
import { useUploadQueueStore } from "@/store/useUploadQueueStore";
import { PhotoDropzone } from "@/components/admin/PhotoDropzone";
import {
  GALLERY_PHOTO_MAX_DIMENSION,
  GALLERY_PHOTO_QUALITY,
  GALLERY_PHOTO_MAX_FILE_SIZE_MB,
  GALLERY_PHOTO_UPLOAD_CONCURRENCY,
  GALLERY_PHOTO_UPLOAD_HINT,
  GALLERY_THUMBNAIL_ASPECT,
  GALLERY_THUMBNAIL_WIDTH,
  GALLERY_THUMBNAIL_QUALITY,
} from "@/lib/upload-config";

export function PhotoUploader({
  galleryId,
  existingCount,
}: {
  galleryId: string;
  existingCount: number;
}) {
  const router = useRouter();
  const [rejectedNames, setRejectedNames] = useState<string[]>([]);
  const { items, addFiles, updateProgress, setStatus, clear } =
    useUploadQueueStore();

  const isUploading = items.length > 0;

  const handleFiles = async (fileList: FileList) => {
    const files = Array.from(fileList);
    const validFiles: File[] = [];
    const rejected: string[] = [];

    for (const file of files) {
      const isImage = file.type.startsWith("image/");
      const isUnderLimit =
        file.size <= GALLERY_PHOTO_MAX_FILE_SIZE_MB * 1024 * 1024;
      if (isImage && isUnderLimit) validFiles.push(file);
      else rejected.push(file.name);
    }
    setRejectedNames(rejected);
    if (validFiles.length === 0) return;

    addFiles(validFiles);
    const queued = useUploadQueueStore
      .getState()
      .items.slice(-validFiles.length);

    await runWithConcurrency(
      queued,
      GALLERY_PHOTO_UPLOAD_CONCURRENCY,
      async (item, index) => {
        setStatus(item.id, "uploading");

        const {
          file: fileToSend,
          width,
          height,
        } = await resizeImageFile(
          item.file,
          GALLERY_PHOTO_MAX_DIMENSION,
          GALLERY_PHOTO_QUALITY,
        );

        let thumbFile: File | null = null;
        try {
          thumbFile = await createCroppedThumbnail(
            item.file,
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
        if (!urlResult.success) {
          setStatus(item.id, "error");
          return;
        }

        let thumbnailUrl: string | undefined;
        if (thumbFile) {
          const thumbUrlResult = await createUploadUrl({
            galleryId,
            fileName: thumbFile.name,
            contentType: thumbFile.type,
          });
          if (thumbUrlResult.success) {
            try {
              await uploadFileDirect(
                thumbFile,
                thumbUrlResult.uploadUrl,
                () => {},
              );
              thumbnailUrl = thumbUrlResult.publicUrl;
            } catch {
              // 무시
            }
          }
        }

        try {
          await uploadFileDirect(fileToSend, urlResult.uploadUrl, (percent) =>
            updateProgress(item.id, percent),
          );
        } catch {
          setStatus(item.id, "error");
          return;
        }

        const confirmResult = await confirmPhotoUpload({
          galleryId,
          imageUrl: urlResult.publicUrl,
          thumbnailUrl,
          sortOrder: existingCount + index,
          width,
          height,
        });

        setStatus(item.id, confirmResult.success ? "done" : "error");
      },
    );

    const failed = useUploadQueueStore
      .getState()
      .items.filter((i) => i.status === "error");
    if (failed.length > 0) {
      alert(`${failed.length}개 파일 업로드에 실패했어요. 다시 시도해주세요.`);
    }

    clear();
    router.refresh();
  };

  return (
    <div>
      <p className="mb-3 text-xs text-muted-foreground">
        {GALLERY_PHOTO_UPLOAD_HINT}
      </p>

      <PhotoDropzone onFiles={handleFiles} disabled={isUploading} />

      {rejectedNames.length > 0 && (
        <p className="mt-2 text-sm text-red-500">
          다음 파일은 제외됐어요 (이미지 파일 {GALLERY_PHOTO_MAX_FILE_SIZE_MB}MB
          이하만 가능): {rejectedNames.join(", ")}
        </p>
      )}

      {items.length > 0 && (
        <p className="mt-2 text-sm text-muted-foreground">
          {items.filter((i) => i.status === "done").length}/{items.length}장
          업로드 중...
        </p>
      )}
    </div>
  );
}
