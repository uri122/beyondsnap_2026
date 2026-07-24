-- ============================================
-- Wedding Snap 스키마 + RLS 정책
-- Supabase SQL Editor에서 실행하세요.
-- ============================================

create extension if not exists "uuid-ossp";

-- 갤러리 (세레모니)
create table galleries (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  venue text not null,
  venue_type text not null check (ceremony_category in ('bright', 'dark', 'outdoor', 'church')),
  wedding_date date,
  slug text unique not null,
  cover_image_url text,
  description text,
  published boolean not null default false,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table gallery_photos (
  id uuid primary key default uuid_generate_v4(),
  gallery_id uuid not null references galleries(id) on delete cascade,
  image_url text not null,
  thumbnail_url text,
  width int,
  height int,
  sort_order int not null default 0
);

-- Films
create table films (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  venue text not null,
  slug text unique not null,
  category text,
  thumbnail_url text not null,
  video_url text not null, -- 유튜브/비메오 등 외부 영상 링크
  published boolean not null default false,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- 상품구성
create table products (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  price numeric not null default 0,
  description text,
  items jsonb not null default '[]',
  sort_order int not null default 0
);

-- FAQ
create table faqs (
  id uuid primary key default uuid_generate_v4(),
  question text not null,
  answer text not null,
  sort_order int not null default 0
);

-- 소개/스튜디오/SNS 링크 등 단일 텍스트 콘텐츠
create table site_settings (
  key text primary key,
  value text
);

-- ============================================
-- RLS 활성화
-- ============================================
alter table galleries enable row level security;
alter table gallery_photos enable row level security;
alter table films enable row level security;
alter table products enable row level security;
alter table faqs enable row level security;
alter table site_settings enable row level security;

-- 공개 조회 (published된 것만 / 공개 콘텐츠 테이블은 전체 조회 허용)
create policy "public read published galleries" on galleries
  for select using (published = true);

create policy "public read photos of published galleries" on gallery_photos
  for select using (
    exists (select 1 from galleries g where g.id = gallery_id and g.published = true)
  );

create policy "public read published films" on films for select using (published = true);
create policy "public read products" on products for select using (true);
create policy "public read faqs" on faqs for select using (true);
create policy "public read site_settings" on site_settings for select using (true);

-- 관리자(authenticated)는 전체 CRUD 가능
create policy "authenticated full access galleries" on galleries
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "authenticated full access gallery_photos" on gallery_photos
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "authenticated full access films" on films
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "authenticated full access products" on products
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "authenticated full access faqs" on faqs
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "authenticated full access site_settings" on site_settings
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- ============================================
-- 사진 파일은 Supabase Storage가 아니라 Cloudflare R2에 저장합니다.
-- (Supabase 무료플랜 파일저장 1GB로는 웨딩스냅 사진 특성상 금방 참,
--  R2는 10GB 무료 + 이그레스 비용 없음이라 사진 서빙에 훨씬 유리함)
-- gallery_photos.image_url에는 R2 public URL만 저장되고,
-- 실제 업로드는 app/actions/photos.ts의 서버 액션이 R2로 직접 처리합니다.
-- Supabase Storage 버킷/정책은 이 프로젝트에서 사용하지 않습니다.
-- ============================================
