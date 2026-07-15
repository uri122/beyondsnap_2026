"use client";

import { useRouter } from "next/navigation";
import { uploadGalleryPhoto } from "@/app/actions/photos";
import { useUploadQueueStore } from "@/store/useUploadQueueStore";

export function PhotoUploader({
  galleryId,
  existingCount,
}: {
  galleryId: string;
  existingCount: number;
}) {
  const router = useRouter();
  const { items, addFiles, clear } = useUploadQueueStore();

  const handleFiles = async (fileList: FileList | null) => {
    if (!fileList) return;
    const files = Array.from(fileList);
    addFiles(files);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const formData = new FormData();
      formData.append("file", file);
      formData.append("galleryId", galleryId);
      formData.append("sortOrder", String(existingCount + i));

      // R2 업로드 + gallery_photos row 생성까지 서버 액션 하나로 처리
      // (R2 자격증명은 서버에만 있고 브라우저로 노출되지 않음)
      const result = await uploadGalleryPhoto(formData);
      if (!result.success) {
        alert(result.error);
        break;
      }
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
        <p className="mt-2 text-sm text-muted-foreground">{items.length}장 업로드 중...</p>
      )}
    </div>
  );
}
