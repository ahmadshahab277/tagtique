import React from 'react';
import { Link } from 'react-router-dom';
import TagtiqueLogo from '../TagtiqueLogo';

export default function VehicleHeader() {
  return (
    <header className="w-full bg-[#0B0C10] border-b border-white/10 sticky top-0 z-30 shadow-md">
      <div className="max-w-md md:max-w-lg mx-auto px-4 py-2.5 flex items-center justify-between">
        <Link to="/" className="flex items-center hover:opacity-95 transition-opacity" title="Tagtique Home">
          <img 
            src="/assets/tagtique-dark-logo.png" 
            alt="Tagtique" 
            className="h-8 w-auto object-contain" 
          />
        </Link>
        <span className="text-[10px] font-mono uppercase tracking-wider text-white/50 bg-white/[0.06] px-2.5 py-0.5 rounded-full border border-white/10 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>Emergency ID Scan</span>
        </span>
      </div>
    </header>
  );
}
