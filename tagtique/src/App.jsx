import React, { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import WhatsAppButton from './components/WhatsAppButton';

const HomePage = lazy(() => import('./pages/HomePage'));
const CartPage = lazy(() => import('./pages/CartPage'));
const OrderConfirmationPage = lazy(() => import('./pages/OrderConfirmationPage'));
const PublicProfilePage = lazy(() => import('./pages/PublicProfilePage'));
const ProductPage = lazy(() => import('./pages/ProductPage'));
const NfcCardPage = lazy(() => import('./pages/NfcCardPage'));
const NfcSetupPage = lazy(() => import('./pages/NfcSetupPage'));
const NfcPublicProfilePage = lazy(() => import('./pages/NfcPublicProfilePage'));
const CatalogPage = lazy(() => import('./pages/CatalogPage'));
const QrScanHubPage = lazy(() => import('./pages/QrScanHubPage'));

// Scroll to top on every route change
function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const id = hash.replace('#', '');
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
        return;
      }
    }
    window.scrollTo(0, 0);
  }, [pathname, hash]);

  return null;
}

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Tagtique App Error:', error, errorInfo);
  }

  handleReset = () => {
    try {
      localStorage.clear();
    } catch (_) {}
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#FDF7EC] flex items-center justify-center p-6 text-[#2E1B10]">
          <div className="max-w-md w-full bg-[#FAF3E0] border border-[#2E1B10]/15 rounded-3xl p-8 shadow-xl text-center flex flex-col items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#F5B21F]/20 text-[#B87A00] flex items-center justify-center text-2xl font-bold">
              !
            </div>
            <h1 className="text-2xl font-extrabold font-baloo">Something went wrong</h1>
            <p className="text-sm text-[#2E1B10]/80">
              An unexpected render issue occurred. You can safely return to the home page or reload.
            </p>
            {this.state.error && (
              <pre className="text-xs bg-[#F5E6CC]/60 p-3 rounded-xl max-h-28 overflow-y-auto text-left w-full font-mono text-red-900 break-words">
                {String(this.state.error?.message || this.state.error)}
              </pre>
            )}
            <div className="flex flex-col sm:flex-row gap-3 w-full mt-2">
              <a
                href="/"
                className="flex-1 py-2.5 px-4 rounded-full bg-[#2E1B10] text-[#FDF7EC] font-bold text-sm hover:opacity-90 transition-opacity"
              >
                Return to Store
              </a>
              <button
                type="button"
                onClick={this.handleReset}
                className="flex-1 py-2.5 px-4 rounded-full bg-[#F5B21F] text-[#2E1B10] font-extrabold text-sm hover:opacity-90 transition-opacity"
              >
                Reset & Reload
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function AppContent() {
  return (
    <div className="min-h-screen flex flex-col bg-[#08090D] text-white selection:bg-amber-400 selection:text-black">
      <Navbar />
      
      <main className="flex-1 pt-[68px]">
        <ErrorBoundary>
          <Suspense fallback={<div className="min-h-[50vh]" />}>
          <Routes>
            {/* Home Page & Catalog */}
            <Route path="/" element={<HomePage />} />
            <Route path="/catalog" element={<CatalogPage />} />
            <Route path="/shop" element={<CatalogPage />} />
            <Route path="/product/:slug" element={<ProductPage />} />
            <Route path="/nfc-card/:designId" element={<NfcCardPage />} />
            <Route path="/nfc-card/:designId/setup" element={<NfcSetupPage />} />
            <Route path="/setup/:cardId" element={<NfcSetupPage />} />
            <Route path="/nfc-setup/:profileId" element={<NfcSetupPage />} />
            <Route path="/nfc/setup" element={<NfcSetupPage />} />
            <Route path="/profile/:profileId" element={<NfcPublicProfilePage />} />
            <Route path="/p/:profileId" element={<NfcPublicProfilePage />} />

            {/* Unified Luxury Cart & Checkout */}
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<CartPage />} />
            <Route path="/order" element={<CartPage />} />

            {/* Dedicated Order Confirmation Receipt */}
            <Route path="/order-confirmation" element={<OrderConfirmationPage />} />

            {/* Dynamic Smart QR & Barcode Activation / Contact Pages */}
            <Route path="/scan" element={<QrScanHubPage />} />
            <Route path="/tag/:tagId" element={<QrScanHubPage />} />
            <Route path="/qr/:tagId" element={<QrScanHubPage />} />
            <Route path="/activate/:tagId" element={<QrScanHubPage />} />

            {/* Legacy Profile Card Route */}
            <Route path="/card/:username" element={<PublicProfilePage />} />

            {/* Fallback */}
            <Route path="*" element={<HomePage />} />
          </Routes>
          </Suspense>
        </ErrorBoundary>
      </main>

      <Footer />
      <WhatsAppButton />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <CartProvider>
        <ScrollToTop />
        <AppContent />
      </CartProvider>
    </BrowserRouter>
  );
}
