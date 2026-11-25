-- Home Finds catalogue admin. Apply with `npx supabase db push --remote` after linking the intended project.
create extension if not exists pgcrypto;

create table if not exists public.staff_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  role text not null default 'catalogue_admin' check (role in ('owner', 'catalogue_admin')),
  created_at timestamptz not null default now()
);
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(), name text not null check (char_length(name) between 2 and 100),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'), description text,
  display_order integer not null default 0 check (display_order >= 0), is_published boolean not null default false,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(), category_id uuid not null references public.categories(id),
  name text not null check (char_length(name) between 2 and 140), slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  model_name text, short_description text, description text,
  status text not null default 'draft' check (status in ('draft','published','archived')),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.variants (
  id uuid primary key default gen_random_uuid(), product_id uuid not null references public.products(id) on delete cascade,
  design text not null, size text not null, colour text not null,
  sku text not null unique, price_ugx bigint not null check (price_ugx > 0), is_active boolean not null default true,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  unique(product_id, design, size, colour)
);
create table if not exists public.product_images (
  id uuid primary key default gen_random_uuid(), product_id uuid not null references public.products(id) on delete cascade,
  storage_path text not null unique, image_url text not null, alt_text text not null check (char_length(alt_text) between 1 and 240),
  display_order integer not null default 0, is_primary boolean not null default false,
  created_at timestamptz not null default now()
);
create unique index if not exists product_images_one_primary on public.product_images(product_id) where is_primary;
create table if not exists public.configurator_assets (
  id uuid primary key default gen_random_uuid(), variant_id uuid not null references public.variants(id) on delete cascade,
  view text not null check (view in ('frame','dressed')), storage_path text not null unique,
  image_url text not null, alt_text text not null, match_confirmed boolean not null default false, is_active boolean not null default true,
  created_at timestamptz not null default now(), unique(variant_id, view)
);
create table if not exists public.catalogue_audit_log (
  id bigint generated always as identity primary key, actor_id uuid references auth.users(id) on delete set null,
  action text not null, entity_table text not null, entity_id text not null,
  before_data jsonb, after_data jsonb, created_at timestamptz not null default now()
);
create index if not exists catalogue_audit_created on public.catalogue_audit_log(created_at desc);

create or replace function public.touch_updated_at() returns trigger
language plpgsql set search_path = '' as $$
begin new.updated_at := now(); return new; end $$;
drop trigger if exists categories_touch_updated_at on public.categories;
create trigger categories_touch_updated_at before update on public.categories for each row execute function public.touch_updated_at();
drop trigger if exists products_touch_updated_at on public.products;
create trigger products_touch_updated_at before update on public.products for each row execute function public.touch_updated_at();
drop trigger if exists variants_touch_updated_at on public.variants;
create trigger variants_touch_updated_at before update on public.variants for each row execute function public.touch_updated_at();

create or replace function public.enforce_publish_requirements() returns trigger
language plpgsql security definer set search_path = '' as $$
declare active_count integer; image_count integer; incomplete_count integer;
begin
  if new.status = 'published' then
    select count(*) into active_count from public.variants where product_id = new.id and is_active;
    select count(*) into image_count from public.product_images where product_id = new.id and is_primary;
    select count(*) into incomplete_count from public.variants v
      where v.product_id = new.id and v.is_active and (
        not exists (select 1 from public.configurator_assets a where a.variant_id = v.id and a.view = 'frame' and a.is_active and a.match_confirmed)
        or not exists (select 1 from public.configurator_assets a where a.variant_id = v.id and a.view = 'dressed' and a.is_active and a.match_confirmed)
      );
    if active_count = 0 or image_count = 0 or incomplete_count > 0 then
      raise exception 'Cannot publish: add active priced variants, a primary product image, and confirmed frame/dressed images for every active variant.' using errcode = '23514';
    end if;
  end if;
  return new;
end $$;
drop trigger if exists product_publish_requirements on public.products;
create trigger product_publish_requirements before insert or update of status on public.products for each row execute function public.enforce_publish_requirements();

create or replace function public.is_catalogue_staff() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.staff_profiles where user_id = (select auth.uid()))
$$;
revoke all on function public.is_catalogue_staff() from public;
grant execute on function public.is_catalogue_staff() to authenticated;

create or replace function public.log_catalogue_change() returns trigger
language plpgsql security definer set search_path = '' as $$
declare old_row jsonb; new_row jsonb; entity_key text;
begin
  if tg_op <> 'INSERT' then old_row := to_jsonb(old); end if;
  if tg_op <> 'DELETE' then new_row := to_jsonb(new); end if;
  entity_key := coalesce(new_row->>'id', old_row->>'id', '');
  insert into public.catalogue_audit_log(actor_id, action, entity_table, entity_id, before_data, after_data)
  values ((select auth.uid()), tg_op, tg_table_name, entity_key, old_row, new_row);
  if tg_op = 'DELETE' then return old; else return new; end if;
end $$;

do $$ declare t text; begin
  foreach t in array array['categories','products','variants','product_images','configurator_assets'] loop
    execute format('drop trigger if exists catalogue_audit on public.%I', t);
    execute format('create trigger catalogue_audit after insert or update or delete on public.%I for each row execute function public.log_catalogue_change()', t);
  end loop;
end $$;

alter table public.staff_profiles enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.variants enable row level security;
alter table public.product_images enable row level security;
alter table public.configurator_assets enable row level security;
alter table public.catalogue_audit_log enable row level security;

drop policy if exists "staff read own profile" on public.staff_profiles;
create policy "staff read own profile" on public.staff_profiles for select to authenticated using (user_id = (select auth.uid()));
drop policy if exists "staff read categories" on public.categories;
create policy "staff read categories" on public.categories for select to authenticated using (public.is_catalogue_staff());
drop policy if exists "public read published categories" on public.categories;
create policy "public read published categories" on public.categories for select to anon, authenticated using (is_published);
drop policy if exists "staff manage categories" on public.categories;
create policy "staff manage categories" on public.categories for all to authenticated using (public.is_catalogue_staff()) with check (public.is_catalogue_staff());
drop policy if exists "staff read products" on public.products;
create policy "staff read products" on public.products for select to authenticated using (public.is_catalogue_staff());
drop policy if exists "public read published products" on public.products;
create policy "public read published products" on public.products for select to anon, authenticated using (status = 'published' and exists (select 1 from public.categories c where c.id = category_id and c.is_published));
drop policy if exists "staff manage products" on public.products;
create policy "staff manage products" on public.products for all to authenticated using (public.is_catalogue_staff()) with check (public.is_catalogue_staff());
drop policy if exists "staff manage variants" on public.variants;
create policy "staff manage variants" on public.variants for all to authenticated using (public.is_catalogue_staff()) with check (public.is_catalogue_staff());
drop policy if exists "public read purchasable variants" on public.variants;
create policy "public read purchasable variants" on public.variants for select to anon, authenticated using (is_active and exists (select 1 from public.products p join public.categories c on c.id = p.category_id where p.id = product_id and p.status = 'published' and c.is_published));
drop policy if exists "staff manage product images" on public.product_images;
create policy "staff manage product images" on public.product_images for all to authenticated using (public.is_catalogue_staff()) with check (public.is_catalogue_staff());
drop policy if exists "public read published product images" on public.product_images;
create policy "public read published product images" on public.product_images for select to anon, authenticated using (exists (select 1 from public.products p join public.categories c on c.id = p.category_id where p.id = product_id and p.status = 'published' and c.is_published));
drop policy if exists "staff manage configurator assets" on public.configurator_assets;
create policy "staff manage configurator assets" on public.configurator_assets for all to authenticated using (public.is_catalogue_staff()) with check (public.is_catalogue_staff());
drop policy if exists "public read matched configurator assets" on public.configurator_assets;
create policy "public read matched configurator assets" on public.configurator_assets for select to anon, authenticated using (is_active and match_confirmed and exists (select 1 from public.variants v join public.products p on p.id = v.product_id join public.categories c on c.id = p.category_id where v.id = variant_id and v.is_active and p.status = 'published' and c.is_published));
drop policy if exists "staff read audit" on public.catalogue_audit_log;
create policy "staff read audit" on public.catalogue_audit_log for select to authenticated using (public.is_catalogue_staff());
revoke insert, update, delete on public.catalogue_audit_log from anon, authenticated;
revoke all on public.staff_profiles, public.categories, public.products, public.variants, public.product_images, public.configurator_assets, public.catalogue_audit_log from anon;
grant select on public.staff_profiles to authenticated;
grant select, insert, update, delete on public.categories, public.products, public.variants, public.product_images, public.configurator_assets to authenticated;
grant select on public.catalogue_audit_log to authenticated;
grant select on public.categories, public.products, public.variants, public.product_images, public.configurator_assets to anon;

-- Public bucket allows storefront delivery. Authenticated catalogue staff alone can upload.
insert into storage.buckets(id, name, public, file_size_limit, allowed_mime_types)
values ('catalogue-images', 'catalogue-images', true, 7000000, array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set public = true, file_size_limit = 7000000, allowed_mime_types = array['image/jpeg','image/png','image/webp'];
drop policy if exists "catalogue staff upload images" on storage.objects;
create policy "catalogue staff upload images" on storage.objects for insert to authenticated with check (bucket_id = 'catalogue-images' and public.is_catalogue_staff());
drop policy if exists "catalogue staff replace images" on storage.objects;
create policy "catalogue staff replace images" on storage.objects for update to authenticated using (bucket_id = 'catalogue-images' and public.is_catalogue_staff()) with check (bucket_id = 'catalogue-images' and public.is_catalogue_staff());
drop policy if exists "catalogue staff delete images" on storage.objects;
create policy "catalogue staff delete images" on storage.objects for delete to authenticated using (bucket_id = 'catalogue-images' and public.is_catalogue_staff());

-- Staff profile rows are deliberately provisioned by the project owner, never by public signup.
