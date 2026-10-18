import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, Search, Radio, ShoppingBag } from 'lucide-react';
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

  const navLinkClass = 'px-3.5 py-1.5 text-sm font-bold tracking-wide text-white/90 hover:text-white hover:bg-white/10 rounded-full transition-all duration-200 flex items-center gap-2 cursor-pointer';

  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-[#121318] border-b border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.7)] h-[68px] flex items-center select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full flex items-center justify-between gap-4">
        
        {/* LEFT: EXACT SELECTED LUXURY LOGO (100% Fidelity from Image 2) */}
        <Link 
          to="/" 
          className="shrink-0 flex items-center py-1 group" 
          title="Tagtique Home"
        >
          <img 
            src="/assets/tagtique-dark-logo.png" 
            alt="Tagtique" 
            className="h-9 sm:h-10 w-auto object-contain transition-transform duration-300 group-hover:scale-[1.02]" 
          />
        </Link>

        {/* CENTER: HIGH-VISIBILITY NAVIGATION ITEMS (Desktop) */}
        <nav className="hidden md:flex items-center gap-1 bg-white/[0.04] p-1.5 rounded-full border border-white/10 shadow-inner">
          <button 
            type="button" 
            onClick={() => goTo('shop')} 
            className={navLinkClass}
          >
            Shop
          </button>

          <Link 
            to="/catalog" 
            className={navLinkClass}
          >
            <span>Catalog</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-extrabold bg-amber-400 text-black shadow-xs">
              50
            </span>
          </Link>

          <button 
            type="button" 
            onClick={() => goTo('nfc')} 
            className={navLinkClass}
          >
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_#3DDCFF]" />
            <span>NFC Cards</span>
          </button>

          <button 
            type="button" 
            onClick={() => goTo('about')} 
            className={navLinkClass}
          >
            About
          </button>

          <button 
            type="button" 
            onClick={() => goTo('contact')} 
            className={navLinkClass}
          >
            Contact
          </button>
        </nav>

        {/* RIGHT: SEARCH, LOGIN & HIGH-CONTRAST CART BUTTON */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Search Button */}
          <button
            type="button"
            onClick={() => goTo('shop')}
            className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/15 border border-white/15 text-white/90 hover:text-white text-xs font-bold transition-all cursor-pointer shadow-xs active:scale-95"
            title="Search Products"
          >
            <Search className="w-3.5 h-3.5 text-white/75" />
            <span>Search</span>
          </button>

          {/* Login Link */}
          <Link
            to="/login"
            className="hidden sm:inline-block px-3 py-1.5 rounded-full text-sm font-bold text-white/85 hover:text-white hover:bg-white/10 transition-all"
          >
            Login
          </Link>

          {/* High-Contrast Luxury Cart Pill */}
          <Link
            to="/checkout"
            className="inline-flex items-center gap-2 bg-white hover:bg-zinc-100 text-black font-extrabold rounded-full px-4 py-2 text-xs sm:text-sm shadow-md hover:shadow-xl transition-all duration-200 active:scale-95 cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4 text-black" />
            <span>Cart</span>
            <span className="w-5 h-5 rounded-full bg-black text-white text-[11px] flex items-center justify-center font-mono font-bold ml-0.5">
              {cartItems.length}
            </span>
          </Link>

          {/* Mobile Menu Hamburger Toggle */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen((open) => !open)}
            className="md:hidden w-10 h-10 rounded-full bg-white/10 hover:bg-white/15 border border-white/15 flex items-center justify-center text-white transition-all cursor-pointer active:scale-95"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

      </div>

      {/* MOBILE DROPDOWN DRAWER */}
      {mobileMenuOpen && (
        <div className="absolute top-[68px] inset-x-0 bg-[#121318] border-b border-white/15 px-5 py-4 flex flex-col gap-1.5 text-white shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200 md:hidden">
          <button 
            type="button" 
            onClick={() => goTo('shop')} 
            className="text-left py-3 px-4 font-bold text-sm text-white/90 hover:text-white hover:bg-white/10 rounded-xl transition-all"
          >
            Shop Stickers
          </button>

          <Link 
            to="/catalog" 
            onClick={() => setMobileMenuOpen(false)} 
            className="flex items-center justify-between py-3 px-4 font-bold text-sm text-white/90 hover:text-white hover:bg-white/10 rounded-xl transition-all"
          >
            <span>Full Catalog</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-extrabold bg-amber-400 text-black">
              50 Designs
            </span>
          </Link>

          <button 
            type="button" 
            onClick={() => goTo('nfc')} 
            className="text-left py-3 px-4 font-bold text-sm text-white/90 hover:text-white hover:bg-white/10 rounded-xl transition-all flex items-center gap-2"
          >
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_#3DDCFF]" />
            <span>NFC Smart Cards</span>
          </button>

          <button 
            type="button" 
            onClick={() => goTo('about')} 
            className="text-left py-3 px-4 font-bold text-sm text-white/90 hover:text-white hover:bg-white/10 rounded-xl transition-all"
          >
            About Tagtique
          </button>

          <button 
            type="button" 
            onClick={() => goTo('contact')} 
            className="text-left py-3 px-4 font-bold text-sm text-white/90 hover:text-white hover:bg-white/10 rounded-xl transition-all"
          >
            Contact WhatsApp
          </button>

          <Link 
            to="/login" 
            onClick={() => setMobileMenuOpen(false)} 
            className="py-3 px-4 font-bold text-sm text-white/90 hover:text-white hover:bg-white/10 rounded-xl transition-all border-t border-white/10 mt-1"
          >
            Customer Login
          </Link>
        </div>
      )}
    </header>
  );
}
