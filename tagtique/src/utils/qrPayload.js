import { toInternationalDigits } from './contactLinks.js';
import { buildScanUrl } from './scanUrl.js';

export function displayPhone(raw) {
  const digits = toInternationalDigits(raw);
  return digits ? `+${digits}` : '';
}

/**
 * Builds a vCard QR payload for vehicle stickers.
 *
 * The owner number is public. Offline dials that number.
 * When online, the embedded URL opens the vehicle page.
 */
export function buildVCardQrPayload({
  vehicleNumber = '',
  supportPhone = '03292082080',
  ownerPhone = '',
  token = ''
} = {}) {
  const cleanSupport = displayPhone(supportPhone) || '+923292082080';
  const cleanOwner = displayPhone(ownerPhone);
  const url = token
    ? buildScanUrl(token, {
        phonePrivacy: 'public',
        phone: cleanOwner,
        plate: vehicleNumber
      })
    : '';

  // Determine offline target phone based on privacy setting
  const offlinePhone = cleanOwner || cleanSupport;
  const roleLabel = cleanOwner ? 'Driver' : 'Support Helpline';

  const lines = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `FN:Tagtique ${vehicleNumber ? vehicleNumber.toUpperCase() : 'Vehicle'} (${roleLabel})`,
    'ORG:Tagtique Vehicle Assistance',
    `TEL;TYPE=CELL,VOICE:${offlinePhone}`
  ];

  if (url) {
    lines.push(`URL:${url}`);
  }

  lines.push(
    cleanOwner
      ? 'NOTE:Scan offline to call driver directly or tap URL online.'
      : 'NOTE:No owner number saved. Call support or open the page online.'
  );
  lines.push('END:VCARD');

  return lines.join('\n');
}
