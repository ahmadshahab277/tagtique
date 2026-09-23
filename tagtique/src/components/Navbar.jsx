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
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
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
    <header
      className={`sticky top-0 z-40 transition-all duration-200 border-b ${
        scrolled
          ? 'bg-tag-bg/95 backdrop-blur-md border-tag-border shadow-sm py-3'
          : 'bg-tag-bg/85 backdrop-blur-sm border-tag-border/60 py-4'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2 group transition-transform duration-200 hover:scale-[1.02]">
          <img
            src="/assets/tagtique-logo.png"
            alt="Tagtique"
            className="h-10 sm:h-12 w-auto object-contain drop-shadow-sm"
          />
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-6 lg:gap-8 text-[14.5px] font-semibold text-tag-brown-muted">
          <button
            onClick={() => scrollToSection('pricing')}
            className="hover:text-tag-amber-deep transition-colors text-left"
          >
            Pricing
          </button>
          <button
            onClick={() => scrollToSection('faq')}
            className="hover:text-tag-amber-deep transition-colors text-left"
          >
            FAQ
          </button>
          <a
            href="https://wa.me/923292082080"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-tag-amber-deep transition-colors font-bold text-tag-brown"
            title="Chat on WhatsApp: 0329-2082080"
          >
            <span>Support</span>
          </a>
        </nav>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          {/* Cart / Bag Trigger */}
          <Link
            to="/checkout"
            className="relative p-2.5 rounded-full border border-tag-border bg-tag-card hover:bg-tag-pill transition-all text-tag-brown hover:scale-105 active:scale-95"
            aria-label="Shopping Bag"
            title="View Bag & Checkout"
          >
            <ShoppingBag className="w-5 h-5" />
            {cartItems.length > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-tag-amber text-tag-brown-deep font-mono text-[11px] font-bold flex items-center justify-center border-2 border-tag-bg">
                {cartItems.length}
              </span>
            )}
          </Link>

          {/* Order / Get Your Tag CTA */}
          <Link
            to="/order"
            className="amber-gradient-btn px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-[14px] sm:text-[14.5px] font-extrabold text-tag-brown flex items-center gap-2"
          >
            <span>Get your tag</span>
          </Link>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-tag-brown hover:bg-tag-pill"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden px-4 pt-3 pb-6 border-t border-tag-border bg-tag-card mt-3 flex flex-col gap-3 animate-fadeIn">
          <button
            onClick={() => scrollToSection('pricing')}
            className="text-left px-3 py-2 rounded-lg font-semibold text-tag-brown hover:bg-tag-pill"
          >
            Pricing
          </button>
          <button
            onClick={() => scrollToSection('faq')}
            className="text-left px-3 py-2 rounded-lg font-semibold text-tag-brown hover:bg-tag-pill"
          >
            FAQ
          </button>
          <a
            href="https://wa.me/923292082080"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setMobileMenuOpen(false)}
            className="text-left px-3 py-2 rounded-lg font-bold text-emerald-700 hover:bg-emerald-50 flex items-center justify-between"
          >
            <span>Support (WhatsApp)</span>
            <span className="text-xs font-mono bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">0329-2082080</span>
          </a>
          <div className="pt-2 border-t border-tag-border flex flex-col gap-2">
            <Link
              to="/order"
              onClick={() => setMobileMenuOpen(false)}
              className="amber-gradient-btn w-full text-center py-2.5 rounded-full font-extrabold text-tag-brown"
            >
              Build your tag
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
