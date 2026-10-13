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

  if (found) {
    const isPublic = found.phonePrivacy === 'public';
    if (isPublic && found.phoneNumber) {
      return {
        phoneNumber: found.phoneNumber,
        isPrivate: false,
        vehicleLabel: found.vehicleNumber || token,
        title: 'Calling Vehicle Owner',
        subtitle: `You scanned vehicle ${found.vehicleNumber ? found.vehicleNumber.toUpperCase() : ''} offline. Direct contact is enabled. Tap below to call the owner directly.`
      };
    }
    return {
      phoneNumber: supportPhone,
      isPrivate: true,
      vehicleLabel: found.vehicleNumber || token,
      title: 'Routing to Vehicle Support',
      subtitle: 'This vehicle owner\'s number is kept private for security. Tap below to reach Tagtique Support to contact the driver.'
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

function renderOfflineHtml(target) {
  const { phoneNumber, vehicleLabel, title, subtitle, isPrivate } = target;
  const cleanPhone = String(phoneNumber || '03292082080').trim();

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
  <div class="badge">⚠️ Offline Mode</div>
  ${vehicleLabel ? `<div class="tag-chip">Vehicle: ${vehicleLabel}</div>` : ''}
  <div class="icon-box">📞</div>
  <h1>${title}</h1>
  <p>${subtitle}</p>
  
  <a id="dialer" class="call-btn" href="tel:${cleanPhone}">
    <span class="btn-label">${isPrivate ? 'Tap to Call Support Helpline' : 'Tap to Call Driver Directly'}</span>
    <span class="btn-phone">${cleanPhone}</span>
  </a>

  <div class="hint">📞 Tap anywhere on screen to launch call</div>
  <button class="retry-btn" onclick="window.location.reload()">Retry With Internet</button>

  <script>
    (function() {
      var tel = 'tel:' + ${JSON.stringify(cleanPhone)};
      try { window.location.href = tel; } catch(e) {}
      function triggerDial() {
        try { window.location.href = tel; } catch(e) {}
      }
      window.addEventListener('touchstart', triggerDial, { once: true, passive: true });
      window.addEventListener('click', triggerDial, { once: true });
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
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response && response.status === 200) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          }
          return response;
        })
        .catch(async () => {
          // Device is offline! Resolve target phone and serve instant dial screen
          const target = await resolveOfflineTarget(event.request.url);
          return new Response(renderOfflineHtml(target), {
            status: 200,
            headers: {
              'Content-Type': 'text/html; charset=utf-8',
              'Cache-Control': 'no-store'
            }
          });
        })
    );
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
