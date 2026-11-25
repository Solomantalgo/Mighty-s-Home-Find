-- Shared choices and prices for every bed. Image variants remain visual concepts.
create table if not exists public.catalogue_options (
  id integer primary key default 1 check (id = 1),
  sizes jsonb not null,
  designs jsonb not null,
  colours jsonb not null,
  updated_at timestamptz not null default now(),
  constraint valid_sizes check (jsonb_typeof(sizes) = 'array'),
  constraint valid_designs check (jsonb_typeof(designs) = 'array'),
  constraint valid_colours check (jsonb_typeof(colours) = 'array')
);
insert into public.catalogue_options (id, sizes, designs, colours) values (
  1,
  '[{"id":"4x6","label":"4×6","price":600000},{"id":"5x6","label":"5×6","price":700000},{"id":"6x6","label":"6×6","price":800000}]'::jsonb,
  '["Classic spindle","Modern minimal","Floral scroll","Heavy duty","Bunk frame","Triple decker"]'::jsonb,
  '["Matte Black","White","Graphite Grey","Antique Bronze","Deep Navy"]'::jsonb
) on conflict (id) do nothing;
alter table public.catalogue_options enable row level security;
create policy "anyone reads shared catalogue options" on public.catalogue_options for select to anon, authenticated using (true);
create policy "staff update shared catalogue options" on public.catalogue_options for update to authenticated using (public.is_catalogue_staff()) with check (public.is_catalogue_staff());
grant select on public.catalogue_options to anon, authenticated;
grant update on public.catalogue_options to authenticated;
