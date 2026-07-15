import type { Gallery, GalleryPhoto, ProductPackage, Faq } from "@/types/database";

export const mockGalleries: Gallery[] = [
  {
    id: "mock-gallery-1",
    title: "봄날의 기록",
    venue: "그랜드 하얏트 서울",
    venue_type: "bright",
    wedding_date: "2026-04-18",
    slug: "grand-hyatt-seoul-sample",
    thumbnailUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=800',
    images: [
      'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1200',
      'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=1200'
    ],
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
    wedding_date: "2026-10-05",
    slug: "the-chapel-cheongdam-sample",
    thumbnailUrl: 'https://images.unsplash.com/photo-1469371670807-013ccf25f16a?q=80&w=800',
    images: [
      'https://images.unsplash.com/photo-1469371670807-013ccf25f16a?q=80&w=1200'
    ],
    description: "따뜻한 조명 아래 담은 클래식한 예식",
    published: true,
    sort_order: 1,
    created_at: "2026-10-06T00:00:00Z",
  },
  {
    id: "mock-gallery-3",
    title: "빛과 서약",
    venue: "메이필드호텔 야외정원",
    venue_type: "outdoor",
    wedding_date: "2026-06-12",
    slug: "mayfield-hotel-sample",
    thumbnailUrl: 'https://images.unsplash.com/photo-1544078751-58fee2d8a03b?q=80&w=800',
    images: [
      'https://images.unsplash.com/photo-1544078751-58fee2d8a03b?q=80&w=1200'
    ],
    description: "자연광이 가득한 야외 예식 기록",
    published: true,
    sort_order: 2,
    created_at: "2026-06-13T00:00:00Z",
  },
  {
    id: "mock-gallery-4",
    title: "고요한 서약",
    venue: "정동제일교회",
    venue_type: "church",
    wedding_date: "2026-05-09",
    slug: "jeongdong-church-sample",
    thumbnailUrl: 'https://images.unsplash.com/photo-1523438885200-e635ba2c371e?q=80&w=800',
    images: [
      'https://images.unsplash.com/photo-1523438885200-e635ba2c371e?q=80&w=1200'
    ],
    description: "예배당 특유의 차분한 분위기를 담은 기록",
    published: true,
    sort_order: 3,
    created_at: "2026-05-10T00:00:00Z",
  },
];

// export const mockGalleryPhotos: GalleryPhoto[] = [
//   "mock-gallery-1",
//   "mock-gallery-2",
//   "mock-gallery-3",
//   "mock-gallery-4",
// ].flatMap((galleryId, gIdx) =>
//   Array.from({ length: 8 }).map((_, i) => ({
//     id: `${galleryId}-photo-${i}`,
//     gallery_id: galleryId,
//     image_url: photo(`${galleryId}-${i}`, 900, i % 2 === 0 ? 1100 : 700),
//     thumbnail_url: photo(`${galleryId}-${i}`, 400, i % 2 === 0 ? 490 : 310),
//     sort_order: i,
//   }))
// );

export const mockProducts: ProductPackage[] = [
  {
    id: "mock-product-1",
    name: "베이직 패키지",
    price: 1200000,
    description: "본식스냅 4시간, 원본 전체 + 보정 100컷",
    items: ["작가 1인", "촬영 4시간", "원본 데이터 전체 제공", "보정본 100컷", "온라인 갤러리 3개월"],
    sort_order: 0,
  },
  {
    id: "mock-product-2",
    name: "프리미엄 패키지",
    price: 1800000,
    description: "본식스냅 6시간, 부제작가 포함, 스냅북 제작",
    items: [
      "작가 2인(부작가 포함)",
      "촬영 6시간",
      "원본 데이터 전체 제공",
      "보정본 200컷",
      "20페이지 스냅북 1권",
      "온라인 갤러리 6개월",
    ],
    sort_order: 1,
  },
  {
    id: "mock-product-3",
    name: "디럭스 패키지",
    price: 2500000,
    description: "본식스냅 풀타임, 하이라이트 영상 포함",
    items: [
      "작가 2인 + 영상팀",
      "촬영 풀타임(입장 전~퇴장)",
      "원본 데이터 전체 제공",
      "보정본 300컷",
      "3분 하이라이트 영상",
      "30페이지 스냅북 1권",
      "온라인 갤러리 1년",
    ],
    sort_order: 2,
  },
];

export const mockFaqs: Faq[] = [
  {
    id: "mock-faq-1",
    question: "예약은 얼마나 전에 해야 하나요?",
    answer: "본식 3~6개월 전 예약을 권장드려요. 성수기(봄/가을)는 더 일찍 마감될 수 있습니다.",
    category: "예약",
    sort_order: 0,
  },
  {
    id: "mock-faq-2",
    question: "원본 데이터도 받을 수 있나요?",
    answer: "네, 모든 패키지에 원본 데이터 전체가 포함되어 있습니다.",
    category: "결과물",
    sort_order: 1,
  },
  {
    id: "mock-faq-3",
    question: "보정본은 언제 받을 수 있나요?",
    answer: "촬영일로부터 평균 3~4주 내 순차적으로 전달드립니다.",
    category: "결과물",
    sort_order: 2,
  },
  {
    id: "mock-faq-4",
    question: "지방 촬영도 가능한가요?",
    answer: "네, 가능합니다. 지역에 따라 별도 출장비가 발생할 수 있어요.",
    category: "촬영",
    sort_order: 3,
  },
];

export const mockSiteSettings: Record<string, string> = {
  intro_text: "눈부신 오늘의 순간을 기록합니다.\n비욘드스냅이 함께합니다.",
  studio_text:
    "우리는 인위적인 연출보다 그날의 진짜 표정과 온도를 남기는 걸 더 중요하게 생각합니다.\n\n촬영 스타일, 작가 소개가 이 자리에 들어갑니다.",
  booking_guide_text: "촬영 문의는 아래 SNS 채널을 통해 편하게 남겨주세요. 확인 후 순차적으로 연락드립니다.",
  sns_instagram: "https://instagram.com/anotherday.sample",
  sns_kakao_channel: "https://pf.kakao.com/anotherday.sample",
  sns_naver_blog: "https://blog.naver.com/anotherday.sample",
};
