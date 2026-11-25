-- Keep a staff-attributed history of shared checkout prices and option changes.
drop trigger if exists catalogue_audit on public.catalogue_options;
create trigger catalogue_audit after update on public.catalogue_options
for each row execute function public.log_catalogue_change();
