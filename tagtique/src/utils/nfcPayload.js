import { toInternationalDigits } from './contactLinks.js';

/**
 * Permanent NFC links use the production site so a tag written from
 * localhost still opens the live contact page. QR sticker links are unchanged.
 */
const DEFAULT_ORIGIN = 'https://qr-car.netlify.app';

export function nfcSiteOrigin() {
  const env = import.meta.env || {};
  const fromEnv = env.VITE_PUBLIC_SITE_URL;
  if (fromEnv && String(fromEnv).trim()) {
    return String(fromEnv).trim().replace(/\/$/, '');
  }
  return DEFAULT_ORIGIN;
}

export function normalizeTagCode(raw) {
  const code = String(raw || '').trim().toUpperCase().replace(/\s+/g, '');
  if (!/^TAG-[A-Z0-9]{1,24}$/.test(code)) return '';
  return code;
}

export function suggestNextTagCode(codes) {
  let max = 0;
  for (const code of codes || []) {
    const match = /^TAG-(\d+)$/.exec(String(code || '').toUpperCase());
    if (match) max = Math.max(max, Number(match[1]));
  }
  return `TAG-${String(max + 1).padStart(6, '0')}`;
}

export function nfcPageUrl(tagCode) {
  const code = normalizeTagCode(tagCode);
  if (!code) return '';
  return `${nfcSiteOrigin()}/nfc/${code}`;
}

export function displayPhone(raw) {
  const digits = toInternationalDigits(raw);
  return digits ? `+${digits}` : '';
}

export function buildPayload(tag) {
  const tagCode = normalizeTagCode(tag?.tagCode || tag?.tag_code);
  return {
    id: tagCode,
    ownerName: String(tag?.ownerName || tag?.owner_name || '').trim(),
    ownerPhone: displayPhone(tag?.ownerPhone || tag?.owner_phone),
    guardianName: String(tag?.guardianName || tag?.guardian_name || '').trim(),
    guardianPhone: displayPhone(tag?.guardianPhone || tag?.guardian_phone),
    url: nfcPageUrl(tagCode),
    updated: tag?.contactsUpdatedAt || tag?.updatedAt || new Date().toISOString(),
    version: Number(tag?.payloadVersion || tag?.payload_version || 1)
  };
}

function clipName(value) {
  return String(value || '').trim().slice(0, 18);
}

/** Short text so an NTAG213 (about 144 bytes) can hold both numbers plus the URL record. */
export function buildReadableText(payload) {
  return [
    `ID:${payload.id || ''}`,
    `OP:${payload.ownerPhone || ''}`,
    `ON:${clipName(payload.ownerName)}`,
    `GP:${payload.guardianPhone || ''}`,
    `GN:${clipName(payload.guardianName)}`
  ].join('\n');
}

export function buildCompactJson(payload) {
  return JSON.stringify({
    v: payload.version || 1,
    id: payload.id || '',
    on: payload.ownerName || '',
    op: payload.ownerPhone || '',
    gn: payload.guardianName || '',
    gp: payload.guardianPhone || '',
    u: payload.url || '',
    t: payload.updated || ''
  });
}

function cleanUrl(url) {
  return String(url || '').trim().replace(/\/$/, '');
}

export function parseReadableText(text) {
  const lines = String(text || '').split(/\r?\n/);
  const pick = (...labels) => {
    for (const label of labels) {
      const line = lines.find((item) => item.toUpperCase().startsWith(`${label}:`));
      if (line) return line.slice(label.length + 1).trim();
    }
    return '';
  };
  const id = normalizeTagCode(pick('ID'));
  const ownerPhone = pick('OWNER_PHONE', 'OP');
  const guardianPhone = pick('GUARDIAN_PHONE', 'GP');
  if (!id && !ownerPhone && !guardianPhone) return null;
  return {
    id,
    ownerName: pick('OWNER', 'ON'),
    ownerPhone,
    guardianName: pick('GUARDIAN', 'GN'),
    guardianPhone,
    url: pick('URL'),
    updated: pick('UPDATED'),
    version: Number(pick('VERSION') || 0)
  };
}

export function parseCompactJson(raw) {
  try {
    const data = typeof raw === 'string' ? JSON.parse(raw) : raw;
    if (!data || typeof data !== 'object') return null;
    const id = normalizeTagCode(data.id);
    if (!id) return null;
    return {
      id,
      ownerName: String(data.on || ''),
      ownerPhone: String(data.op || ''),
      guardianName: String(data.gn || ''),
      guardianPhone: String(data.gp || ''),
      url: String(data.u || ''),
      updated: String(data.t || ''),
      version: Number(data.v || 0)
    };
  } catch {
    return null;
  }
}

export function parseNfcReading({ text = '', url = '', jsonText = '' } = {}) {
  const fromJson = parseCompactJson(jsonText);
  const fromText = parseReadableText(text);
  const base = fromJson || fromText;
  if (!base && !url) return null;
  const merged = {
    id: base?.id || '',
    ownerName: base?.ownerName || '',
    ownerPhone: base?.ownerPhone || '',
    guardianName: base?.guardianName || '',
    guardianPhone: base?.guardianPhone || '',
    url: cleanUrl(base?.url || url),
    updated: base?.updated || '',
    version: base?.version || 0
  };
  if (!merged.id && !merged.ownerPhone && !merged.guardianPhone && !merged.url) return null;
  return merged;
}

export function payloadsMatch(read, expected) {
  if (!read || !expected) return false;
  return (
    normalizeTagCode(read.id) === normalizeTagCode(expected.id) &&
    cleanUrl(read.url) === cleanUrl(expected.url) &&
    toInternationalDigits(read.ownerPhone) === toInternationalDigits(expected.ownerPhone) &&
    toInternationalDigits(read.guardianPhone) === toInternationalDigits(expected.guardianPhone) &&
    String(read.ownerName || '').trim().toLowerCase() === String(expected.ownerName || '').trim().toLowerCase() &&
    String(read.guardianName || '').trim().toLowerCase() === String(expected.guardianName || '').trim().toLowerCase()
  );
}

function shortRecordSize(payloadLength) {
  return 4 + payloadLength;
}

export function estimateNdefBytes(payload, { includeJson = false } = {}) {
  const text = buildReadableText(payload);
  const url = String(payload.url || '').replace(/^https:\/\//, '');
  let total = 3;
  total += shortRecordSize(1 + 2 + text.length);
  total += shortRecordSize(1 + url.length);
  if (includeJson) total += shortRecordSize(buildCompactJson(payload).length + 'application/json'.length);
  return total;
}

/**
 * URL record opens the site when the phone is online.
 * Text record keeps both numbers on the chip for offline reading.
 * JSON is left off the chip so a small NTAG213 can be rewritten.
 */
export function buildNdefRecords(payload) {
  return [
    { recordType: 'text', data: buildReadableText(payload) },
    { recordType: 'url', data: payload.url }
  ];
}

export function readingForVerify(parsed, expected) {
  const acceptName = (chipName, fullName) => {
    const chip = String(chipName || '').trim().toLowerCase();
    const full = String(fullName || '').trim().toLowerCase();
    return !chip || full.startsWith(chip);
  };
  return {
    ...parsed,
    ownerName: acceptName(parsed?.ownerName, expected?.ownerName) ? expected?.ownerName || '' : parsed?.ownerName || '',
    guardianName: acceptName(parsed?.guardianName, expected?.guardianName) ? expected?.guardianName || '' : parsed?.guardianName || ''
  };
}

export function ndefIncludesJson(payload) {
  return buildNdefRecords(payload).some((record) => record.recordType === 'mime');
}
