-- Keep the person who made an edit identifiable after their Auth account is removed.
alter table public.catalogue_audit_log add column if not exists actor_email text;

update public.catalogue_audit_log a set actor_email = u.email
from auth.users u where a.actor_id = u.id and a.actor_email is null;

create or replace function public.snapshot_catalogue_actor() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if new.actor_id is not null and new.actor_email is null then
    select email into new.actor_email from auth.users where id = new.actor_id;
  end if;
  return new;
end $$;
drop trigger if exists catalogue_audit_actor_snapshot on public.catalogue_audit_log;
create trigger catalogue_audit_actor_snapshot before insert on public.catalogue_audit_log
for each row execute function public.snapshot_catalogue_actor();

create or replace function public.record_staff_removal(p_user_id uuid) returns void
language plpgsql security definer set search_path = '' as $$
declare target public.staff_profiles%rowtype;
begin
  if not public.is_catalogue_owner() then raise exception 'Owner access required.' using errcode = '42501'; end if;
  if p_user_id = (select auth.uid()) then raise exception 'You cannot remove your own account.' using errcode = '23514'; end if;
  select * into target from public.staff_profiles where user_id = p_user_id for update;
  if not found then raise exception 'Staff account not found.' using errcode = '02000'; end if;
  if target.role = 'owner' and target.is_active and target.invitation_status = 'accepted' then
    perform pg_advisory_xact_lock(73190421, 1);
    if (select count(*) from public.staff_profiles where role = 'owner' and is_active and invitation_status = 'accepted') <= 1 then
      raise exception 'The last active owner cannot be removed.' using errcode = '23514';
    end if;
  end if;
  insert into public.catalogue_audit_log(actor_id, action, entity_table, entity_id, before_data)
  values ((select auth.uid()), 'staff_removal_requested', 'staff_profiles', p_user_id::text, to_jsonb(target));
end $$;
revoke all on function public.record_staff_removal(uuid) from public;
grant execute on function public.record_staff_removal(uuid) to authenticated;
