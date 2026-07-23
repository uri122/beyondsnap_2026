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
          venue_type: string;
          wedding_date: string | null;
          slug: string;
          cover_image_url: string | null;
          description: string | null;
          published: boolean;
          sort_order: number;
          created_at: string;
        };
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
      };
      faqs: {
        Row: {
          id: string;
          question: string;
          answer: string;
          sort_order: number;
        };
      };
      site_settings: {
        Row: {
          key: string;
          value: string | null;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}
