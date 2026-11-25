-- Bring the existing generated storefront designs into the editable catalogue.
-- They remain drafts because the prototype prices and product claims are illustrative.
insert into public.categories (name, slug, display_order, is_published) values
  ('King Beds', 'king-beds', 10, true),
  ('Queen Beds', 'queen-beds', 20, true),
  ('Double Beds', 'double-beds', 30, true),
  ('Triple Beds', 'triple-beds', 40, true),
  ('Kids’ Beds', 'kids-beds', 50, true),
  ('Bunk Beds', 'bunk-beds', 60, true)
on conflict (slug) do nothing;

with source (category_slug, slug, name, image_url) as (values
  ('bunk-beds', 'bunk-beds-design-01', 'Bunk Beds Bed Design 01', '/assets/bed-catalog-variants/bunk-beds/bunk-design-01-twin-over-twin-matte-black-dressed.webp'),
  ('bunk-beds', 'bunk-beds-design-02', 'Bunk Beds Bed Design 02', '/assets/bed-catalog-variants/bunk-beds/bunk-design-02-twin-over-full-white-dressed.webp'),
  ('double-beds', 'double-beds-design-01', 'Double Beds Bed Design 01', '/assets/bed-catalog-variants/double-beds/double-design-01-standard-matte-black-dressed.webp'),
  ('double-beds', 'double-beds-design-02', 'Double Beds Bed Design 02', '/assets/bed-catalog-variants/double-beds/double-design-02-standard-matte-black-dressed.webp'),
  ('kids-beds', 'kids-beds-design-01', 'Kids’ Beds Bed Design 01', '/assets/bed-catalog-variants/kids-beds/kids-design-01-junior-matte-black-dressed.webp'),
  ('king-beds', 'king-beds-design-01', 'King Beds Bed Design 01', '/assets/bed-catalog-variants/king-beds/king-design-01-standard-matte-black-dressed.webp'),
  ('king-beds', 'king-beds-design-02', 'King Beds Bed Design 02', '/assets/bed-catalog-variants/king-beds/king-design-02-standard-matte-black-dressed.webp'),
  ('queen-beds', 'queen-beds-design-01', 'Queen Beds Bed Design 01', '/assets/bed-catalog-variants/queen-beds/queen-design-01-standard-matte-black-dressed.webp'),
  ('queen-beds', 'queen-beds-design-02', 'Queen Beds Bed Design 02', '/assets/bed-catalog-variants/queen-beds/queen-design-02-standard-matte-black-dressed.webp'),
  ('triple-beds', 'triple-beds-design-01', 'Triple Beds Bed Design 01', '/assets/bed-catalog-variants/triple-beds/triple-design-01-narrow-matte-black-dressed.webp'),
  ('triple-beds', 'triple-beds-design-02', 'Triple Beds Bed Design 02', '/assets/bed-catalog-variants/triple-beds/triple-design-02-narrow-matte-black-dressed.webp')
)
insert into public.products (category_id, slug, name, short_description, status)
select c.id, s.slug, s.name, 'Imported storefront design. Review product details and pricing before publishing.', 'draft'
from source s join public.categories c on c.slug = s.category_slug
on conflict (slug) do nothing;

with source (slug, image_url) as (values
  ('bunk-beds-design-01', '/assets/bed-catalog-variants/bunk-beds/bunk-design-01-twin-over-twin-matte-black-dressed.webp'),
  ('bunk-beds-design-02', '/assets/bed-catalog-variants/bunk-beds/bunk-design-02-twin-over-full-white-dressed.webp'),
  ('double-beds-design-01', '/assets/bed-catalog-variants/double-beds/double-design-01-standard-matte-black-dressed.webp'),
  ('double-beds-design-02', '/assets/bed-catalog-variants/double-beds/double-design-02-standard-matte-black-dressed.webp'),
  ('kids-beds-design-01', '/assets/bed-catalog-variants/kids-beds/kids-design-01-junior-matte-black-dressed.webp'),
  ('king-beds-design-01', '/assets/bed-catalog-variants/king-beds/king-design-01-standard-matte-black-dressed.webp'),
  ('king-beds-design-02', '/assets/bed-catalog-variants/king-beds/king-design-02-standard-matte-black-dressed.webp'),
  ('queen-beds-design-01', '/assets/bed-catalog-variants/queen-beds/queen-design-01-standard-matte-black-dressed.webp'),
  ('queen-beds-design-02', '/assets/bed-catalog-variants/queen-beds/queen-design-02-standard-matte-black-dressed.webp'),
  ('triple-beds-design-01', '/assets/bed-catalog-variants/triple-beds/triple-design-01-narrow-matte-black-dressed.webp'),
  ('triple-beds-design-02', '/assets/bed-catalog-variants/triple-beds/triple-design-02-narrow-matte-black-dressed.webp')
)
insert into public.product_images (product_id, storage_path, image_url, alt_text, display_order, is_primary)
select p.id, 'bundled/' || p.slug || '.webp', s.image_url, p.name || ' generated dressed bed preview', 0, true
from source s join public.products p on p.slug = s.slug
where not exists (select 1 from public.product_images i where i.product_id = p.id and i.is_primary)
on conflict (storage_path) do nothing;
