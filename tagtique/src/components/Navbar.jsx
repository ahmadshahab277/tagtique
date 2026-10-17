import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { cartItems } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  const goTo = (id) => {
    setMobileMenuOpen(false);
    if (location.pathname !== '/') {
      navigate('/#' + id);
      return;
    }
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const linkClass = 'px-3 py-2 text-sm font-medium text-black/80 hover:text-black';

  return (
    <div className="glass fixed top-0 inset-x-0 z-50 border-x-0 border-t-0 rounded-none">
      <div className="text-center text-[11px] tracking-[0.16em] uppercase text-black/45 py-2 border-b border-black/5">
        QR identity stickers · Free delivery across Pakistan
      </div>

      <header>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center min-w-0 gap-1">
            <Link to="/" className="shrink-0 mr-2" title="Tagtique Home">
              <img src="/assets/tagtique-logo.png" alt="Tagtique" className="h-9 w-auto object-contain" />
            </Link>
            <nav className="hidden md:flex items-center">
              <button type="button" onClick={() => goTo('shop')} className={linkClass}>Shop</button>
              <button type="button" onClick={() => goTo('nfc')} className={linkClass}>NFC cards</button>
              <button type="button" onClick={() => goTo('about')} className={linkClass}>About</button>
              <button type="button" onClick={() => goTo('contact')} className={linkClass}>Contact us</button>
            </nav>
          </div>

          <div className="flex items-center gap-1 text-sm font-medium text-black">
            <button type="button" onClick={() => goTo('shop')} className="hidden sm:inline px-3 py-2 text-black/80 hover:text-black">
              Search
            </button>
            <Link to="/login" className="px-3 py-2 text-black/80 hover:text-black">Login</Link>
            <Link
              to="/checkout"
              className="ml-1 inline-flex items-center bg-black text-white rounded-full px-4 py-2 text-sm font-semibold"
            >
              Cart {cartItems.length}
            </Link>
            <button
              type="button"
              onClick={() => setMobileMenuOpen((open) => !open)}
              className="md:hidden ml-1 p-2"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden border-t border-black/10 bg-white/80 px-5 py-2 flex flex-col">
            <button type="button" onClick={() => goTo('shop')} className="text-left py-3 font-medium">Shop</button>
            <button type="button" onClick={() => goTo('nfc')} className="text-left py-3 font-medium">NFC cards</button>
            <button type="button" onClick={() => goTo('about')} className="text-left py-3 font-medium">About</button>
            <button type="button" onClick={() => goTo('contact')} className="text-left py-3 font-medium">Contact us</button>
            <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="py-3 font-medium">Login</Link>
          </div>
        )}
      </header>
    </div>
  );
}
