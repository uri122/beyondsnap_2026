"use client";

import { useRef, useState } from "react";
import { UploadCloud } from "lucide-react";

type PhotoDropzoneProps = {
  onFiles: (files: FileList) => void;
  disabled?: boolean;
  primaryText?: string;
  secondaryText?: string;
};

// "새 글 등록"과 "기존 글 사진 추가" 화면이 같은 드래그앤드롭 UI를 쓰도록 뺀 공통 컴포넌트.
export function PhotoDropzone({
  onFiles,
  disabled = false,
  primaryText = "사진을 여기로 드래그하거나 클릭해서 선택하세요",
  secondaryText = "여러 장 한 번에 선택 가능",
}: PhotoDropzoneProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  function openFilePicker() {
    if (disabled) return;
    fileInputRef.current?.click();
  }

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        if (!disabled) setIsDragOver(true);
      }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragOver(false);
        if (disabled) return;
        if (e.dataTransfer.files.length > 0) onFiles(e.dataTransfer.files);
      }}
      onClick={openFilePicker}
      onKeyDown={(e) => {
        if ((e.key === "Enter" || e.key === " ") && !disabled) {
          e.preventDefault();
          openFilePicker();
        }
      }}
      role="button"
      tabIndex={0}
      aria-disabled={disabled}
      aria-label={`${primaryText}. ${secondaryText}`}
      className={`flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-6 py-8 text-center transition-colors ${
        disabled
          ? "pointer-events-none cursor-not-allowed border-border opacity-60"
          : "cursor-pointer hover:bg-muted/50"
      } ${isDragOver ? "border-primary bg-primary/5" : "border-border"}`}
    >
      <UploadCloud
        size={22}
        className="text-muted-foreground"
        aria-hidden="true"
      />
      <p className="text-sm font-medium">{primaryText}</p>
      <p className="text-xs text-muted-foreground">{secondaryText}</p>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0)
            onFiles(e.target.files);
          e.target.value = ""; // 같은 파일을 다시 선택해도 onChange가 다시 발생하도록 초기화
        }}
        className="hidden"
      />
    </div>
  );
}
