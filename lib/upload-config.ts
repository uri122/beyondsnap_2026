export const GALLERY_PHOTO_MAX_WIDTH = 1500;
export const GALLERY_PHOTO_QUALITY = 0.85;
export const GALLERY_PHOTO_MAX_FILE_SIZE_MB = 2;
export const GALLERY_PHOTO_UPLOAD_CONCURRENCY = 4;

export const GALLERY_PHOTO_UPLOAD_HINT =
  `권장 규격: 장변 ${GALLERY_PHOTO_MAX_WIDTH}px 추천 · JPG 또는 PNG · 장당 ${GALLERY_PHOTO_MAX_FILE_SIZE_MB}MB 이하. ` +
  `트래픽/용량 절약을 위해 가로 ${GALLERY_PHOTO_MAX_WIDTH}px이 넘는 사진은 업로드 시 자동으로 축소.`;
