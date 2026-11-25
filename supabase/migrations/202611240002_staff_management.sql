-- Owner-managed staff and invitation lifecycle. Apply through the reviewed Supabase CLI workflow.
alter table public.staff_profiles add column if not exists email text;
alter table public.staff_profiles add column if not exists is_active boolean not null default true;
alter table public.staff_profiles add column if not exists invitation_status text not null default 'accepted';
alter table public.staff_profiles add column if not exists invited_at timestamptz;

update public.staff_profiles p set email = u.email from auth.users u where u.id = p.user_id and p.email is null;
do $$ begin
  if exists (select 1 from public.staff_profiles where email is null) then
    raise exception 'Every existing staff account needs an email address before applying staff management.';
  end if;
end $$;
alter table public.staff_profiles alter column email set not null;
alter table public.staff_profiles drop constraint if exists staff_profiles_invitation_status_check;
alter table public.staff_profiles add constraint staff_profiles_invitation_status_check check (invitation_status in ('pending','accepted','revoked'));
create unique index if not exists staff_profiles_email_lower_unique on public.staff_profiles (lower(email));

create or replace function public.is_catalogue_staff() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.staff_profiles where user_id = (select auth.uid()) and is_active and invitation_status = 'accepted')
$$;
create or replace function public.is_catalogue_owner() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.staff_profiles where user_id = (select auth.uid()) and is_active and invitation_status = 'accepted' and role = 'owner')
$$;
revoke all on function public.is_catalogue_staff() from public;
revoke all on function public.is_catalogue_owner() from public;
grant execute on function public.is_catalogue_staff() to authenticated;
grant execute on function public.is_catalogue_owner() to authenticated;

create or replace function public.protect_last_staff_owner() returns trigger
language plpgsql security definer set search_path = '' as $$
declare active_owners integer;
begin
  if tg_op = 'DELETE' then
    if old.role = 'owner' and old.is_active and old.invitation_status = 'accepted' then
      perform pg_advisory_xact_lock(73190421, 1);
      select count(*) into active_owners from public.staff_profiles where role = 'owner' and is_active and invitation_status = 'accepted';
      if active_owners <= 1 then raise exception 'The last active owner cannot be removed.' using errcode = '23514'; end if;
    end if;
    return old;
  end if;
  if old.role = 'owner' and old.is_active and old.invitation_status = 'accepted'
    and (new.role <> 'owner' or not new.is_active or new.invitation_status <> 'accepted') then
    perform pg_advisory_xact_lock(73190421, 1);
    select count(*) into active_owners from public.staff_profiles where role = 'owner' and is_active and invitation_status = 'accepted';
    if active_owners <= 1 then raise exception 'The last active owner cannot be demoted, deactivated, or revoked.' using errcode = '23514'; end if;
  end if;
  return new;
end $$;
drop trigger if exists staff_profiles_protect_last_owner on public.staff_profiles;
create trigger staff_profiles_protect_last_owner before update or delete on public.staff_profiles for each row execute function public.protect_last_staff_owner();

create or replace function public.log_staff_profile_change() returns trigger
language plpgsql security definer set search_path = '' as $$
declare before_row jsonb; after_row jsonb; entity_key text;
begin
  if tg_op <> 'INSERT' then before_row := to_jsonb(old); end if;
  if tg_op <> 'DELETE' then after_row := to_jsonb(new); end if;
  entity_key := coalesce(after_row->>'user_id', before_row->>'user_id', '');
  if tg_op = 'INSERT' then
    insert into public.catalogue_audit_log(actor_id, action, entity_table, entity_id, before_data, after_data)
      values ((select auth.uid()), case when new.invitation_status = 'pending' then 'staff_invited' else 'staff_provisioned' end, 'staff_profiles', entity_key, null, after_row);
  elsif tg_op = 'DELETE' then
    if old.invitation_status = 'revoked' then return old; end if;
    insert into public.catalogue_audit_log(actor_id, action, entity_table, entity_id, before_data, after_data)
      values ((select auth.uid()), case when old.invitation_status = 'pending' then 'staff_invitation_revoked' else 'staff_removed' end, 'staff_profiles', entity_key, before_row, null);
  else
    if old.invitation_status is distinct from new.invitation_status and new.invitation_status = 'revoked' then
      insert into public.catalogue_audit_log(actor_id, action, entity_table, entity_id, before_data, after_data) values ((select auth.uid()), 'staff_invitation_revoked', 'staff_profiles', entity_key, before_row, after_row);
    end if;
    if old.role is distinct from new.role then
      insert into public.catalogue_audit_log(actor_id, action, entity_table, entity_id, before_data, after_data) values ((select auth.uid()), 'staff_role_changed', 'staff_profiles', entity_key, before_row, after_row);
    end if;
    if old.is_active is distinct from new.is_active then
      insert into public.catalogue_audit_log(actor_id, action, entity_table, entity_id, before_data, after_data) values ((select auth.uid()), case when new.is_active then 'staff_reactivated' else 'staff_deactivated' end, 'staff_profiles', entity_key, before_row, after_row);
    end if;
    if old.invitation_status is distinct from new.invitation_status and new.invitation_status <> 'revoked' then
      insert into public.catalogue_audit_log(actor_id, action, entity_table, entity_id, before_data, after_data) values ((select auth.uid()), 'staff_invitation_accepted', 'staff_profiles', entity_key, before_row, after_row);
    end if;
  end if;
  if tg_op = 'DELETE' then return old; else return new; end if;
end $$;
drop trigger if exists staff_profiles_audit on public.staff_profiles;
create trigger staff_profiles_audit after insert or update or delete on public.staff_profiles for each row execute function public.log_staff_profile_change();

drop policy if exists "staff read own profile" on public.staff_profiles;
create policy "staff read own profile" on public.staff_profiles for select to authenticated using (user_id = (select auth.uid()) or public.is_catalogue_owner());
drop policy if exists "owners manage staff profiles" on public.staff_profiles;
create policy "owners manage staff profiles" on public.staff_profiles for all to authenticated using (public.is_catalogue_owner()) with check (public.is_catalogue_owner());
grant select, insert, update, delete on public.staff_profiles to authenticated;

create or replace function public.accept_staff_invitation() returns void
language plpgsql security definer set search_path = '' as $$
begin
  update public.staff_profiles set invitation_status = 'accepted' where user_id = (select auth.uid()) and is_active and invitation_status = 'pending';
  if not found then raise exception 'No active pending staff invitation was found.' using errcode = '42501'; end if;
end $$;
revoke all on function public.accept_staff_invitation() from public;
grant execute on function public.accept_staff_invitation() to authenticated;

create or replace function public.record_staff_management_action(p_action text, p_entity_id text, p_before jsonb default null, p_after jsonb default null) returns void
language plpgsql security definer set search_path = '' as $$
begin
  if not public.is_catalogue_owner() then raise exception 'Owner access required.' using errcode = '42501'; end if;
  if p_action not in ('staff_invitation_resent','staff_invitation_resend_failed') then raise exception 'Unsupported staff audit action.' using errcode = '22023'; end if;
  insert into public.catalogue_audit_log(actor_id, action, entity_table, entity_id, before_data, after_data)
  values ((select auth.uid()), p_action, 'staff_profiles', p_entity_id, p_before, p_after);
end $$;
revoke all on function public.record_staff_management_action(text,text,jsonb,jsonb) from public;
grant execute on function public.record_staff_management_action(text,text,jsonb,jsonb) to authenticated;
