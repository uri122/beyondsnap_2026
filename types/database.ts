// npx supabase gen types typescript --project-id <project-id> > types/database.ts
// 로 실제 스키마 기반 타입을 생성해 이 파일을 교체하세요.
// 아래는 스캐폴딩 단계의 임시 타입입니다.

export type CeremonyCategory = "bright" | "dark" | "outdoor" | "church";

export type Gallery = {
  id: string;
  title: string;
  venue: string;
  venue_type: CeremonyCategory;
  wedding_date: string | null;
  slug: string;
  cover_image_url: string | null;
  description: string | null;
  published: boolean;
  sort_order: number;
  created_at: string;
};

export type GalleryPhoto = {
  id: string;
  gallery_id: string;
  image_url: string;
  thumbnail_url: string | null;
  width: number | null;
  height: number | null;
  sort_order: number;
};
export type ProductPackage = {
  id: string;
  name: string;
  price: number;
  description: string | null;
  items: string[];
  sort_order: number;
};

export type Faq = {
  id: string;
  question: string;
  answer: string;
  sort_order: number;
};

export type SiteSetting = {
  key: string;
  value: string;
};

// Supabase 클라이언트 제네릭용 (실제로는 CLI로 생성된 Database 타입 사용 권장)
// 주의: 최신 @supabase/postgrest-js는 각 테이블에 Relationships 필드가 있어야
// insert()/update() 타입을 제대로 추론합니다 (없으면 조용히 never로 빠짐).
export type Database = {
  public: {
    Tables: {
      galleries: {
        Row: Gallery;
        Insert: Partial<Gallery>;
        Update: Partial<Gallery>;
        Relationships: [];
      };
      gallery_photos: {
        Row: GalleryPhoto;
        Insert: Partial<GalleryPhoto>;
        Update: Partial<GalleryPhoto>;
        Relationships: [];
      };
      products: {
        Row: ProductPackage;
        Insert: Partial<ProductPackage>;
        Update: Partial<ProductPackage>;
        Relationships: [];
      };
      faqs: { Row: Faq; Insert: Partial<Faq>; Update: Partial<Faq>; Relationships: [] };
      site_settings: {
        Row: SiteSetting;
        Insert: Partial<SiteSetting>;
        Update: Partial<SiteSetting>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
