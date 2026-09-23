import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

const INITIAL_CART = [];

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
        // Clear old demo cart item if present
        if (Array.isArray(parsed) && parsed.some(item => item?.engravedText === 'Ayesha Khan')) {
          localStorage.removeItem('tagtique_cart');
          return [];
        }
        return Array.isArray(parsed) ? parsed : [];
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

  const addToCart = (item) => {
    setCartItems((prev) => [item, ...prev]);
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

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        clearCart,
        lastOrder,
        completeOrder,
        userProfile,
        setUserProfile
      }}
    >
      {children}
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
