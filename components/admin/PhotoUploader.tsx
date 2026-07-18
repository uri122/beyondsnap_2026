"use client";

import { useRouter } from "next/navigation";
import { createUploadUrl, confirmPhotoUpload } from "@/app/actions/photos";
import { resizeImageFile, uploadFileDirect, runWithConcurrency } from "@/lib/client/upload";
import { useUploadQueueStore } from "@/store/useUploadQueueStore";

const RESIZE_MAX_WIDTH = 1600;
const RESIZE_QUALITY = 0.9;
const UPLOAD_CONCURRENCY = 4;

export function PhotoUploader({
  galleryId,
  existingCount,
}: {
  galleryId: string;
  existingCount: number;
}) {
  const router = useRouter();
  const { items, addFiles, updateProgress, setStatus, clear } = useUploadQueueStore();

  const handleFiles = async (fileList: FileList | null) => {
    if (!fileList) return;
    const files = Array.from(fileList);
    addFiles(files);
    const queued = useUploadQueueStore.getState().items.slice(-files.length);

    await runWithConcurrency(queued, UPLOAD_CONCURRENCY, async (item, index) => {
      setStatus(item.id, "uploading");

      const fileToSend = await resizeImageFile(item.file, RESIZE_MAX_WIDTH, RESIZE_QUALITY);

      const urlResult = await createUploadUrl({
        galleryId,
        fileName: fileToSend.name,
        contentType: fileToSend.type,
      });
      if (!urlResult.success) {
        setStatus(item.id, "error");
        return;
      }

      try {
        await uploadFileDirect(fileToSend, urlResult.uploadUrl, (percent) =>
          updateProgress(item.id, percent)
        );
      } catch {
        setStatus(item.id, "error");
        return;
      }

      const confirmResult = await confirmPhotoUpload({
        galleryId,
        imageUrl: urlResult.publicUrl,
        sortOrder: existingCount + index,
      });

      setStatus(item.id, confirmResult.success ? "done" : "error");
    });

    const failed = useUploadQueueStore.getState().items.filter((i) => i.status === "error");
    if (failed.length > 0) {
      alert(`${failed.length}개 파일 업로드에 실패했어요. 다시 시도해주세요.`);
    }

    clear();
    router.refresh();
  };

  return (
    <div>
      <input
        type="file"
        accept="image/*"
        multiple
        onChange={(e) => handleFiles(e.target.files)}
        className="text-sm"
      />
      {items.length > 0 && (
        <p className="mt-2 text-sm text-muted-foreground">
          {items.filter((i) => i.status === "done").length}/{items.length}장 업로드 중...
        </p>
      )}
    </div>
  );
}