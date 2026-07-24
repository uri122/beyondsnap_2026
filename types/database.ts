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

export type Film = {
  id: string;
  venue: string;
  title: string;
  slug: string;
  category: string | null;
  thumbnail_url: string;
  video_url: string;
  published: boolean;
  sort_order: number;
  created_at: string;
};

export type SiteSetting = {
  key: string;
  value: string;
};

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      galleries: {
        Row: {
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
        Insert: {
          id?: string;
          title: string;
          venue: string;
          venue_type: string;
          wedding_date?: string | null;
          slug: string;
          cover_image_url?: string | null;
          description?: string | null;
          published?: boolean;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          venue?: string;
          venue_type?: string;
          wedding_date?: string | null;
          slug?: string;
          cover_image_url?: string | null;
          description?: string | null;
          published?: boolean;
          sort_order?: number;
          created_at?: string;
        };
        Relationships: [];
      };
      gallery_photos: {
        Row: {
          id: string;
          gallery_id: string;
          image_url: string;
          thumbnail_url: string | null;
          width: number | null;
          height: number | null;
          sort_order: number;
        };
        Insert: {
          id?: string;
          gallery_id: string;
          image_url: string;
          thumbnail_url?: string | null;
          width?: number | null;
          height?: number | null;
          sort_order?: number;
        };
        Update: {
          id?: string;
          gallery_id?: string;
          image_url?: string;
          thumbnail_url?: string | null;
          width?: number | null;
          height?: number | null;
          sort_order?: number;
        };
        Relationships: [
          {
            foreignKeyName: "gallery_photos_gallery_id_fkey";
            columns: ["gallery_id"];
            isOneToOne: false;
            referencedRelation: "galleries";
            referencedColumns: ["id"];
          },
        ];
      };
      products: {
        Row: {
          id: string;
          name: string;
          price: number;
          description: string | null;
          items: Json;
          sort_order: number;
        };
        Insert: {
          id?: string;
          name: string;
          price?: number;
          description?: string | null;
          items?: Json;
          sort_order?: number;
        };
        Update: {
          id?: string;
          name?: string;
          price?: number;
          description?: string | null;
          items?: Json;
          sort_order?: number;
        };
        Relationships: [];
      };
      faqs: {
        Row: {
          id: string;
          question: string;
          answer: string;
          sort_order: number;
        };
        Insert: {
          id?: string;
          question: string;
          answer: string;
          sort_order?: number;
        };
        Update: {
          id?: string;
          question?: string;
          answer?: string;
          sort_order?: number;
        };
        Relationships: [];
      };
      films: {
        Row: Film;
        Insert: Partial<Film>;
        Update: Partial<Film>;
        Relationships: [];
      };
      site_settings: {
        Row: {
          key: string;
          value: string | null;
        };
        Insert: {
          key: string;
          value?: string | null;
        };
        Update: {
          key?: string;
          value?: string | null;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      ceremony_category: "bright" | "dark" | "outdoor" | "church";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
