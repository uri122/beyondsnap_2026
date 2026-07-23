import { UPLOAD_CACHE_CONTROL } from "@/lib/r2/constants";

// 업로드용 리사이즈: "가로(너비)"가 maxWidth를 넘을 때만 축소합니다 (세로 스크롤 갤러리라
// 화면에 걸리는 건 너비 기준이라, 세로로 긴 사진이어도 너비만 기준으로 판단해요).
export async function resizeImageFile(
  file: File,
  maxWidth: number,
  quality: number,
): Promise<{ file: File; width: number; height: number }> {
  const bitmap = await createImageBitmap(file);
  const originalWidth = bitmap.width;
  const originalHeight = bitmap.height;

  // GIF는 리사이즈하면 애니메이션이 깨지고, 이미 기준 너비 이하면 업스케일하지 않고 원본 그대로 사용
  if (file.type === "image/gif" || originalWidth <= maxWidth) {
    bitmap.close();
    return { file, width: originalWidth, height: originalHeight };
  }

  const scale = maxWidth / originalWidth;
  const width = maxWidth;
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

  // JPEG 대신 WebP로 인코딩 — 같은 화질 체감에서 20~35% 더 작아요.
  const blob: Blob | null = await new Promise((resolve) =>
    canvas.toBlob(resolve, "image/webp", quality),
  );
  if (!blob) return { file, width: originalWidth, height: originalHeight };

  const newName = file.name.replace(/\.\w+$/, "") + ".webp";
  const resizedFile = new File([blob], newName, { type: "image/webp" });
  return { file: resizedFile, width, height };
}

// 등록 화면 미리보기 전용 "작은" 썸네일 생성 (원본 그대로 <img>에 물리면 고해상도 사진
// 수십 장을 브라우저가 전부 디코딩해야 해서 화면이 버벅여요. 실제로 표시되는 크기에 맞는
// 작은 비트맵을 미리 만들어두면 디코딩 비용이 크게 줄어요).
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
      canvas.toBlob(resolve, "image/jpeg", 0.6),
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
