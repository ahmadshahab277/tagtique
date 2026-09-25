/**
 * Opens the phone's own SIM dialer, SMS app, or WhatsApp.
 * The QR still stores only a token. The number comes from the vehicle record.
 */
export function toInternationalDigits(raw) {
  if (!raw) return '';
  let digits = String(raw).replace(/\D/g, '');
  if (!digits) return '';
  if (digits.startsWith('00')) digits = digits.slice(2);
  if (digits.startsWith('0')) digits = `92${digits.slice(1)}`;
  return digits;
}

export function telUrl(raw) {
  const digits = toInternationalDigits(raw);
  return digits ? `tel:+${digits}` : '';
}

export function smsUrl(raw, text) {
  const digits = toInternationalDigits(raw);
  if (!digits) return '';
  if (!text) return `sms:+${digits}`;
  return `sms:+${digits}?&body=${encodeURIComponent(text)}`;
}

export function whatsappUrl(raw, text) {
  const digits = toInternationalDigits(raw);
  if (!digits) return '';
  const base = `https://wa.me/${digits}`;
  return text ? `${base}?text=${encodeURIComponent(text)}` : base;
}

export function whatsappCallUrl(raw) {
  const digits = toInternationalDigits(raw);
  return digits ? `https://wa.me/call/${digits}` : '';
}
