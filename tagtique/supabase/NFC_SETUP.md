# NFC setup

Do not paste this page into the Supabase SQL editor. It is notes, not SQL. Paste `supabase/migrations/20261004161000_nfc_qr_link.sql` instead.

QR stickers keep using `/scan?token=...` and the existing `tags` table. NFC uses a separate `nfc_tags` table and `/nfc/TAG-000001`.

The production contact domain is `https://qr-car.netlify.app` unless `VITE_PUBLIC_SITE_URL` is set. Set that variable in Netlify and in `.env.local` if the live domain is different, then rebuild. A tag written from localhost still uses this permanent domain, so the URL does not change when a phone number changes.

## 1. Run the migration

In the Supabase SQL editor, run:

`supabase/migrations/20261004120000_nfc_tags.sql`

If that file was already run, also run `supabase/migrations/20261004161000_nfc_qr_link.sql`. That adds the printed QR id so a scanned sticker can be stored on the NFC tag.

This does not change `customers`, `vehicles`, `orders`, or QR `tags`.

## 2. Store the admin password in the database

The admin page already checks `VITE_ADMIN_PASSWORD` in the browser. NFC writes also check that same password inside Postgres, so the anon key cannot edit tags by itself.

In the Supabase SQL editor, set the secret to the same value as `VITE_ADMIN_PASSWORD`. Do not commit the password.

```sql
insert into private.app_secrets (key, value)
values ('admin_password', 'the-same-value-as-VITE_ADMIN_PASSWORD')
on conflict (key) do update set value = excluded.value;
```

`private.app_secrets` is not exposed to the public API. The service-role key stays off the website.

Row Level Security is enabled on `nfc_tags` and `nfc_tag_audit` with no direct policies. Visitors can only call `get_public_nfc_tag`, which returns the owner and guardian contacts for an active tag. Disabled, lost, replaced, unassigned, and missing tags do not return phone numbers. Admin changes go through password-checked functions and are written to `nfc_tag_audit`.

## 3. Netlify

`netlify.toml` and `public/_redirects` already send every path to `index.html`, so `/nfc/:tagId` works without a new redirect. No hosting service was added.

Rebuild and publish the site after setting `VITE_PUBLIC_SITE_URL` and `VITE_ADMIN_PASSWORD` in the Netlify environment. Those values are baked into the frontend at build time.

## What gets written on the chip

The permanent ID and URL are not stored as a new identity when contacts change. A rewrite replaces the NDEF records and keeps `TAG-000001` and `https://YOUR_DOMAIN/nfc/TAG-000001`.

Records, in order:

1. Text record, which a reader can show with no internet:
   - ID
   - owner name and phone
   - guardian name and phone
   - permanent URL
   - updated time and version
2. URL record for the online page.
3. Compact JSON (`application/json`) when the message is about 450 bytes or less.

Use NTAG215 or NTAG216. NTAG213 is usually too small for both numbers plus the URL. Locked or read-only chips are reported as an error and are not marked Synced.

Web NFC works in Chrome on Android over HTTPS, after a tap on Rewrite or Read & verify. It does not work in iPhone Safari or on most desktop browsers. Those browsers get a copyable payload for an external NFC tool. The tag is marked Synced only after a read-back matches the owner number, guardian number, tag ID, and URL. Saving in Supabase never marks the chip Synced.

## What phones do with a tap

This was checked against current Web NFC and phone NFC behavior, not against a physical chip in this workspace.

- Android, online: the URL record normally opens `/nfc/TAG-000001`, which loads the latest contacts from Supabase.
- Android, offline: the browser cannot load that page. The text record is on the chip. Some phones show it in the NFC tag sheet; others only try the URL and fail. A standard NFC reader app can show the text record, including both numbers, with no app install from Tagtique and no earlier visit to the site.
- iPhone, online: the system notification opens the URL. iOS does not show custom text records in the system sheet.
- iPhone, offline: the notification cannot open the website. iOS will not show the stored phone numbers by itself. An NFC reader app that displays NDEF text can. Do not describe the chip as a custom offline webpage.

The online page never treats a cached copy as current. If the phone is offline, it says the chip holds the fallback copy.

## Status

- Synced: the last read-back matched the saved contacts.
- Update required: a saved contact changed after that verification. The website is new. The chip may still hold the old numbers.
- Unverified: the chip has not been confirmed.
- Disabled: the tag is off. The public page does not show numbers.

## Checks that need a physical tag

Automated tests cover ID stability, phone matching, the text record, and the existing QR `/scan` link. They do not write a chip.

On hardware, confirm:

- Chrome on Android can rewrite and read back one tag without changing its ID or URL.
- An external write can be confirmed with Read & verify.
- A locked tag and a small NTAG213 show an error and stay Update required or Unverified.
- Airplane mode on Android and iPhone behaves as described above.
- An existing QR sticker still opens `/scan` and shows the current QR contact.
