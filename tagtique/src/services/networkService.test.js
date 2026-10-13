import test from 'node:test';
import assert from 'node:assert/strict';
import { isLikelyNetworkError } from './networkService.js';

test('isLikelyNetworkError correctly flags real network and offline failure messages', () => {
  assert.equal(isLikelyNetworkError(new Error('Failed to fetch')), true);
  assert.equal(isLikelyNetworkError(new Error('NetworkError when attempting to fetch resource')), true);
  assert.equal(isLikelyNetworkError(new Error('NETWORK_TIMEOUT')), true);
  assert.equal(isLikelyNetworkError(new Error('net::ERR_INTERNET_DISCONNECTED')), true);
  assert.equal(isLikelyNetworkError(new Error('The user is offline')), true);
  assert.equal(isLikelyNetworkError(new Error('The operation was aborted')), true);
});

test('isLikelyNetworkError does not flag application domain errors', () => {
  assert.equal(isLikelyNetworkError(new Error('TAG_NOT_FOUND')), false);
  assert.equal(isLikelyNetworkError(new Error('Invalid plate format')), false);
  assert.equal(isLikelyNetworkError(null), false);
  assert.equal(isLikelyNetworkError(undefined), false);
});
