import { create } from "zustand";

// 관리자 화면에서 여러 장의 사진을 업로드할 때 진행 상태를 추적
export type UploadItem = {
  id: string;
  file: File;
  progress: number; // 0-100
  status: "pending" | "uploading" | "done" | "error";
};

type UploadQueueState = {
  items: UploadItem[];
  addFiles: (files: File[]) => void;
  updateProgress: (id: string, progress: number) => void;
  setStatus: (id: string, status: UploadItem["status"]) => void;
  clear: () => void;
};

export const useUploadQueueStore = create<UploadQueueState>((set) => ({
  items: [],
  addFiles: (files) =>
    set((state) => ({
      items: [
        ...state.items,
        ...files.map((file) => ({
          id: crypto.randomUUID(),
          file,
          progress: 0,
          status: "pending" as const,
        })),
      ],
    })),
  updateProgress: (id, progress) =>
    set((state) => ({
      items: state.items.map((item) => (item.id === id ? { ...item, progress } : item)),
    })),
  setStatus: (id, status) =>
    set((state) => ({
      items: state.items.map((item) => (item.id === id ? { ...item, status } : item)),
    })),
  clear: () => set({ items: [] }),
}));
