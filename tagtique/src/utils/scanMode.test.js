import test from 'node:test';
import assert from 'node:assert/strict';
import { decideScanResult, isUnassignedTag } from './scanMode.js';

test('a successful lookup with internet opens the web page', () => {
  assert.equal(decideScanResult({ lookupOk: true }), 'page');
});

test('no internet opens the phone dialer even if a saved record exists', () => {
  assert.equal(decideScanResult({ browserOffline: true, lookupOk: true }), 'dial');
  assert.equal(decideScanResult({ networkFailed: true, lookupOk: true }), 'dial');
});

test('stock and blank owner numbers count as first-time setup', () => {
  assert.equal(isUnassignedTag({ registrationNumber: 'STOCK-004', phoneNumber: '03000000000' }), true);
  assert.equal(isUnassignedTag({ ownerName: 'Unassigned Inventory', registrationNumber: 'UNASSIGNED' }), true);
  assert.equal(isUnassignedTag({ registrationNumber: 'LEA-1234', phoneNumber: '03001234567', ownerName: 'Ali' }), false);
});

test('an online miss stays on the not-found page and does not dial', () => {
  assert.equal(decideScanResult({ lookupOk: false, networkFailed: false }), 'not_found');
});
