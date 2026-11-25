-- The server-side secret key uses service_role, which still needs table grants.
-- Read access is used for catalogue reconciliation and production verification.
grant usage on schema public to service_role;
grant select on public.categories, public.products, public.variants,
  public.product_images, public.configurator_assets, public.catalogue_options
  to service_role;
