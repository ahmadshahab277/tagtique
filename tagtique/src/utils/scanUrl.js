/**
 * Public scan link encoded inside a QR image.
 * Uses the live site origin so the phone opens this app's /scan page,
 * not a hardcoded domain.
 */
export function getPublicSiteOrigin() {
  const fromEnv = import.meta.env.VITE_PUBLIC_SITE_URL;
  if (fromEnv && String(fromEnv).trim()) {
    return String(fromEnv).trim().replace(/\/$/, '');
  }
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin;
  }
  return '';
}

export function buildScanUrl(token) {
  const origin = getPublicSiteOrigin();
  const safeToken = encodeURIComponent(token || '');
  return `${origin}/scan?token=${safeToken}`;
}
