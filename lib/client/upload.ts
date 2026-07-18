// 브라우저에서만 도는 유틸: 업로드 전 리사이즈 + 미리보기 썸네일 생성 + R2로 직접 PUT(진행률 포함)

// 업로드용 리사이즈: "가로(너비)"가 maxWidth를 넘을 때만 축소합니다 (세로 스크롤 갤러리라
// 화면에 걸리는 건 너비 기준이라, 세로로 긴 사진이어도 너비만 기준으로 판단해요).
export async function resizeImageFile(
  file: File,
  maxWidth: number,
  quality: number
): Promise<File> {
  if (file.type === "image/gif") return file; // 애니메이션 깨짐 방지

  const bitmap = await createImageBitmap(file);

  if (bitmap.width <= maxWidth) {
    bitmap.close();
    return file; // 이미 기준 이하면 그대로 사용 (업스케일 안 함)
  }

  const scale = maxWidth / bitmap.width;
  const width = maxWidth;
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    bitmap.close();
    return file;
  }

  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const blob: Blob | null = await new Promise((resolve) =>
    canvas.toBlob(resolve, "image/jpeg", quality)
  );
  if (!blob) return file;

  const newName = file.name.replace(/\.\w+$/, "") + ".jpg";
  return new File([blob], newName, { type: "image/jpeg" });
}

// 등록 화면 미리보기 전용 "작은" 썸네일 생성 (원본 그대로 <img>에 물리면 고해상도 사진
// 수십 장을 브라우저가 전부 디코딩해야 해서 화면이 버벅여요. 실제로 표시되는 크기에 맞는
// 작은 비트맵을 미리 만들어두면 디코딩 비용이 크게 줄어요).
export async function createPreviewThumbnail(file: File, maxDim = 320): Promise<string> {
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
      canvas.toBlob(resolve, "image/jpeg", 0.6)
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
  onProgress: (percent: number) => void
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", uploadUrl);
    xhr.setRequestHeader("Content-Type", file.type);

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) resolve();
      else reject(new Error(`업로드 실패 (${xhr.status})`));
    };
    xhr.onerror = () => reject(new Error("네트워크 오류로 업로드에 실패했어요."));

    xhr.send(file);
  });
}

// 동시 실행 개수를 제한하면서 작업을 처리 (사진 50장을 한 번에 쏘지 않도록)
export async function runWithConcurrency<T>(
  items: T[],
  concurrency: number,
  worker: (item: T, index: number) => Promise<void>
) {
  let cursor = 0;
  async function next(): Promise<void> {
    const index = cursor++;
    if (index >= items.length) return;
    await worker(items[index], index);
    return next();
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, () => next()));
}