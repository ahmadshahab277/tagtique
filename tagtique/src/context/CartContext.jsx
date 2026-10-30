import React, { createContext, useContext, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, CheckCircle2, X, ArrowRight } from 'lucide-react';
import { findNfcDesign, NFC_DESIGNS } from '../data/nfcCards';

const CartContext = createContext();

function hydrateCartItem(item) {
  if (!item) return item;
  let image = item.image || item.src || null;
  const isNfc = item.type === 'nfc' || item.id?.startsWith('nfc-');
  if (!image && isNfc) {
    const nfcId = item.nfcId || item.id?.replace(/^nfc-/, '');
    const found = findNfcDesign(nfcId) || (NFC_DESIGNS || []).find((d) => d.name?.toLowerCase() === item.name?.toLowerCase());
    if (found?.frontImage) {
      image = found.frontImage;
    }
  }
  return {
    ...item,
    type: isNfc ? 'nfc' : (item.type || 'sticker'),
    image
  };
}

const DEFAULT_PROFILE = {
  name: '',
  title: '',
  organization: '',
  phone: '',
  email: '',
  instagram: '',
  whatsapp: '',
  bio: ''
};

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem('tagtique_cart');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.some(item => item?.engravedText === 'Ayesha Khan')) {
          localStorage.removeItem('tagtique_cart');
          return [];
        }
        return Array.isArray(parsed) ? parsed.map(hydrateCartItem) : [];
      }
      return [];
    } catch {
      return [];
    }
  });

  const [lastOrder, setLastOrder] = useState(() => {
    try {
      const saved = localStorage.getItem('tagtique_last_order');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [userProfile, setUserProfile] = useState(() => {
    try {
      const saved = localStorage.getItem('tagtique_user');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.name === 'Ayesha Khan') {
          localStorage.removeItem('tagtique_user');
          return DEFAULT_PROFILE;
        }
        return parsed || DEFAULT_PROFILE;
      }
      return DEFAULT_PROFILE;
    } catch {
      return DEFAULT_PROFILE;
    }
  });

  const [toast, setToast] = useState({ open: false, item: null });

  useEffect(() => {
    try {
      localStorage.setItem('tagtique_cart', JSON.stringify(cartItems));
    } catch (_) {}
  }, [cartItems]);

  useEffect(() => {
    try {
      if (lastOrder) {
        localStorage.setItem('tagtique_last_order', JSON.stringify(lastOrder));
      }
    } catch (_) {}
  }, [lastOrder]);

  useEffect(() => {
    try {
      localStorage.setItem('tagtique_user', JSON.stringify(userProfile));
    } catch (_) {}
  }, [userProfile]);

  // Auto-dismiss toast after 3.5 seconds
  useEffect(() => {
    if (!toast.open) return;
    const timer = setTimeout(() => {
      setToast({ open: false, item: null });
    }, 3500);
    return () => clearTimeout(timer);
  }, [toast.open]);

  const addToCart = (item) => {
    const hydrated = hydrateCartItem(item);
    const qty = Number(hydrated.quantity) || 1;
    const normalizedItem = {
      id: hydrated.id || `item-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      name: hydrated.name || 'Custom Smart Tag',
      category: hydrated.category || 'Custom Identity',
      type: hydrated.type || 'sticker',
      price: Number(hydrated.price || hydrated.totalPrice || 999),
      quantity: qty,
      accent: hydrated.accent || '#F59E0B',
      image: hydrated.image || null,
      badge: hydrated.badge || (hydrated.type === 'nfc' ? 'NFC Metal Card + Dynamic QR' : 'Glossy Vinyl Sticker')
    };

    setCartItems((prev) => {
      // Check if matching item is already in cart
      const existingIdx = prev.findIndex(
        (p) => (p.id === normalizedItem.id) || (p.name === normalizedItem.name && p.type === normalizedItem.type)
      );
      if (existingIdx !== -1) {
        const updated = [...prev];
        updated[existingIdx] = {
          ...updated[existingIdx],
          quantity: (Number(updated[existingIdx].quantity) || 1) + qty,
          price: normalizedItem.price
        };
        return updated;
      }
      return [normalizedItem, ...prev];
    });

    setToast({
      open: true,
      item: normalizedItem
    });
  };

  const updateQuantity = (index, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(index);
      return;
    }
    setCartItems((prev) => {
      const updated = [...prev];
      if (updated[index]) {
        updated[index] = { ...updated[index], quantity: newQuantity };
      }
      return updated;
    });
  };

  const removeFromCart = (index) => {
    setCartItems((prev) => prev.filter((_, i) => i !== index));
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const completeOrder = (orderData) => {
    setLastOrder(orderData);
    setCartItems([]);
  };

  const closeToast = () => {
    setToast({ open: false, item: null });
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        lastOrder,
        completeOrder,
        userProfile,
        setUserProfile,
        toast,
        closeToast
      }}
    >
      {children}

      {/* Global Interactive Add to Cart Toast Notification */}
      {toast.open && toast.item && (
        <aside
          role="status"
          aria-live="polite"
          className="fixed bottom-6 right-6 z-[999] max-w-sm w-[calc(100vw-3rem)] bg-[#12131A] border border-amber-400/40 rounded-2xl p-4 shadow-[0_15px_40px_rgba(0,0,0,0.8)] backdrop-blur-xl animate-in slide-in-from-bottom-4 duration-300 flex items-center justify-between gap-3 text-white"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-amber-400/15 border border-amber-400/30 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5 text-amber-400" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase tracking-wider">
                Added to Cart!
              </span>
              <span className="font-extrabold text-xs sm:text-sm text-white truncate">
                {toast.item.name}
              </span>
              <span className="text-[11px] font-mono text-white/50">
                PKR {toast.item.price.toLocaleString()} • Qty: {toast.item.quantity || 1}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Link
              to="/cart"
              onClick={closeToast}
              className="py-1.5 px-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-black text-xs font-extrabold flex items-center gap-1 shadow-sm transition-all"
            >
              <span>Cart</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
            <button
              type="button"
              onClick={closeToast}
              className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              aria-label="Dismiss notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </aside>
      )}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
