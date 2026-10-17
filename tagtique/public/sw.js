// Tagtique Offline Service Worker v5
// Guaranteed zero-dependency offline QR routing for iPhone (iOS Safari) and Android.
//
// Logic:
// - If user number is PRIVATE: offline routing dials Tagtique Support Helpline (03292082080).
// - If user number is PUBLIC: offline routing dials vehicle owner's direct phone number.

const CACHE_NAME = 'tagtique-offline-v6';
const CORE_ASSETS = [
  '/',
  '/index.html'
];

let inMemoryRegistry = {};
let activeSupportPhone = '03292082080';

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SYNC_TAG_REGISTRY') {
    if (event.data.registry && typeof event.data.registry === 'object') {
      inMemoryRegistry = { ...inMemoryRegistry, ...event.data.registry };
    }
    if (event.data.supportPhone) {
      activeSupportPhone = event.data.supportPhone;
    }
  }
});

async function resolveOfflineTarget(requestUrl) {
  let token = '';
  let urlObj = null;
  try {
    urlObj = new URL(requestUrl);
    token = urlObj.searchParams.get('token') ||
      urlObj.searchParams.get('tag') ||
      urlObj.searchParams.get('qr') ||
      '';
    if (!token) {
      const match = urlObj.pathname.match(/\/(?:tag|scan|u)\/([^/?#]+)/i);
      if (match) token = match[1];
    }
  } catch (_) {}

  // If URL explicitly encodes public privacy and direct phone, use it immediately
  if (urlObj) {
    const qPrivacy = urlObj.searchParams.get('privacy');
    const qPhone = urlObj.searchParams.get('phone');
    if (qPrivacy === 'public' && qPhone) {
      return {
        phoneNumber: qPhone,
        isPrivate: false,
        vehicleLabel: token || urlObj.searchParams.get('plate') || 'Vehicle',
        title: 'Calling Vehicle Owner',
        subtitle: `You scanned vehicle ${token ? token.toUpperCase() : ''} offline. Direct contact is enabled. Tap below to call the owner directly.`
      };
    }
  }

  // If memory registry is empty, attempt reading from cache storage
  if (Object.keys(inMemoryRegistry).length === 0) {
    try {
      const cached = await caches.match('/offline-tag-registry.json');
      if (cached) {
        const data = await cached.json();
        if (data && data.registry) inMemoryRegistry = data.registry;
        if (data && data.supportPhone) activeSupportPhone = data.supportPhone;
      }
    } catch (_) {}
  }

  const clean = String(token || '').trim().toLowerCase();
  let found = clean ? inMemoryRegistry[clean] : null;

  if (!found && clean) {
    const entries = Object.values(inMemoryRegistry);
    found = entries.find((r) => {
      if (!r) return false;
      const t = String(r.token || '').toLowerCase();
      const p = String(r.vehicleNumber || '').toLowerCase();
      return (t && (t === clean || clean.includes(t))) || (p && (p === clean || clean.includes(p)));
    });
  }

  const supportPhone = activeSupportPhone || '03292082080';

  if (found && found.phoneNumber) {
    return {
      phoneNumber: found.phoneNumber,
      isPrivate: false,
      vehicleLabel: found.vehicleNumber || token,
      title: 'Calling Vehicle Owner',
      subtitle: `You scanned vehicle ${found.vehicleNumber ? found.vehicleNumber.toUpperCase() : ''} offline. Tap below to call the owner.`
    };
  }

  if (found) {
    return {
      phoneNumber: supportPhone,
      isPrivate: false,
      vehicleLabel: found.vehicleNumber || token,
      title: 'Calling Vehicle Owner',
      subtitle: 'This sticker does not have an owner number saved yet. Tap below to call Tagtique support.'
    };
  }

  return {
    phoneNumber: supportPhone,
    isPrivate: true,
    vehicleLabel: token,
    title: 'Routing to Vehicle Support',
    subtitle: 'You scanned this vehicle tag while offline. Tap below to connect directly to Tagtique Support to reach the owner.'
  };
}

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function toTelHref(raw) {
  let digits = String(raw || '').replace(/\D/g, '');
  if (!digits) digits = '923292082080';
  if (digits.startsWith('00')) digits = digits.slice(2);
  if (digits.startsWith('0')) digits = '92' + digits.slice(1);
  return 'tel:+' + digits;
}

function renderOfflineHtml(target) {
  const { phoneNumber, vehicleLabel, title, subtitle, isPrivate } = target;
  const telHref = toTelHref(phoneNumber);
  const shownPhone = telHref.replace('tel:', '');
  const safeLabel = escapeHtml(vehicleLabel);
  const safeTitle = escapeHtml(title);
  const safeSubtitle = escapeHtml(subtitle);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <meta name="theme-color" content="#1C120C">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <title>Tagtique | Offline Call</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      background: #FAF7F2;
      color: #1C120C;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      padding: 24px;
      text-align: center;
      -webkit-font-smoothing: antialiased;
    }
    .badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 14px;
      border-radius: 9999px;
      background: #FEF3C7;
      border: 1px solid #FCD34D;
      color: #78350F;
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 0.5px;
      text-transform: uppercase;
      margin-bottom: 16px;
    }
    .tag-chip {
      display: inline-block;
      padding: 5px 14px;
      background: #FFFFFF;
      border: 1px solid #EAE3D6;
      border-radius: 12px;
      font-family: monospace;
      font-size: 13px;
      font-weight: 900;
      color: #1C120C;
      margin-bottom: 16px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.05);
    }
    .icon-box {
      width: 76px;
      height: 76px;
      border-radius: 24px;
      background: #1C120C;
      border: 2px solid #E6AF2E;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 34px;
      margin: 0 auto 16px auto;
      box-shadow: 0 10px 25px -5px rgba(28, 18, 12, 0.25);
    }
    h1 {
      font-size: 24px;
      font-weight: 900;
      color: #1C120C;
      margin-bottom: 8px;
      line-height: 1.2;
    }
    p {
      font-size: 14px;
      color: #8C7A6B;
      line-height: 1.5;
      max-width: 340px;
      margin: 0 auto 20px auto;
    }
    .call-btn {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 4px;
      width: 100%;
      max-width: 340px;
      padding: 18px 20px;
      border-radius: 20px;
      background: linear-gradient(135deg, #1C120C 0%, #2E1F16 100%);
      color: #FDF7EC;
      text-decoration: none;
      box-shadow: 0 12px 28px -6px rgba(28, 18, 12, 0.4);
      border: 2px solid #E6AF2E;
      margin-bottom: 14px;
      -webkit-tap-highlight-color: transparent;
      transition: transform 0.15s ease;
    }
    .call-btn:active {
      transform: scale(0.98);
      background: #2E1F16;
    }
    .btn-label {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #E6AF2E;
      font-weight: 900;
    }
    .btn-phone {
      font-size: 22px;
      font-weight: 900;
      letter-spacing: 0.5px;
      color: #FDF7EC;
      font-family: monospace;
    }
    .hint {
      font-size: 12px;
      color: #92400E;
      font-weight: 700;
      margin-bottom: 24px;
      animation: pulse 1.8s infinite;
    }
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.55; }
    }
    .retry-btn {
      padding: 12px 24px;
      border-radius: 14px;
      background: #FFFFFF;
      border: 1px solid #EAE3D6;
      color: #8C7A6B;
      font-size: 13px;
      font-weight: 700;
      cursor: pointer;
    }
  </style>
</head>
<body>
  <div class="badge">Offline</div>
  ${safeLabel ? `<div class="tag-chip">Vehicle: ${safeLabel}</div>` : ''}
  <div class="icon-box">📞</div>
  <h1>${safeTitle}</h1>
  <p>${safeSubtitle}</p>
  
  <a id="dialer" class="call-btn" href="${telHref}">
    <span class="btn-label">${isPrivate ? 'Tap to call support' : 'Tap to call the owner'}</span>
    <span class="btn-phone">${shownPhone}</span>
  </a>

  <div class="hint">No internet. This opens the phone, not the website.</div>
  <button class="retry-btn" onclick="window.location.reload()">I have internet. Open the page</button>

  <script>
    (function() {
      var ios = /iPad|iPhone|iPod/i.test(navigator.userAgent || '');
      if (ios) return;
      var link = document.getElementById('dialer');
      if (link) link.click();
    })();
  </script>
</body>
</html>`;
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(CORE_ASSETS).catch((err) => {
        console.warn('SW prefetch notice:', err);
      });
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// Network-First for navigation requests with instant smart offline caller fallback
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // For HTML navigations (/scan, /tag, /u, /)
  if (event.request.mode === 'navigate') {
    event.respondWith((async () => {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 5000);
      try {
        const response = await fetch(event.request, { signal: controller.signal });
        clearTimeout(timer);
        if (response && response.status === 200) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        }
        return response;
      } catch (_) {
        clearTimeout(timer);
        const target = await resolveOfflineTarget(event.request.url);
        return new Response(renderOfflineHtml(target), {
          status: 200,
          headers: {
            'Content-Type': 'text/html; charset=utf-8',
            'Cache-Control': 'no-store'
          }
        });
      }
    })());
    return;
  }

  // Static assets: cache-first with network fallback
  event.respondWith(
    caches.match(event.request).then((cached) => {
      return (
        cached ||
        fetch(event.request).then((response) => {
          if (
            response &&
            response.status === 200 &&
            (url.pathname.endsWith('.js') ||
             url.pathname.endsWith('.css') ||
             url.pathname.endsWith('.png') ||
             url.pathname.endsWith('.svg') ||
             url.pathname.endsWith('.woff2') ||
             url.pathname.endsWith('.json'))
          ) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          }
          return response;
        }).catch(() => cached)
      );
    })
  );
});
