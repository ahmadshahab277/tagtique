// Tagtique Offline Service Worker
// Provides zero-latency offline support for iPhone (iOS Safari) and Android.
// When an NFC tag or QR code is scanned without internet connectivity,
// it instantly routes to the Tagtique Support assistance line (03292082080).

const CACHE_NAME = 'tagtique-offline-v3';
const CORE_ASSETS = [
  '/',
  '/index.html'
];

const OFFLINE_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <meta name="theme-color" content="#1C120C">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <title>Tagtique Assistance | Offline Support</title>
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
      margin-bottom: 20px;
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
      margin: 0 auto 18px auto;
      box-shadow: 0 10px 25px -5px rgba(28, 18, 12, 0.25);
    }
    h1 {
      font-size: 24px;
      font-weight: 900;
      color: #1C120C;
      margin-bottom: 10px;
      line-height: 1.2;
    }
    p {
      font-size: 14px;
      color: #8C7A6B;
      line-height: 1.5;
      max-width: 340px;
      margin: 0 auto 22px auto;
    }
    .call-btn {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 4px;
      width: 100%;
      max-width: 340px;
      padding: 16px 20px;
      border-radius: 20px;
      background: linear-gradient(135deg, #1C120C 0%, #2E1F16 100%);
      color: #FDF7EC;
      text-decoration: none;
      box-shadow: 0 12px 28px -6px rgba(28, 18, 12, 0.4);
      border: 1.5px solid #E6AF2E;
      margin-bottom: 12px;
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
      font-weight: 800;
    }
    .btn-phone {
      font-size: 19px;
      font-weight: 900;
      letter-spacing: 0.5px;
      color: #FDF7EC;
    }
    .hint {
      font-size: 11px;
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
  <div class="badge">⚠️ No Internet Connection</div>
  <div class="icon-box">📞</div>
  <h1>Routing to Vehicle Support</h1>
  <p>You scanned this Tagtique tag while offline. Tap below to connect directly to our 24/7 vehicle assistance team to reach the owner.</p>
  
  <a id="dialer" class="call-btn" href="tel:03292082080">
    <span class="btn-label">Call Support Directly</span>
    <span class="btn-phone">0329-2082080</span>
  </a>

  <div class="hint">📞 Tap anywhere on screen to launch call</div>
  <button class="retry-btn" onclick="window.location.reload()">Retry Connection</button>

  <script>
    (function() {
      var tel = 'tel:03292082080';
      // Immediate attempt
      try { window.location.href = tel; } catch(e) {}

      // Gesture unlock for iOS Mobile Safari (Safari requires user interaction for tel: protocol)
      function triggerDial() {
        try { window.location.href = tel; } catch(e) {}
      }
      window.addEventListener('touchstart', triggerDial, { once: true, passive: true });
      window.addEventListener('click', triggerDial, { once: true });
    })();
  </script>
</body>
</html>`;

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(CORE_ASSETS).catch((err) => {
        console.warn('Service worker cache prefetch notice:', err);
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

// Network-First with Cache / Standalone Fallback for navigation requests
self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // For HTML navigations (like /scan, /nfc, /tag)
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // If online and response valid, cache copy
          if (response && response.status === 200) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          }
          return response;
        })
        .catch(async () => {
          // Network failed (device is offline!)
          // 1. Try cached page if available
          const cached = await caches.match(event.request, { ignoreSearch: true });
          if (cached) return cached;
          const fallback = await caches.match('/index.html');
          if (fallback) return fallback;
          const rootFallback = await caches.match('/');
          if (rootFallback) return rootFallback;

          // 2. Standalone fallback: Guaranteed offline support page for iPhone & Android
          return new Response(OFFLINE_HTML, {
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

  // Static assets: cache-falling-back-to-network
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
             url.pathname.endsWith('.woff2'))
          ) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          }
          return response;
        }).catch(() => {
          return cached;
        })
      );
    })
  );
});
