-- Product details already shown by the storefront become editable by staff.
alter table public.products
  add column if not exists material text,
  add column if not exists care text,
  add column if not exists included text,
  add column if not exists delivery_note text;
