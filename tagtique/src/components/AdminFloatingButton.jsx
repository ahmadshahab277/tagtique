import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Shield, ExternalLink } from 'lucide-react';

export default function AdminFloatingButton() {
  const location = useLocation();

  // Do not show button when already on /admin
  if (location.pathname.startsWith('/admin')) {
    return null;
  }

  return (
    <Link
      to="/admin"
      aria-label="Switch to Admin Panel"
      className="fixed bottom-6 left-6 z-50 inline-flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-[#13111C] hover:bg-[#1F1B2C] text-white text-xs sm:text-sm font-bold shadow-2xl border border-white/20 transition-all duration-300 transform hover:-translate-y-0.5 hover:scale-[1.02] active:scale-95 group font-manrope"
      title="Open Operations Admin Panel"
    >
      <Shield className="w-4 h-4 text-white/90 group-hover:text-tag-amber transition-colors" />
      <span className="tracking-tight">Switch to Admin Panel ➔</span>
      <ExternalLink className="w-3.5 h-3.5 text-white/70 group-hover:text-white transition-colors" />
    </Link>
  );
}
