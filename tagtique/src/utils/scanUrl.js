/**
 * Public scan link encoded inside a QR image.
 * Uses the live site origin so the phone opens this app's /scan page,
 * not a hardcoded domain.
 */
export function getPublicSiteOrigin() {
  const env = (typeof import.meta !== 'undefined' && import.meta.env)
    ? import.meta.env
    : (typeof process !== 'undefined' ? process.env : {});
  const fromEnv = env?.VITE_PUBLIC_SITE_URL;
  if (fromEnv && String(fromEnv).trim()) {
    return String(fromEnv).trim().replace(/\/$/, '');
  }
  if (typeof window !== 'undefined' && window.location?.origin && !window.location.origin.includes('localhost') && !window.location.origin.includes('127.0.0.1')) {
    return window.location.origin;
  }
  // Universal production fallback so physical QR stickers always contain a valid public web URL
  return 'https://tagtiquefromhaider.netlify.app';
}

export function buildScanUrl(token, options = {}) {
  const origin = getPublicSiteOrigin();
  const safeToken = encodeURIComponent(token || '');
  let url = `${origin}/scan?token=${safeToken}`;
  if (options && options.phonePrivacy === 'public' && options.phone) {
    url += `&privacy=public&phone=${encodeURIComponent(options.phone)}`;
  } else if (options && options.phonePrivacy === 'private') {
    url += '&privacy=private';
  }
  if (options && options.plate) {
    url += `&plate=${encodeURIComponent(options.plate)}`;
  }
  return url;
}

