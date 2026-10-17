import test from 'node:test';
import assert from 'node:assert/strict';
import { visibleProfileFields, fieldError, NFC_FIELDS } from './nfcProfile.js';

test('disabled NFC fields stay off the public profile', () => {
  const fields = Object.fromEntries(NFC_FIELDS.map((field) => [field.id, { enabled: false, value: 'kept' }]));
  fields.email = { enabled: true, value: 'ada@tagtique.test' };
  fields.phone = { enabled: true, value: '12' };
  const shown = visibleProfileFields({ fields });
  assert.deepEqual(shown.map((field) => field.id), ['email']);
  assert.equal(fieldError(NFC_FIELDS.find((field) => field.id === 'phone'), '12'), 'Enter a valid phone number.');
});
