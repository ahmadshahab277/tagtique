import { toInternationalDigits } from './contactLinks.js';
import { buildScanUrl } from './scanUrl.js';

export function displayPhone(raw) {
  const digits = toInternationalDigits(raw);
  return digits ? `+${digits}` : '';
}

/**
 * Builds a vCard QR payload for vehicle stickers.
 *
 * Privacy Rule:
 * - If user number is PRIVATE: offline camera/dialer opens Tagtique support helpline (+923292082080).
 * - If user number is PUBLIC: offline camera/dialer opens the vehicle owner's direct phone number.
 * - When online, the embedded URL navigates to the vehicle profile page.
 */
export function buildVCardQrPayload({
  vehicleNumber = '',
  supportPhone = '03292082080',
  ownerPhone = '',
  isPrivate = true,
  token = ''
} = {}) {
  const cleanSupport = displayPhone(supportPhone) || '+923292082080';
  const cleanOwner = displayPhone(ownerPhone);
  const url = token
    ? buildScanUrl(token, {
        phonePrivacy: (!isPrivate && cleanOwner) ? 'public' : 'private',
        phone: cleanOwner,
        plate: vehicleNumber
      })
    : '';

  // Determine offline target phone based on privacy setting
  const offlinePhone = (!isPrivate && cleanOwner) ? cleanOwner : cleanSupport;
  const roleLabel = (!isPrivate && cleanOwner) ? 'Driver' : 'Support Helpline';

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
    !isPrivate && cleanOwner
      ? 'NOTE:Scan offline to call driver directly or tap URL online.'
      : 'NOTE:Private tag. Call helpline offline or tap URL online.'
  );
  lines.push('END:VCARD');

  return lines.join('\n');
}
