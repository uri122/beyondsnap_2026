import { create } from "zustand";

// 갤러리 라이트박스 열림/닫힘, 현재 인덱스 같은 순수 UI 상태 관리
// 서버 데이터는 react-query가 담당하고, 여긴 "화면 상태"만 다룹니다.
type LightboxState = {
  isOpen: boolean;
  index: number;
  images: string[];
  open: (images: string[], index?: number) => void;
  close: () => void;
  setIndex: (index: number) => void;
};

export const useLightboxStore = create<LightboxState>((set) => ({
  isOpen: false,
  index: 0,
  images: [],
  open: (images, index = 0) => set({ isOpen: true, images, index }),
  close: () => set({ isOpen: false }),
  setIndex: (index) => set({ index }),
}));
