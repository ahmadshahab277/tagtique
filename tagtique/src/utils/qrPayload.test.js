import test from 'node:test';
import assert from 'node:assert/strict';
import { buildVCardQrPayload, displayPhone } from './qrPayload.js';

test('displayPhone normalizes local numbers to international format', () => {
  assert.equal(displayPhone('03001234567'), '+923001234567');
  assert.equal(displayPhone('03292082080'), '+923292082080');
});

test('vCard uses the owner number even when an older private flag is passed', () => {
  const vcard = buildVCardQrPayload({
    vehicleNumber: 'LEA-1234',
    supportPhone: '03292082080',
    ownerPhone: '03001234567',
    isPrivate: true,
    token: 'tgt-abc'
  });

  assert.match(vcard, /BEGIN:VCARD/);
  assert.match(vcard, /TEL;TYPE=CELL,VOICE:\+923001234567/);
  assert.match(vcard, /privacy=public/);
  assert.match(vcard, /URL:.*\/scan\?token=tgt-abc/);
  assert.match(vcard, /END:VCARD/);
});

test('vCard uses owner number when privacy is public', () => {
  const vcard = buildVCardQrPayload({
    vehicleNumber: 'LEA-1234',
    supportPhone: '03292082080',
    ownerPhone: '03001234567',
    isPrivate: false,
    token: 'tgt-abc'
  });

  assert.match(vcard, /BEGIN:VCARD/);
  assert.match(vcard, /TEL;TYPE=CELL,VOICE:\+923001234567/);
  assert.match(vcard, /URL:.*\/scan\?token=tgt-abc/);
  assert.match(vcard, /END:VCARD/);
});

test('resolveQrPayload defaults to direct web URL so mobile cameras open the vehicle page directly', async () => {
  const { resolveQrPayload } = await import('./stickerImage.js');

  // Private tag payload
  const privatePayload = resolveQrPayload({
    qr_code_value: 'tgt-abc',
    vehicleNumber: 'LEA-1234',
    phoneNumber: '03001234567',
    phonePrivacy: 'private'
  });

  assert.match(privatePayload, /^https?:\/\//);
  assert.doesNotMatch(privatePayload, /^BEGIN:VCARD/);
  assert.match(privatePayload, /\/scan\?token=tgt-abc/);
  assert.match(privatePayload, /privacy=public/);
  assert.match(privatePayload, /phone=/);
  assert.match(privatePayload, /plate=LEA-1234/);

  // Public tag payload
  const publicPayload = resolveQrPayload({
    qr_code_value: 'tgt-xyz',
    vehicleNumber: 'ISB-999',
    phoneNumber: '03001234567',
    phonePrivacy: 'public'
  });

  assert.match(publicPayload, /^https?:\/\//);
  assert.doesNotMatch(publicPayload, /^BEGIN:VCARD/);
  assert.match(publicPayload, /\/scan\?token=tgt-xyz/);
  assert.match(publicPayload, /privacy=public/);
  assert.match(publicPayload, /phone=%2B923001234567|phone=03001234567/);
});
