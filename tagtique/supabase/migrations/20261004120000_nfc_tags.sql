-- NFC tags sit beside the existing QR `tags` table.
-- This migration does not alter customers, vehicles, orders, or QR tags.

create schema if not exists private;

create table if not exists private.app_secrets (
  key text primary key,
  value text not null
);

revoke all on schema private from public, anon, authenticated;
revoke all on table private.app_secrets from public, anon, authenticated;

create or replace function private.assert_nfc_admin(p_password text)
returns void
language plpgsql
security definer
set search_path = public, private
as $$
declare
  expected text;
begin
  select value into expected
  from private.app_secrets
  where key = 'admin_password';

  if expected is null or btrim(expected) = '' then
    raise exception 'NFC admin password is not set in Supabase';
  end if;

  if p_password is null or p_password <> expected then
    raise exception 'Not allowed';
  end if;
end;
$$;

revoke all on function private.assert_nfc_admin(text) from public, anon, authenticated;

create or replace function public.nfc_digits(raw text)
returns text
language sql
immutable
as $$
  select case
    when digits = '' then ''
    when digits like '00%' then substring(digits from 3)
    when digits like '0%' then '92' || substring(digits from 2)
    else digits
  end
  from (
    select regexp_replace(coalesce(raw, ''), '\D', '', 'g') as digits
  ) cleaned;
$$;

create table if not exists public.nfc_tags (
  id uuid primary key default gen_random_uuid(),
  tag_code text not null,
  owner_name text not null default '',
  owner_phone text not null default '',
  guardian_name text not null default '',
  guardian_phone text not null default '',
  vehicle_label text not null default '',
  customer_name text not null default '',
  vehicle_id uuid null,
  qr_code_value text not null default '',
  status text not null default 'unassigned',
  sync_status text not null default 'unverified',
  payload_version integer not null default 1,
  contacts_updated_at timestamptz null,
  last_verified_at timestamptz null,
  programmed_owner_name text null,
  programmed_owner_phone text null,
  programmed_guardian_name text null,
  programmed_guardian_phone text null,
  programmed_url text null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint nfc_tags_tag_code_key unique (tag_code),
  constraint nfc_tags_tag_code_format check (tag_code ~ '^TAG-[A-Z0-9]{1,24}$'),
  constraint nfc_tags_status_check check (status in ('active', 'unassigned', 'lost', 'replaced', 'disabled')),
  constraint nfc_tags_sync_check check (sync_status in ('synced', 'update_required', 'unverified', 'disabled'))
);

create index if not exists nfc_tags_status_idx on public.nfc_tags (status);

create table if not exists public.nfc_tag_audit (
  id uuid primary key default gen_random_uuid(),
  tag_code text not null,
  action text not null,
  detail jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists nfc_tag_audit_code_idx on public.nfc_tag_audit (tag_code, created_at desc);

alter table public.nfc_tags enable row level security;
alter table public.nfc_tag_audit enable row level security;

-- No policies: the anon key cannot read or write these tables directly.
-- Public pages use get_public_nfc_tag. Admin writes use password-checked functions.

create or replace function public.nfc_tag_json(p_code text)
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select json_build_object(
    'id', id,
    'tagCode', tag_code,
    'ownerName', owner_name,
    'ownerPhone', owner_phone,
    'guardianName', guardian_name,
    'guardianPhone', guardian_phone,
    'vehicleLabel', vehicle_label,
    'customerName', customer_name,
    'vehicleId', vehicle_id,
    'qrCode', qr_code_value,
    'status', status,
    'syncStatus', sync_status,
    'payloadVersion', payload_version,
    'contactsUpdatedAt', contacts_updated_at,
    'lastVerifiedAt', last_verified_at,
    'programmedOwnerName', programmed_owner_name,
    'programmedOwnerPhone', programmed_owner_phone,
    'programmedGuardianName', programmed_guardian_name,
    'programmedGuardianPhone', programmed_guardian_phone,
    'programmedUrl', programmed_url,
    'createdAt', created_at,
    'updatedAt', updated_at
  )::jsonb
  from public.nfc_tags
  where tag_code = upper(trim(p_code));
$$;

create or replace function public.get_public_nfc_tag(p_tag_code text)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  row public.nfc_tags%rowtype;
  code text := upper(trim(coalesce(p_tag_code, '')));
begin
  if code !~ '^TAG-[A-Z0-9]{1,24}$' then
    return jsonb_build_object('found', false, 'status', 'missing');
  end if;

  select * into row from public.nfc_tags where tag_code = code;
  if not found then
    return jsonb_build_object('found', false, 'status', 'missing');
  end if;

  if row.status <> 'active' then
    return jsonb_build_object('found', false, 'status', row.status, 'tagCode', row.tag_code);
  end if;

  return jsonb_build_object(
    'found', true,
    'status', 'active',
    'tagCode', row.tag_code,
    'ownerName', row.owner_name,
    'ownerPhone', row.owner_phone,
    'guardianName', row.guardian_name,
    'guardianPhone', row.guardian_phone,
    'vehicleLabel', row.vehicle_label
  );
end;
$$;

create or replace function public.admin_list_nfc_tags(p_password text)
returns jsonb
language plpgsql
security definer
set search_path = public, private
as $$
begin
  perform private.assert_nfc_admin(p_password);
  return coalesce(
    (
      select jsonb_agg(public.nfc_tag_json(tag_code) order by tag_code)
      from public.nfc_tags
    ),
    '[]'::jsonb
  );
end;
$$;

create or replace function public.admin_save_nfc_tag(p_password text, p_payload jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public, private
as $$
declare
  v_code text := upper(trim(coalesce(p_payload->>'tagCode', '')));
  v_status text := coalesce(nullif(trim(coalesce(p_payload->>'status', '')), ''), 'unassigned');
  v_owner_name text := trim(coalesce(p_payload->>'ownerName', ''));
  v_owner_phone text := trim(coalesce(p_payload->>'ownerPhone', ''));
  v_guardian_name text := trim(coalesce(p_payload->>'guardianName', ''));
  v_guardian_phone text := trim(coalesce(p_payload->>'guardianPhone', ''));
  v_vehicle_label text := trim(coalesce(p_payload->>'vehicleLabel', ''));
  v_customer_name text := trim(coalesce(p_payload->>'customerName', ''));
  v_qr_code text := trim(coalesce(p_payload->>'qrCode', ''));
  v_vehicle_raw text := nullif(trim(coalesce(p_payload->>'vehicleId', '')), '');
  v_vehicle_id uuid := null;
  existing public.nfc_tags%rowtype;
  v_sync text;
  matches_chip boolean;
begin
  perform private.assert_nfc_admin(p_password);

  if v_code !~ '^TAG-[A-Z0-9]{1,24}$' then
    raise exception 'Tag ID must look like TAG-000001';
  end if;
  if v_status not in ('active', 'unassigned', 'lost', 'replaced', 'disabled') then
    raise exception 'Invalid tag status';
  end if;
  if v_vehicle_raw is not null and v_vehicle_raw ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' then
    v_vehicle_id := v_vehicle_raw::uuid;
  end if;

  select * into existing from public.nfc_tags where tag_code = v_code;

  if not found then
    insert into public.nfc_tags (
      tag_code, owner_name, owner_phone, guardian_name, guardian_phone,
      vehicle_label, customer_name, vehicle_id, qr_code_value, status, sync_status,
      payload_version, contacts_updated_at, updated_at
    ) values (
      v_code, v_owner_name, v_owner_phone, v_guardian_name, v_guardian_phone,
      v_vehicle_label, v_customer_name, v_vehicle_id, v_qr_code, v_status,
      case when v_status = 'disabled' then 'disabled' else 'unverified' end,
      1, now(), now()
    );
    insert into public.nfc_tag_audit (tag_code, action, detail)
    values (v_code, 'register', jsonb_build_object('status', v_status));
  else
    matches_chip := existing.last_verified_at is not null
      and public.nfc_digits(v_owner_phone) = public.nfc_digits(existing.programmed_owner_phone)
      and public.nfc_digits(v_guardian_phone) = public.nfc_digits(existing.programmed_guardian_phone)
      and lower(v_owner_name) = lower(coalesce(existing.programmed_owner_name, ''))
      and lower(v_guardian_name) = lower(coalesce(existing.programmed_guardian_name, ''));

    if v_status = 'disabled' then
      v_sync := 'disabled';
    elsif matches_chip then
      v_sync := 'synced';
    elsif existing.last_verified_at is null then
      v_sync := 'unverified';
    else
      v_sync := 'update_required';
    end if;

    update public.nfc_tags set
      owner_name = v_owner_name,
      owner_phone = v_owner_phone,
      guardian_name = v_guardian_name,
      guardian_phone = v_guardian_phone,
      vehicle_label = v_vehicle_label,
      customer_name = v_customer_name,
      vehicle_id = v_vehicle_id,
      qr_code_value = v_qr_code,
      status = v_status,
      sync_status = v_sync,
      payload_version = payload_version + 1,
      contacts_updated_at = now(),
      updated_at = now()
    where tag_code = v_code;

    insert into public.nfc_tag_audit (tag_code, action, detail)
    values (
      v_code,
      'save',
      jsonb_build_object('status', v_status, 'syncStatus', v_sync)
    );
  end if;

  return public.nfc_tag_json(v_code);
end;
$$;

create or replace function public.admin_bulk_register_nfc_tags(p_password text, p_codes text[])
returns jsonb
language plpgsql
security definer
set search_path = public, private
as $$
declare
  raw text;
  code text;
  created text[] := array[]::text[];
  skipped text[] := array[]::text[];
begin
  perform private.assert_nfc_admin(p_password);

  foreach raw in array coalesce(p_codes, array[]::text[])
  loop
    code := upper(trim(coalesce(raw, '')));
    if code = '' then
      continue;
    elsif code !~ '^TAG-[A-Z0-9]{1,24}$' then
      skipped := skipped || code;
    elsif exists (select 1 from public.nfc_tags where tag_code = code) then
      skipped := skipped || code;
    else
      insert into public.nfc_tags (tag_code, status, sync_status)
      values (code, 'unassigned', 'unverified');
      created := created || code;
      insert into public.nfc_tag_audit (tag_code, action, detail)
      values (code, 'bulk_register', '{}'::jsonb);
    end if;
  end loop;

  return jsonb_build_object('created', to_jsonb(created), 'skipped', to_jsonb(skipped));
end;
$$;

create or replace function public.admin_verify_nfc_tag(p_password text, p_tag_code text, p_read jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public, private
as $$
declare
  code text := upper(trim(coalesce(p_tag_code, '')));
  row public.nfc_tags%rowtype;
  read_id text := upper(trim(coalesce(p_read->>'id', '')));
  read_url text := regexp_replace(trim(coalesce(p_read->>'url', '')), '/$', '');
  expected_url text;
  names_ok boolean;
  phones_ok boolean;
  id_ok boolean;
  url_ok boolean;
  matched boolean;
  next_sync text;
begin
  perform private.assert_nfc_admin(p_password);
  select * into row from public.nfc_tags where tag_code = code;
  if not found then
    raise exception 'Tag not found';
  end if;

  expected_url := regexp_replace(trim(coalesce(p_read->>'expectedUrl', '')), '/$', '');

  phones_ok := public.nfc_digits(p_read->>'ownerPhone') = public.nfc_digits(row.owner_phone)
    and public.nfc_digits(p_read->>'guardianPhone') = public.nfc_digits(row.guardian_phone);
  names_ok := lower(trim(coalesce(p_read->>'ownerName', ''))) = lower(trim(row.owner_name))
    and lower(trim(coalesce(p_read->>'guardianName', ''))) = lower(trim(row.guardian_name));
  id_ok := read_id = row.tag_code;
  url_ok := expected_url <> '' and read_url = expected_url and expected_url like '%/nfc/' || row.tag_code;
  matched := phones_ok and names_ok and id_ok and url_ok and row.status <> 'disabled';

  if matched then
    update public.nfc_tags set
      sync_status = 'synced',
      last_verified_at = now(),
      programmed_owner_name = owner_name,
      programmed_owner_phone = owner_phone,
      programmed_guardian_name = guardian_name,
      programmed_guardian_phone = guardian_phone,
      programmed_url = read_url,
      updated_at = now()
    where tag_code = code;
    insert into public.nfc_tag_audit (tag_code, action, detail)
    values (code, 'verify_success', jsonb_build_object('url', read_url));
    return jsonb_build_object('synced', true, 'tag', public.nfc_tag_json(code));
  end if;

  if row.sync_status = 'update_required' then
    next_sync := 'update_required';
  elsif row.sync_status = 'disabled' or row.status = 'disabled' then
    next_sync := 'disabled';
  else
    next_sync := 'unverified';
  end if;

  update public.nfc_tags set
    sync_status = next_sync,
    updated_at = now()
  where tag_code = code;

  insert into public.nfc_tag_audit (tag_code, action, detail)
  values (code, 'verify_failed', jsonb_build_object(
    'phonesOk', phones_ok,
    'namesOk', names_ok,
    'idOk', id_ok,
    'urlOk', url_ok
  ));

  return jsonb_build_object(
    'synced', false,
    'tag', public.nfc_tag_json(code),
    'message', 'The physical tag does not match the saved owner number, guardian number, tag ID, and URL.'
  );
end;
$$;

create or replace function public.admin_list_nfc_audit(p_password text, p_tag_code text)
returns jsonb
language plpgsql
security definer
set search_path = public, private
as $$
declare
  code text := upper(trim(coalesce(p_tag_code, '')));
begin
  perform private.assert_nfc_admin(p_password);
  return coalesce(
    (
      select jsonb_agg(jsonb_build_object(
        'action', action,
        'detail', detail,
        'createdAt', created_at
      ) order by created_at desc)
      from (
        select action, detail, created_at
        from public.nfc_tag_audit
        where tag_code = code
        order by created_at desc
        limit 12
      ) recent
    ),
    '[]'::jsonb
  );
end;
$$;

revoke all on function public.nfc_digits(text) from public, anon, authenticated;
revoke all on function public.nfc_tag_json(text) from public, anon, authenticated;
revoke all on function public.get_public_nfc_tag(text) from public;
revoke all on function public.admin_list_nfc_tags(text) from public;
revoke all on function public.admin_save_nfc_tag(text, jsonb) from public;
revoke all on function public.admin_bulk_register_nfc_tags(text, text[]) from public;
revoke all on function public.admin_verify_nfc_tag(text, text, jsonb) from public;
revoke all on function public.admin_list_nfc_audit(text, text) from public;

grant execute on function public.get_public_nfc_tag(text) to anon, authenticated;
grant execute on function public.admin_list_nfc_tags(text) to anon, authenticated;
grant execute on function public.admin_save_nfc_tag(text, jsonb) to anon, authenticated;
grant execute on function public.admin_bulk_register_nfc_tags(text, text[]) to anon, authenticated;
grant execute on function public.admin_verify_nfc_tag(text, text, jsonb) to anon, authenticated;
grant execute on function public.admin_list_nfc_audit(text, text) to anon, authenticated;
