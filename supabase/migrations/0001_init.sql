-- كنافة سكره — Initial schema, RLS policies, and storage bucket
-- Run this in the Supabase SQL Editor (or via `supabase db push`).

create extension if not exists "pgcrypto";

-- =========================================================
-- TABLES
-- =========================================================

create table if not exists public.restaurants (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.restaurant_settings (
  restaurant_id uuid primary key references public.restaurants(id) on delete cascade,
  description text,
  phone text,
  whatsapp text,
  instagram text,
  address text,
  maps_url text,
  logo_url text,
  cover_url text,
  updated_at timestamptz not null default now()
);

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  full_name text,
  role text not null default 'admin' check (role in ('admin')),
  created_at timestamptz not null default now()
);

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  name text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  category_id uuid references public.categories(id) on delete set null,
  name text not null,
  description text,
  price numeric(10, 2) not null default 0,
  image_url text,
  available boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.opening_hours (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  day_of_week int not null check (day_of_week between 0 and 6), -- 0 = الأحد ... 6 = السبت
  open_time time,
  close_time time,
  is_closed boolean not null default false,
  unique (restaurant_id, day_of_week)
);

create index if not exists idx_categories_restaurant on public.categories(restaurant_id);
create index if not exists idx_products_restaurant on public.products(restaurant_id);
create index if not exists idx_products_category on public.products(category_id);
create index if not exists idx_opening_hours_restaurant on public.opening_hours(restaurant_id);

-- =========================================================
-- updated_at trigger helper
-- =========================================================
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_restaurants_updated_at on public.restaurants;
create trigger trg_restaurants_updated_at before update on public.restaurants
  for each row execute function public.set_updated_at();

drop trigger if exists trg_settings_updated_at on public.restaurant_settings;
create trigger trg_settings_updated_at before update on public.restaurant_settings
  for each row execute function public.set_updated_at();

drop trigger if exists trg_categories_updated_at on public.categories;
create trigger trg_categories_updated_at before update on public.categories
  for each row execute function public.set_updated_at();

drop trigger if exists trg_products_updated_at on public.products;
create trigger trg_products_updated_at before update on public.products
  for each row execute function public.set_updated_at();

-- =========================================================
-- SEED: restaurant record for كنافة سكره (edit values as needed)
-- =========================================================
insert into public.restaurants (id, slug, name)
values ('00000000-0000-0000-0000-000000000001', 'kunafa-sokara', 'كنافة سكره')
on conflict (slug) do nothing;

insert into public.restaurant_settings (restaurant_id, description, phone, whatsapp, instagram, address, maps_url)
values (
  '00000000-0000-0000-0000-000000000001',
  'كنافة سكره — كنافة وحلويات في جدة',
  '0570207432',
  '966570207432',
  'konafasukrah',
  'حي البغدادية الغربية، شارع حمزة شحاته، جدة 22232',
  null
)
on conflict (restaurant_id) do nothing;

insert into public.opening_hours (restaurant_id, day_of_week, open_time, close_time, is_closed)
values
  ('00000000-0000-0000-0000-000000000001', 0, '14:00', '00:00', false), -- الأحد
  ('00000000-0000-0000-0000-000000000001', 1, '14:00', '00:00', false), -- الاثنين
  ('00000000-0000-0000-0000-000000000001', 2, '14:00', '00:00', false), -- الثلاثاء
  ('00000000-0000-0000-0000-000000000001', 3, '14:00', '00:00', false), -- الأربعاء
  ('00000000-0000-0000-0000-000000000001', 4, '14:00', '00:00', false), -- الخميس
  ('00000000-0000-0000-0000-000000000001', 5, '13:30', '00:00', false), -- الجمعة
  ('00000000-0000-0000-0000-000000000001', 6, '14:00', '00:00', false)  -- السبت
on conflict (restaurant_id, day_of_week) do nothing;

insert into public.categories (id, restaurant_id, name, sort_order)
values ('00000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000001', 'كنافة', 0)
on conflict (id) do nothing;

insert into public.products (restaurant_id, category_id, name, description, price, sort_order)
values
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000010', 'كنافة حشوة قشطة', 'كنافة بحشوة القشطة.', 10, 0),
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000010', 'كنافة محشية نوتيلا', 'كنافة محشية بنوتيلا.', 18, 1),
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000010', 'كنافة محشية لوتس', 'كنافة محشية باللوتس.', 18, 2)
on conflict do nothing;

-- =========================================================
-- ROW LEVEL SECURITY
-- =========================================================
alter table public.restaurants enable row level security;
alter table public.restaurant_settings enable row level security;
alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.opening_hours enable row level security;

-- Public (anon) read access — storefront
drop policy if exists "public read restaurants" on public.restaurants;
create policy "public read restaurants" on public.restaurants for select using (true);

drop policy if exists "public read settings" on public.restaurant_settings;
create policy "public read settings" on public.restaurant_settings for select using (true);

drop policy if exists "public read categories" on public.categories;
create policy "public read categories" on public.categories for select using (true);

drop policy if exists "public read available products" on public.products;
create policy "public read available products" on public.products for select using (true);

drop policy if exists "public read opening hours" on public.opening_hours;
create policy "public read opening hours" on public.opening_hours for select using (true);

-- profiles: a user can read their own profile only
drop policy if exists "read own profile" on public.profiles;
create policy "read own profile" on public.profiles for select using (auth.uid() = id);

-- Helper: is the current authenticated user an admin of this restaurant_id?
create or replace function public.is_restaurant_admin(target_restaurant_id uuid)
returns boolean as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
      and p.restaurant_id = target_restaurant_id
  );
$$ language sql security definer stable;

-- Admin write policies (insert/update/delete gated to matching restaurant_id)
drop policy if exists "admin manage restaurant" on public.restaurants;
create policy "admin manage restaurant" on public.restaurants for update
  using (public.is_restaurant_admin(id)) with check (public.is_restaurant_admin(id));

drop policy if exists "admin manage settings" on public.restaurant_settings;
create policy "admin manage settings" on public.restaurant_settings for all
  using (public.is_restaurant_admin(restaurant_id)) with check (public.is_restaurant_admin(restaurant_id));

drop policy if exists "admin manage categories" on public.categories;
create policy "admin manage categories" on public.categories for all
  using (public.is_restaurant_admin(restaurant_id)) with check (public.is_restaurant_admin(restaurant_id));

drop policy if exists "admin manage products" on public.products;
create policy "admin manage products" on public.products for all
  using (public.is_restaurant_admin(restaurant_id)) with check (public.is_restaurant_admin(restaurant_id));

drop policy if exists "admin manage opening hours" on public.opening_hours;
create policy "admin manage opening hours" on public.opening_hours for all
  using (public.is_restaurant_admin(restaurant_id)) with check (public.is_restaurant_admin(restaurant_id));

-- =========================================================
-- STORAGE: product/logo/cover images bucket
-- =========================================================
insert into storage.buckets (id, name, public)
values ('restaurant-media', 'restaurant-media', true)
on conflict (id) do nothing;

drop policy if exists "public read restaurant-media" on storage.objects;
create policy "public read restaurant-media" on storage.objects for select
  using (bucket_id = 'restaurant-media');

drop policy if exists "admin upload restaurant-media" on storage.objects;
create policy "admin upload restaurant-media" on storage.objects for insert
  with check (bucket_id = 'restaurant-media' and auth.role() = 'authenticated');

drop policy if exists "admin update restaurant-media" on storage.objects;
create policy "admin update restaurant-media" on storage.objects for update
  using (bucket_id = 'restaurant-media' and auth.role() = 'authenticated');

drop policy if exists "admin delete restaurant-media" on storage.objects;
create policy "admin delete restaurant-media" on storage.objects for delete
  using (bucket_id = 'restaurant-media' and auth.role() = 'authenticated');
