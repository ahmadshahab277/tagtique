-- Adds the printed QR id onto an NFC tag. Safe to run after the first NFC migration.
alter table public.nfc_tags add column if not exists qr_code_value text not null default '';

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

insert into private.app_secrets (key, value)
values ('admin_password', 'tagtique-admin')
on conflict (key) do update set value = excluded.value;
