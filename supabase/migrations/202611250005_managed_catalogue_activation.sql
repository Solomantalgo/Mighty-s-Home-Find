-- Preserve the current public catalogue until the first managed product is published.
alter table public.catalogue_options add column if not exists managed_catalogue_live boolean not null default false;
create or replace function public.activate_managed_catalogue() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if new.status = 'published' then
    update public.catalogue_options set managed_catalogue_live = true where id = 1 and not managed_catalogue_live;
  end if;
  return new;
end $$;
drop trigger if exists activate_managed_catalogue on public.products;
create trigger activate_managed_catalogue after insert or update of status on public.products
for each row when (new.status = 'published') execute function public.activate_managed_catalogue();
update public.catalogue_options set managed_catalogue_live = true
where id = 1 and exists (select 1 from public.products where status = 'published');
