/**
 * Tagtique Network Connectivity Service
 *
 * Fast, multi-tier online/offline detection for reliable QR scanning
 * behavior on mobile (iOS Safari & Android Chrome) and desktop browsers.
 */

const SUPABASE_PING_URL = 'https://vohtlwiowantxuevcubq.supabase.co/rest/v1/?_ping=';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZvaHRsd2lvd2FudHh1ZXZjdWJxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk5MDY3OTMsImV4cCI6MjEwNTQ4Mjc5M30.dKtFRurcGZAt1iAdlD6JOJM0cSwPVO3TogtqBAv4EOs';

export function isLikelyNetworkError(err) {
  if (!err) return false;
  const msg = String(err?.message || err || '').toLowerCase();
  return (
    msg.includes('failed to fetch') ||
    msg.includes('load failed') ||
    msg.includes('networkerror') ||
    msg.includes('network request failed') ||
    msg.includes('offline') ||
    msg.includes('net::err_') ||
    msg.includes('timeout') ||
    msg.includes('aborted') ||
    msg.includes('network_timeout') ||
    msg.includes('econnrefused') ||
    msg.includes('enotfound')
  );
}

/**
 * Accurately determines if the device currently has active internet connectivity.
 * Avoids relying solely on `navigator.onLine` which can falsely return true when
 * disconnected from internet.
 *
 * @returns {Promise<boolean>} true if online, false if offline
 */
export async function checkIsOnline() {
  // 1. Fast check: if the browser explicitly declares offline, return false immediately
  if (typeof navigator !== 'undefined' && navigator.onLine === false) {
    return false;
  }

  // 2. Fast network probe with 2000ms timeout
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 2000);

    const res = await fetch(`${SUPABASE_PING_URL}${Date.now()}`, {
      method: 'HEAD',
      headers: { apikey: SUPABASE_ANON_KEY },
      signal: controller.signal
    });
    clearTimeout(timer);
    return res.status >= 200 && res.status < 500;
  } catch (err) {
    // 3. Fallback universal internet probe with 1500ms timeout
    try {
      const controller2 = new AbortController();
      const timer2 = setTimeout(() => controller2.abort(), 1500);

      await fetch(`https://www.google.com/generate_204?_ping=${Date.now()}`, {
        mode: 'no-cors',
        cache: 'no-store',
        signal: controller2.signal
      });
      clearTimeout(timer2);
      return true;
    } catch (_) {
      // Both external network attempts failed — device has no internet access
      return false;
    }
  }
}
