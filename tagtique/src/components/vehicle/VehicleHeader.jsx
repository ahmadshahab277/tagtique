import React from 'react';
import { Link } from 'react-router-dom';

export default function VehicleHeader() {
  return (
    <header className="w-full bg-[#121318]/90 backdrop-blur-md border-b border-white/10 sticky top-0 z-40 shadow-[0_4px_24px_rgba(0,0,0,0.5)]">
      <div className="max-w-md md:max-w-lg mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center hover:opacity-90 transition-opacity" title="Tagtique Home">
          <img 
            src="/assets/tagtique-dark-logo.png" 
            alt="Tagtique" 
            className="h-8 sm:h-9 w-auto object-contain" 
          />
        </Link>
        <span className="text-[11px] font-mono uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 flex items-center gap-2 shadow-inner">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-bold">Emergency ID Scan</span>
        </span>
      </div>
    </header>
  );
}
