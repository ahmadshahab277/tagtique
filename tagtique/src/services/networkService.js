/**
 * Classifies fetch failures so a scan can open the phone dialer
 * when the device has no internet.
 */

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
