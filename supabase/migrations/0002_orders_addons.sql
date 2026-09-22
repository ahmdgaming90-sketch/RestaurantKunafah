-- كنافة سكره — Addons + Orders + atomic order-number generation
-- Run after 0001_init.sql

alter table public.restaurants
  add column if not exists order_prefix text not null default 'KS';

-- =========================================================
-- PRODUCT ADDONS
-- =========================================================
create table if not exists public.product_addons (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  name text not null,
  price numeric(10, 2) not null default 0,
  is_active boolean not null default true,
  selection_type text not null default 'multiple' check (selection_type in ('single', 'multiple')),
  is_required boolean not null default false,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_product_addons_product on public.product_addons(product_id);

drop trigger if exists trg_addons_updated_at on public.product_addons;
create trigger trg_addons_updated_at before update on public.product_addons
  for each row execute function public.set_updated_at();

alter table public.product_addons enable row level security;

drop policy if exists "public read active addons" on public.product_addons;
create policy "public read active addons" on public.product_addons for select using (true);

drop policy if exists "admin manage addons" on public.product_addons;
create policy "admin manage addons" on public.product_addons for all
  using (public.is_restaurant_admin(restaurant_id)) with check (public.is_restaurant_admin(restaurant_id));

-- =========================================================
-- ORDER NUMBER GENERATION (race-safe, per restaurant per day)
-- =========================================================
create table if not exists public.order_counters (
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  counter_date date not null,
  last_number int not null default 0,
  primary key (restaurant_id, counter_date)
);

create or replace function public.next_order_number(p_restaurant_id uuid)
returns text as $$
declare
  v_prefix text;
  v_today date := current_date;
  v_seq int;
begin
  select order_prefix into v_prefix from public.restaurants where id = p_restaurant_id;
  v_prefix := coalesce(v_prefix, 'KS');

  insert into public.order_counters (restaurant_id, counter_date, last_number)
  values (p_restaurant_id, v_today, 1)
  on conflict (restaurant_id, counter_date)
  do update set last_number = public.order_counters.last_number + 1
  returning last_number into v_seq;

  return v_prefix || '-' || to_char(v_today, 'YYYYMMDD') || '-' || lpad(v_seq::text, 3, '0');
end;
$$ language plpgsql security definer;

-- =========================================================
-- ORDERS
-- =========================================================
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  order_number text not null,
  customer_name text not null,
  customer_phone text not null,
  total numeric(10, 2) not null default 0,
  status text not null default 'new' check (status in ('new', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (restaurant_id, order_number)
);

create index if not exists idx_orders_restaurant on public.orders(restaurant_id);
create index if not exists idx_orders_status on public.orders(restaurant_id, status);

drop trigger if exists trg_orders_updated_at on public.orders;
create trigger trg_orders_updated_at before update on public.orders
  for each row execute function public.set_updated_at();

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  product_name text not null,
  unit_price numeric(10, 2) not null,
  quantity int not null check (quantity > 0),
  line_total numeric(10, 2) not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_order_items_order on public.order_items(order_id);

create table if not exists public.order_item_addons (
  id uuid primary key default gen_random_uuid(),
  order_item_id uuid not null references public.order_items(id) on delete cascade,
  addon_id uuid references public.product_addons(id) on delete set null,
  addon_name text not null,
  addon_price numeric(10, 2) not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_order_item_addons_item on public.order_item_addons(order_item_id);

alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.order_item_addons enable row level security;
alter table public.order_counters enable row level security;

-- No public select/insert/update on orders* — all guest writes go through
-- the SECURITY DEFINER create_order() RPC below. Admins can read/update their own.
drop policy if exists "admin read orders" on public.orders;
create policy "admin read orders" on public.orders for select
  using (public.is_restaurant_admin(restaurant_id));

drop policy if exists "admin update orders" on public.orders;
create policy "admin update orders" on public.orders for update
  using (public.is_restaurant_admin(restaurant_id)) with check (public.is_restaurant_admin(restaurant_id));

drop policy if exists "admin read order items" on public.order_items;
create policy "admin read order items" on public.order_items for select
  using (exists (select 1 from public.orders o where o.id = order_id and public.is_restaurant_admin(o.restaurant_id)));

drop policy if exists "admin read order item addons" on public.order_item_addons;
create policy "admin read order item addons" on public.order_item_addons for select
  using (exists (
    select 1 from public.order_items oi
    join public.orders o on o.id = oi.order_id
    where oi.id = order_item_id and public.is_restaurant_admin(o.restaurant_id)
  ));

-- =========================================================
-- CREATE ORDER — server-side price recomputation, atomic, race-safe
-- p_items shape: [{ "product_id": "uuid", "quantity": 2, "addon_ids": ["uuid", ...] }, ...]
-- =========================================================
create or replace function public.create_order(
  p_restaurant_slug text,
  p_customer_name text,
  p_customer_phone text,
  p_items jsonb
)
returns jsonb as $$
declare
  v_restaurant_id uuid;
  v_order_id uuid;
  v_order_number text;
  v_total numeric(10,2) := 0;
  v_item jsonb;
  v_addon_id uuid;
  v_product record;
  v_addon record;
  v_line_addons_total numeric(10,2);
  v_line_total numeric(10,2);
  v_order_item_id uuid;
  v_quantity int;
begin
  if p_customer_name is null or length(trim(p_customer_name)) = 0 then
    raise exception 'CUSTOMER_NAME_REQUIRED';
  end if;

  if p_customer_phone is null or length(regexp_replace(p_customer_phone, '[^0-9]', '', 'g')) < 9 then
    raise exception 'CUSTOMER_PHONE_INVALID';
  end if;

  if p_items is null or jsonb_array_length(p_items) = 0 then
    raise exception 'CART_EMPTY';
  end if;

  select id into v_restaurant_id from public.restaurants where slug = p_restaurant_slug;
  if v_restaurant_id is null then
    raise exception 'RESTAURANT_NOT_FOUND';
  end if;

  v_order_number := public.next_order_number(v_restaurant_id);

  insert into public.orders (restaurant_id, order_number, customer_name, customer_phone, total, status)
  values (v_restaurant_id, v_order_number, trim(p_customer_name), trim(p_customer_phone), 0, 'new')
  returning id into v_order_id;

  for v_item in select * from jsonb_array_elements(p_items)
  loop
    v_quantity := coalesce((v_item->>'quantity')::int, 1);
    if v_quantity < 1 then
      v_quantity := 1;
    end if;

    select id, name, price, available into v_product
    from public.products
    where id = (v_item->>'product_id')::uuid
      and restaurant_id = v_restaurant_id;

    if v_product.id is null then
      raise exception 'PRODUCT_NOT_FOUND';
    end if;
    if v_product.available = false then
      raise exception 'PRODUCT_UNAVAILABLE';
    end if;

    v_line_addons_total := 0;

    insert into public.order_items (order_id, product_id, product_name, unit_price, quantity, line_total)
    values (v_order_id, v_product.id, v_product.name, v_product.price, v_quantity, 0)
    returning id into v_order_item_id;

    if (v_item ? 'addon_ids') then
      for v_addon_id in select jsonb_array_elements_text(v_item->'addon_ids')::uuid
      loop
        select id, name, price into v_addon
        from public.product_addons
        where id = v_addon_id
          and product_id = v_product.id
          and is_active = true;

        if v_addon.id is null then
          raise exception 'ADDON_NOT_FOUND';
        end if;

        insert into public.order_item_addons (order_item_id, addon_id, addon_name, addon_price)
        values (v_order_item_id, v_addon.id, v_addon.name, v_addon.price);

        v_line_addons_total := v_line_addons_total + v_addon.price;
      end loop;
    end if;

    v_line_total := (v_product.price + v_line_addons_total) * v_quantity;

    update public.order_items set line_total = v_line_total where id = v_order_item_id;

    v_total := v_total + v_line_total;
  end loop;

  update public.orders set total = v_total where id = v_order_id;

  return jsonb_build_object('order_id', v_order_id, 'order_number', v_order_number, 'total', v_total);
end;
$$ language plpgsql security definer;

-- Allow guests (anon) and logged-in users to place orders through the function only.
grant execute on function public.create_order(text, text, text, jsonb) to anon, authenticated;
