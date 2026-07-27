import type {
  Gallery,
  GalleryPhoto,
  ProductPackage,
  Faq,
} from "@/types/database";

export const mockGalleries: Gallery[] = [
  {
    id: "mock-gallery-1",
    title: "봄날의 기록",
    venue: "그랜드 하얏트 서울",
    venue_type: "bright",
    snap_type: "dslr",
    wedding_date: "2026-04-18",
    slug: "grand-hyatt-seoul-sample",
    cover_image_url:
      "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1200",
    description: "따뜻한 봄빛 아래 진행된 본식스냅",
    published: true,
    sort_order: 0,
    created_at: "2026-04-20T00:00:00Z",
  },
  {
    id: "mock-gallery-2",
    title: "가을의 온기",
    venue: "더채플앳청담",
    venue_type: "dark",
    snap_type: "dslr",
    wedding_date: "2026-10-05",
    slug: "the-chapel-cheongdam-sample",
    cover_image_url:
      "https://images.unsplash.com/photo-1469371670807-013ccf25f16a?q=80&w=1200",
    description: "따뜻한 조명 아래 담은 클래식한 예식",
    published: true,
    sort_order: 1,
    created_at: "2026-10-06T00:00:00Z",
  },
];

export const mockGalleryPhotos: GalleryPhoto[] = [
  "mock-gallery-1",
  "mock-gallery-2",
  "mock-gallery-3",
  "mock-gallery-4",
].flatMap((galleryId) =>
  Array.from({ length: 8 }).map((_, i) => ({
    id: `${galleryId}-photo-${i}`,
    gallery_id: galleryId,
    image_url: `https://picsum.photos/seed/${galleryId}-${i}/900/1100`,
    thumbnail_url: `https://picsum.photos/seed/${galleryId}-${i}/400/490`,
    sort_order: i,
    width: 600, // 추가
    height: 900, // 추가
  })),
);

export const mockProducts: ProductPackage[] = [
  {
    id: "mock-product-main",
    name: "Main Snap",
    price: 1000000,
    description: null,
    items: [
      "14x11 50p 1권 + 10x8 50p 2권",
      "원본 + 편집본 포함 (링크전달)",
      "1인작가",
      "신부대기실~원판촬영까지",
      "예식시간기준 90분전 도착 (첫 예식이신경우 110분전 도착)",
      "원판(기념촬영)이 필수인 베뉴에서도 구성과 비용은 같습니다",
      "모든작가는 비욘드스냅 전속작가로만 촬영됩니다",
    ],
    sort_order: 0,
  },
  {
    id: "mock-product-iphone",
    name: "iPhone Snap",
    price: 300000,
    description: null,
    items: [
      "당일 원본 전송 (링크전달): 사진+영상 500~600컷 내외",
      "작가 pick 15컷 수정 + 감사카드 2컷 (3일안에 전송) + 폴라로이드 5장 제공",
      "1인작가",
      "신부대기실~원판촬영까지",
      "예식시간기준 90분전 도착 (첫 예식이신경우 110분전 도착)",
      "원판(기념촬영)이 필수인 베뉴에서도 구성과 비용은 같습니다",
      "아이폰작가도 비욘드스냅 전속작가로만 진행됩니다",
    ],
    sort_order: 1,
  },
  {
    id: "mock-product-filming",
    name: "Filming",
    price: 900000,
    description: null,
    items: [
      "1인작가 2cam 4k",
      "원본제공 + 하이라이트 15분 내외 제공",
      "신부대기실~원판촬영까지",
      "예식시간기준 90분전 도착 (첫 예식이신경우 110분전 도착)",
      "영상은 1인촬영으로만 진행됩니다",
      "영상작가도 비욘드스냅 전속작가로만 진행됩니다",
    ],
    sort_order: 2,
  },
];
export const mockFaqs: Faq[] = [
  {
    id: "mock-faq-1",
    question: "예약은 얼마나 전에 해야 하나요?",
    answer:
      "본식 3~6개월 전 예약을 권장드려요. 성수기(봄/가을)는 더 일찍 마감될 수 있습니다.",
    sort_order: 0,
  },
  {
    id: "mock-faq-2",
    question: "원본 데이터도 받을 수 있나요?",
    answer: "네, 모든 패키지에 원본 데이터 전체가 포함되어 있습니다.",
    sort_order: 1,
  },
  {
    id: "mock-faq-3",
    question: "보정본은 언제 받을 수 있나요?",
    answer: "촬영일로부터 평균 3~4주 내 순차적으로 전달드립니다.",
    sort_order: 2,
  },
  {
    id: "mock-faq-4",
    question: "지방 촬영도 가능한가요?",
    answer: "네, 가능합니다. 지역에 따라 별도 출장비가 발생할 수 있어요.",
    sort_order: 3,
  },
];

export const mockSiteSettings: Record<string, string> = {
  intro_text: "눈부신 오늘의 순간을 기록합니다.\n비욘드스냅이 함께합니다.",
  studio_text:
    "우리는 인위적인 연출보다 그날의 진짜 표정과 온도를 남기는 걸 더 중요하게 생각합니다.\n\n촬영 스타일, 작가 소개가 이 자리에 들어갑니다.",
  booking_guide_text:
    "촬영 문의는 아래 SNS 채널을 통해 편하게 남겨주세요. 확인 후 순차적으로 연락드립니다.",
  sns_instagram: "https://instagram.com/anotherday.sample",
  sns_kakao_channel: "https://pf.kakao.com/anotherday.sample",
  sns_naver_blog: "https://blog.naver.com/anotherday.sample",
  sns_instagram2: "https://instagram.com/anotherday.sample",
};
