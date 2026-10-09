import test from 'node:test';
import assert from 'node:assert/strict';
import { buildScanUrl } from './scanUrl.js';
import {
  buildNdefRecords,
  buildPayload,
  estimateNdefBytes,
  nfcPageUrl,
  normalizeTagCode,
  parseNfcReading,
  payloadsMatch,
  suggestNextTagCode
} from './nfcPayload.js';

test('existing QR scan links stay on /scan', () => {
  assert.equal(buildScanUrl('tgt-token'), '/scan?token=tgt-token');
});

test('permanent NFC id and URL do not change when contacts change', () => {
  const before = buildPayload({
    tagCode: 'tag-000001',
    ownerName: 'Ali',
    ownerPhone: '03001234567',
    guardianName: 'Sara',
    guardianPhone: '03007654321',
    payloadVersion: 2
  });
  const after = buildPayload({
    tagCode: 'TAG-000001',
    ownerName: 'Ali',
    ownerPhone: '03009990000',
    guardianName: 'Sara',
    guardianPhone: '03007654321',
    payloadVersion: 3
  });
  assert.equal(before.id, 'TAG-000001');
  assert.equal(after.id, before.id);
  assert.equal(after.url, before.url);
  assert.equal(after.url, nfcPageUrl('TAG-000001'));
  assert.notEqual(after.ownerPhone, before.ownerPhone);
  assert.equal(after.guardianPhone, before.guardianPhone);
});

test('suggesting the next id does not rename existing tags', () => {
  const existing = ['TAG-000001', 'TAG-000004'];
  assert.equal(suggestNextTagCode(existing), 'TAG-000005');
  assert.deepEqual(existing, ['TAG-000001', 'TAG-000004']);
});

test('invalid ids are rejected and phone formats still match', () => {
  assert.equal(normalizeTagCode('tag 000001'), '');
  assert.equal(normalizeTagCode('TAG-000001'), 'TAG-000001');
  const expected = buildPayload({
    tagCode: 'TAG-000001',
    ownerName: 'Ali',
    ownerPhone: '+923001234567',
    guardianName: 'Sara',
    guardianPhone: '03007654321'
  });
  const read = parseNfcReading({
    text: '',
    url: expected.url,
    jsonText: JSON.stringify({
      v: 1,
      id: 'TAG-000001',
      on: 'Ali',
      op: '03001234567',
      gn: 'Sara',
      gp: '+923007654321',
      u: expected.url,
      t: expected.updated
    })
  });
  assert.equal(payloadsMatch(read, expected), true);
  read.ownerPhone = '+923000000000';
  assert.equal(payloadsMatch(read, expected), false);
});

test('text record alone can recover both phone numbers', () => {
  const payload = buildPayload({
    tagCode: 'TAG-000009',
    ownerName: 'Ali',
    ownerPhone: '03001111111',
    guardianName: 'Sara',
    guardianPhone: '03002222222'
  });
  const records = buildNdefRecords(payload);
  const textRec = records.find((r) => r.recordType === 'text');
  const urlRec = records.find((r) => r.recordType === 'url');
  assert.equal(records[0].recordType, 'url');
  assert.equal(records[1].recordType, 'text');
  assert.match(textRec.data, /OP:\+923001111111/);
  assert.match(textRec.data, /GP:\+923002222222/);
  assert.equal(records.some((record) => record.recordType === 'mime'), false);
  const parsed = parseNfcReading({ text: textRec.data, url: urlRec.data });
  assert.equal(payloadsMatch(parsed, payload), true);
});

test('a normal vehicle record fits a small NFC chip', () => {
  const payload = buildPayload({
    tagCode: 'TAG-000001',
    ownerName: 'Tayyab Maqsood',
    ownerPhone: '03006625199',
    guardianName: 'Sara Ahmed',
    guardianPhone: '03001234567'
  });
  const records = buildNdefRecords(payload);
  assert.ok(estimateNdefBytes(payload, { includeJson: false }) <= 144);
  const textRec = records.find((r) => r.recordType === 'text');
  const urlRec = records.find((r) => r.recordType === 'url');
  const parsed = parseNfcReading({ text: textRec.data, url: urlRec.data });
  assert.equal(parsed.ownerPhone, '+923006625199');
  assert.equal(parsed.guardianPhone, '+923001234567');
  assert.equal(parsed.id, 'TAG-000001');
  assert.equal(parsed.url, payload.url);
});

test('write is requested before the function waits', async () => {
  const calls = [];
  globalThis.window = {
    isSecureContext: true,
    NDEFReader: class {
      write() {
        calls.push('write');
        return Promise.resolve();
      }
    }
  };
  const { startNfcWrite } = await import('./nfcWriter.js');
  const pending = startNfcWrite(buildPayload({
    tagCode: 'TAG-000001',
    ownerName: 'Tayyab Maqsood',
    ownerPhone: '03006625199'
  }));
  assert.deepEqual(calls, ['write']);
  await pending;
  delete globalThis.window;
});
