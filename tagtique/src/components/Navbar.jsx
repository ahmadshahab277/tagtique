import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingBag, Menu, X } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { cartItems } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      const scrollPos = window.scrollY || document.documentElement.scrollTop || document.body.scrollTop || 0;
      setScrolled(scrollPos > 15);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id) => {
    setMobileMenuOpen(false);
    if (location.pathname !== '/') {
      navigate('/#' + id);
      return;
    }
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="fixed top-3 sm:top-4 left-0 right-0 z-50 px-3 sm:px-6 pointer-events-none transition-all duration-300">
      <header
        className={`pointer-events-auto max-w-5xl mx-auto rounded-full transition-all duration-300 flex items-center justify-between px-3.5 sm:px-6 py-2 sm:py-2.5 ${
          scrolled
            ? 'bg-[#FFFDF8]/95 backdrop-blur-xl border-2 border-[#2E1B10]/15 shadow-[0_12px_36px_-10px_rgba(46,27,16,0.18)] scale-[0.99]'
            : 'bg-[#FFFDF8]/88 backdrop-blur-md border-[1.5px] border-[#2E1B10]/10 shadow-[0_8px_24px_rgba(46,27,16,0.06)]'
        }`}
      >
        {/* Brand Logo */}
        <Link
          to="/"
          className="flex items-center gap-2 group transition-transform duration-200 hover:scale-[1.04] active:scale-[0.97]"
          title="Tagtique Home"
        >
          <img
            src="/assets/tagtique-logo.png"
            alt="Tagtique"
            className="h-9 sm:h-11 w-auto object-contain drop-shadow-sm transition-all"
          />
        </Link>

        {/* Humanized, Warm Nav Links */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2 text-[14px] font-bold text-[#5C452F]">
          <button
            onClick={() => scrollToSection('pricing')}
            className="px-3.5 py-1.5 rounded-full hover:text-[#2E1B10] hover:bg-[#F4EADA]/70 transition-all duration-150"
          >
            Pricing
          </button>
          <button
            onClick={() => scrollToSection('faq')}
            className="px-3.5 py-1.5 rounded-full hover:text-[#2E1B10] hover:bg-[#F4EADA]/70 transition-all duration-150"
          >
            FAQ
          </button>
        </nav>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Shopping Bag Trigger */}
          <Link
            to="/checkout"
            className="relative p-2 sm:p-2.5 rounded-full border-[1.5px] border-[#2E1B10]/15 bg-[#FDF7EC] hover:bg-[#F4EADA] transition-all duration-150 text-[#2E1B10] hover:scale-105 active:scale-95 shadow-xs"
            aria-label="Shopping Bag"
            title="View Bag & Checkout"
          >
            <ShoppingBag className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
            {cartItems.length > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#F5B21F] text-[#1B0F06] font-mono text-[11px] font-black flex items-center justify-center border-[1.5px] border-[#2E1B10] shadow-xs">
                {cartItems.length}
              </span>
            )}
          </Link>

          {/* Tactile Puffy CTA Button */}
          <Link
            to="/order"
            className="group relative inline-flex items-center gap-1.5 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full bg-gradient-to-b from-[#FFD56B] to-[#F5B21F] border-[2px] border-[#2E1B10] text-[#2E1B10] font-baloo font-extrabold text-[13px] sm:text-[15px] shadow-[0_3px_0_#2E1B10] hover:shadow-[0_4px_0_#2E1B10] hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-[0_1px_0_#2E1B10] transition-all duration-150"
          >
            <span>Get stickers</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#2E1B10] group-hover:scale-125 transition-transform" />
          </Link>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-full text-[#2E1B10] bg-[#FDF7EC] border border-[#2E1B10]/15 hover:bg-[#F4EADA] transition-colors"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Mobile Menu Dropdown Card */}
      {mobileMenuOpen && (
        <div className="pointer-events-auto max-w-5xl mx-auto mt-2 p-4 rounded-3xl bg-[#FFFDF8]/98 backdrop-blur-2xl border-2 border-[#2E1B10]/15 shadow-xl flex flex-col gap-2.5 animate-fadeIn">
          <button
            onClick={() => scrollToSection('pricing')}
            className="text-left px-4 py-2.5 rounded-2xl font-bold text-[#2E1B10] hover:bg-[#F4EADA] transition-colors"
          >
            Pricing
          </button>
          <button
            onClick={() => scrollToSection('faq')}
            className="text-left px-4 py-2.5 rounded-2xl font-bold text-[#2E1B10] hover:bg-[#F4EADA] transition-colors"
          >
            FAQ
          </button>
          <a
            href="https://wa.me/923292082080"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center justify-between px-4 py-3 rounded-2xl font-bold text-emerald-900 bg-emerald-500/10 border border-emerald-500/20"
          >
            <span>WhatsApp</span>
            <span className="text-[11px] font-mono font-bold">0329-2082080</span>
          </a>
          <div className="pt-2 border-t border-[#2E1B10]/10 flex flex-col">
            <Link
              to="/order"
              onClick={() => setMobileMenuOpen(false)}
              className="text-center py-3 rounded-full bg-gradient-to-b from-[#FFD56B] to-[#F5B21F] border-[2px] border-[#2E1B10] text-[#2E1B10] font-baloo font-extrabold text-base shadow-[0_3px_0_#2E1B10]"
            >
              Order stickers
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
