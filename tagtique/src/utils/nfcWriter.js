import { buildNdefRecords, parseCompactJson, parseReadableText, parseNfcReading } from './nfcPayload.js';

export function isWebNfcSupported() {
  return typeof window !== 'undefined' && 'NDEFReader' in window && window.isSecureContext !== false;
}

export function explainNfcError(error) {
  const name = error?.name || '';
  const message = String(error?.message || '');
  if (name === 'NotSupportedError' || /not supported|unavailable/i.test(message)) {
    return 'This phone or browser cannot write NFC tags. Use Chrome on Android, or copy the payload into an NFC writing app, then come back and use Read & verify.';
  }
  if (/user activation|user gesture/i.test(message)) {
    return 'Press Rewrite NFC tag again and keep the chip against the phone until Chrome finishes. Do not switch apps while it writes.';
  }
  if (name === 'InvalidStateError') {
    return 'The phone was already using NFC. Turn NFC off and on, then press Rewrite NFC tag again and hold the chip still.';
  }
  if (name === 'NotAllowedError') {
    return 'NFC permission was blocked. Turn on NFC, allow this site to use it, and try again.';
  }
  if (name === 'SecurityError' || /secure context|https/i.test(message)) {
    return 'NFC writing only works on a secure page (https). Open the live Tagtique admin site.';
  }
  if (/read-?only|locked|not writable/i.test(message)) {
    return 'This NFC tag is locked or read-only, so it cannot be rewritten.';
  }
  if (/memory|too large|capacity|insufficient|size/i.test(message)) {
    return 'This NFC chip does not have enough free memory. Use an NTAG215 or NTAG216 tag.';
  }
  if (name === 'NotReadableError') {
    return 'The tag could not be read. Hold the phone flat on the chip and try again.';
  }
  if (name === 'AbortError') {
    return 'NFC was cancelled before it finished. The tag was not marked as synced.';
  }
  if (name === 'NetworkError') {
    return 'The phone lost contact with the chip. Keep it still on the tag until writing finishes.';
  }
  if (name === 'TimeoutError') {
    return 'The tag was not read back in time. It is not marked as synced. Use Read & verify while holding the phone on the chip.';
  }
  if (name === 'VerifyMismatch') {
    return 'The chip was read, but the numbers, tag ID, or URL do not match the saved record. It is not marked as synced.';
  }
  return message || 'NFC did not finish. The physical tag was not marked as synced.';
}

function decodeRecordData(record) {
  if (typeof record.data === 'string') return record.data;
  try {
    const encoding = record.encoding || 'utf-8';
    return new TextDecoder(encoding).decode(record.data);
  } catch {
    return '';
  }
}

export function readingFromNdefMessage(message) {
  let text = '';
  let url = '';
  let jsonText = '';
  for (const record of message?.records || []) {
    const type = record.recordType;
    if (type === 'text' && !text) text = decodeRecordData(record);
    if (type === 'url' && !url) url = typeof record.data === 'string' ? record.data : decodeRecordData(record);
    if (type === 'mime' && String(record.mediaType || '').includes('json')) {
      jsonText = decodeRecordData(record);
    }
  }
  return { text, url, jsonText, parsed: parseNfcReading({ text, url, jsonText }) };
}

function readOnce(timeoutMs) {
  const reader = new window.NDEFReader();
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      const error = new Error('Timed out waiting for the NFC tag.');
      error.name = 'TimeoutError';
      reject(error);
    }, timeoutMs);
    reader.onreading = (event) => {
      clearTimeout(timer);
      resolve(readingFromNdefMessage(event.message));
    };
    reader.onreadingerror = () => {
      clearTimeout(timer);
      const error = new Error('Could not read the NFC tag.');
      error.name = 'NotReadableError';
      reject(error);
    };
    reader.scan().catch((error) => {
      clearTimeout(timer);
      reject(error);
    });
  });
}

export function startNfcWrite(payload) {
  if (!isWebNfcSupported()) {
    const error = new Error('Web NFC is not available in this browser.');
    error.name = 'NotSupportedError';
    throw error;
  }
  const reader = new window.NDEFReader();
  return reader.write({ records: buildNdefRecords(payload) });
}

export async function writeNfcPayload(payload) {
  await startNfcWrite(payload);
}

export async function readNfcTag(timeoutMs = 20000) {
  if (!isWebNfcSupported()) {
    const error = new Error('Web NFC is not available in this browser.');
    error.name = 'NotSupportedError';
    throw error;
  }
  return readOnce(timeoutMs);
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function readBackAfterWrite() {
  await wait(700);
  try {
    return await readNfcTag(20000);
  } catch (error) {
    if (error?.name !== 'InvalidStateError') throw error;
    await wait(900);
    return readNfcTag(20000);
  }
}

export { parseCompactJson, parseReadableText };
