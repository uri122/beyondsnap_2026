import { UPLOAD_CACHE_CONTROL } from "@/lib/r2/constants";

export async function resizeImageFile(
  file: File,
  maxDimension: number,
  quality: number,
): Promise<{ file: File; width: number; height: number }> {
  const bitmap = await createImageBitmap(file);
  const originalWidth = bitmap.width;
  const originalHeight = bitmap.height;

  const longerSide = Math.max(originalWidth, originalHeight);
  const scale = longerSide > maxDimension ? maxDimension / longerSide : 1;
  const width = Math.round(originalWidth * scale);
  const height = Math.round(originalHeight * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    bitmap.close();
    return { file, width: originalWidth, height: originalHeight };
  }

  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  // 같은 화질 체감에서 20~35% 더 작은 WebP로 인코딩
  const blob: Blob | null = await new Promise((resolve) =>
    canvas.toBlob(resolve, "image/webp", quality),
  );
  if (!blob) return { file, width: originalWidth, height: originalHeight };

  const newName = file.name.replace(/\.\w+$/, "") + ".webp";
  const resizedFile = new File([blob], newName, { type: "image/webp" });
  return { file: resizedFile, width, height };
}

// 원본을 targetAspect 비율로 센터크롭한 뒤 targetWidth 폭으로 인코딩.
// 리스트 그리드처럼 항상 같은 비율 박스에 object-cover로 들어가는 이미지 전용.
export async function createCroppedThumbnail(
  file: File,
  targetAspect: number,
  targetWidth: number,
  quality: number,
): Promise<File> {
  const bitmap = await createImageBitmap(file);
  const originalWidth = bitmap.width;
  const originalHeight = bitmap.height;
  const originalAspect = originalWidth / originalHeight;

  let sx = 0;
  let sy = 0;
  let sWidth = originalWidth;
  let sHeight = originalHeight;

  if (originalAspect > targetAspect) {
    sWidth = originalHeight * targetAspect;
    sx = (originalWidth - sWidth) / 2;
  } else {
    sHeight = originalWidth / targetAspect;
    sy = (originalHeight - sHeight) / 2;
  }

  const targetHeight = Math.round(targetWidth / targetAspect);
  const canvas = document.createElement("canvas");
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    bitmap.close();
    throw new Error("캔버스를 생성할 수 없습니다.");
  }

  ctx.drawImage(
    bitmap,
    sx,
    sy,
    sWidth,
    sHeight,
    0,
    0,
    targetWidth,
    targetHeight,
  );
  bitmap.close();

  const blob: Blob | null = await new Promise((resolve) =>
    canvas.toBlob(resolve, "image/webp", quality),
  );
  if (!blob) throw new Error("썸네일 생성에 실패했습니다.");

  const newName = file.name.replace(/\.\w+$/, "") + "-thumb.webp";
  return new File([blob], newName, { type: "image/webp" });
}

// 등록 화면 미리보기 전용 "작은" 썸네일 생성
export async function createPreviewThumbnail(
  file: File,
  maxDim = 320,
): Promise<string> {
  try {
    const bitmap = await createImageBitmap(file, {
      resizeWidth: maxDim,
      resizeQuality: "low",
    });
    const canvas = document.createElement("canvas");
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      bitmap.close();
      return URL.createObjectURL(file);
    }
    ctx.drawImage(bitmap, 0, 0);
    bitmap.close();

    const blob: Blob | null = await new Promise((resolve) =>
      canvas.toBlob(resolve, "image/webp", 0.6),
    );
    return blob ? URL.createObjectURL(blob) : URL.createObjectURL(file);
  } catch {
    // 브라우저가 resize 옵션을 지원 안 하면 원본으로 폴백
    return URL.createObjectURL(file);
  }
}

export function uploadFileDirect(
  file: File,
  uploadUrl: string,
  onProgress: (percent: number) => void,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", uploadUrl);
    xhr.setRequestHeader("Content-Type", file.type);
    xhr.setRequestHeader("Cache-Control", UPLOAD_CACHE_CONTROL); // 추가

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable)
        onProgress(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) resolve();
      else reject(new Error(`업로드 실패 (${xhr.status})`));
    };
    xhr.onerror = () =>
      reject(new Error("네트워크 오류로 업로드에 실패했어요."));

    xhr.send(file);
  });
}

// 동시 실행 개수를 제한하면서 작업을 처리 (사진 50장을 한 번에 쏘지 않도록)
export async function runWithConcurrency<T>(
  items: T[],
  concurrency: number,
  worker: (item: T, index: number) => Promise<void>,
) {
  let cursor = 0;
  async function next(): Promise<void> {
    const index = cursor++;
    if (index >= items.length) return;
    await worker(items[index], index);
    return next();
  }
  await Promise.all(
    Array.from({ length: Math.min(concurrency, items.length) }, () => next()),
  );
}
