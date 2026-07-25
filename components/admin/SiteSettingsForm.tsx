"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { updateSiteSettings } from "@/app/actions/settings";
import { uploadSiteImage } from "@/app/actions/site-image";
import { SITE_SETTING_FIELDS } from "@/lib/settings-fields";
import { resizeImageFile } from "@/lib/client/upload";

const HERO_IMAGE_KEY = "hero_image_url";

export function SiteSettingsForm({
  initialValues,
  initialHeroImageUrl,
}: {
  initialValues: Record<string, string>;
  initialHeroImageUrl?: string;
}) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [values, setValues] = useState<Record<string, string>>(initialValues);
  // heroFile: "저장"을 누르기 전까지는 아직 서버에 안 올라간, 선택만 해둔 파일
  const [heroFile, setHeroFile] = useState<File | null>(null);
  const [heroPreviewUrl, setHeroPreviewUrl] = useState<string | undefined>(
    initialHeroImageUrl,
  );
  const [loading, setLoading] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  const HERO_RESIZE_MAX_WIDTH = 2560; // QHD 기준
  const HERO_RESIZE_QUALITY = 0.85;

  // 로컬 미리보기용으로 만든 objectURL은 컴포넌트가 갱신/언마운트될 때 정리합니다.
  useEffect(() => {
    return () => {
      if (heroFile && heroPreviewUrl) URL.revokeObjectURL(heroPreviewUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [heroFile]);

  const handleChange = (key: string, value: string) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  };

  const handleFileSelect = (fileList: FileList | null) => {
    const file = fileList?.[0];
    if (!file) return;

    // 여기서는 업로드하지 않습니다. "저장" 버튼을 눌러야 실제로 반영됩니다.
    setHeroFile(file);
    setHeroPreviewUrl(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // 1) 새로 선택해둔 히어로 이미지가 있으면 리사이즈 후 업로드
    if (heroFile) {
      const { file: resizedHeroFile } = await resizeImageFile(
        heroFile,
        HERO_RESIZE_MAX_WIDTH,
        HERO_RESIZE_QUALITY,
      );

      const formData = new FormData();
      formData.append("file", resizedHeroFile);
      formData.append("settingKey", HERO_IMAGE_KEY);

      const imageResult = await uploadSiteImage(formData);
      if (!imageResult.success) {
        setLoading(false);
        alert(imageResult.error);
        return;
      }
      setHeroFile(null);
      setHeroPreviewUrl(imageResult.url);
    }

    // 2) 텍스트 설정값 저장
    const rows = SITE_SETTING_FIELDS.map((field) => ({
      key: field.key,
      value: values[field.key] ?? "",
    }));
    const textResult = await updateSiteSettings(rows);

    setLoading(false);

    if (!textResult.success) {
      alert(textResult.error);
      return;
    }

    setSavedAt(Date.now());
    router.refresh();

    setTimeout(() => {
      setSavedAt(null);
    }, 5000);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div>
        <p className="font-semibold text-neutral-700">메인 이미지</p>
        <p className="mt-2 text-xs leading-relaxed text-rose-600">
          가로 <b>2560px(QHD) 이상</b>의 사진을 등록해주세요.
        </p>

        {heroPreviewUrl && (
          <div className="relative mt-3 aspect-video w-full max-w-md overflow-hidden rounded-md bg-muted">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={heroPreviewUrl}
              alt="메인 이미지 미리보기"
              className="h-full w-full object-cover"
            />
          </div>
        )}

        <div className="mt-3 flex flex-wrap items-center gap-3">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={(e) => handleFileSelect(e.target.files)}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="rounded-md border border-border bg-background px-4 py-2 text-sm font-medium hover:bg-muted"
          >
            {heroPreviewUrl ? "이미지 교체" : "이미지 추가"}
          </button>

          {heroFile && (
            <span className="text-xs font-medium text-muted-foreground">
              새 이미지가 선택됐어요. 아래 "저장"을 눌러야 실제로 반영돼요.
            </span>
          )}
        </div>
      </div>

      <div className="border-t border-border" />

      {/* 텍스트 설정 */}
      {SITE_SETTING_FIELDS.map((field) => (
        <label key={field.key} className="font-semibold text-neutral-700">
          {field.label.split(/(\(.*?\))/).map((part, idx) => {
            const match = part.match(/^\((.*?)\)$/);
            if (match) {
              return (
                <span key={idx} className="text-xs text-blue-500">
                  * {match[1]}
                </span>
              );
            }
            return <span key={idx}>{part}</span>;
          })}
          {field.type === "textarea" ? (
            <textarea
              value={values[field.key] ?? ""}
              onChange={(e) => handleChange(field.key, e.target.value)}
              placeholder={field.placeholder}
              className="mt-1 min-h-24 w-full rounded-md border border-border px-3 py-2 font-normal"
            />
          ) : (
            <input
              value={values[field.key] ?? ""}
              onChange={(e) => handleChange(field.key, e.target.value)}
              placeholder={field.placeholder}
              className="mt-1 w-full rounded-md border border-border px-3 py-2 font-normal"
            />
          )}
        </label>
      ))}

      <div className="flex items-center gap-3 border-t border-border pt-5">
        <button
          type="submit"
          disabled={loading}
          className="self-start rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground disabled:opacity-50"
        >
          {loading ? "저장 중..." : "저장"}
        </button>
        {savedAt && !loading && (
          <span className="text-sm text-muted-foreground">저장되었습니다.</span>
        )}
      </div>
    </form>
  );
}
