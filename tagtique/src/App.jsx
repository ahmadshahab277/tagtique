import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import WhatsAppButton from './components/WhatsAppButton';

// Dedicated Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import OrderPage from './pages/OrderPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderConfirmationPage from './pages/OrderConfirmationPage';
import PublicProfilePage from './pages/PublicProfilePage';
import PublicVehicleScanPage from './pages/PublicVehicleScanPage';
import AdminRoute from './components/AdminRoute';

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
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');
  const isPublicScan =
    location.pathname.startsWith('/scan') ||
    location.pathname.startsWith('/tag') ||
    location.pathname.startsWith('/u/');
  const isStandalone = isAdmin || isPublicScan;

  return (
    <div className="min-h-screen bg-tag-bg text-tag-brown flex flex-col selection:bg-tag-amber selection:text-tag-brown-deep">
      {!isStandalone && <Navbar />}
      
      <main className="flex-1">
        <ErrorBoundary>
          <Routes>
            {/* Home Page */}
            <Route path="/" element={<HomePage />} />

            {/* Dedicated Auth Pages */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />

            {/* Dedicated Customizer / Order Page */}
            <Route path="/order" element={<OrderPage />} />

            {/* Dedicated Address & Checkout Page */}
            <Route path="/checkout" element={<CheckoutPage />} />

            {/* Dedicated Order Confirmation Receipt */}
            <Route path="/order-confirmation" element={<OrderConfirmationPage />} />

            {/* Dedicated Smart Vehicle QR Communication Page */}
            <Route path="/scan" element={<PublicVehicleScanPage />} />
            <Route path="/tag/:tagId" element={<PublicVehicleScanPage />} />
            <Route path="/u/:username" element={<PublicVehicleScanPage />} />

            {/* Legacy Profile Card Route */}
            <Route path="/card/:username" element={<PublicProfilePage />} />

            {/* Admin console. The page stays unmounted until the admin session is valid. */}
            <Route path="/admin" element={<AdminRoute />} />

            {/* Fallback */}
            <Route path="*" element={<HomePage />} />
          </Routes>
        </ErrorBoundary>
      </main>

      {!isStandalone && <Footer />}
      {!isStandalone && <WhatsAppButton />}
    </div>
  );
}

export default function App() {
  return (
    <CartProvider>
      <BrowserRouter>
        <ScrollToTop />
        <AppContent />
      </BrowserRouter>
    </CartProvider>
  );
}
