import React from 'react';
import { ShieldCheck, Radio } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function VehicleHeader() {
  return (
    <header className="w-full bg-white/90 backdrop-blur-md border-b border-[#EAE3D6] sticky top-0 z-30 transition-all shadow-xs">
      <div className="max-w-md md:max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
        {/* Brand identity */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#1C120C] to-[#2E1F16] flex items-center justify-center text-[#E6AF2E] shadow-sm border border-amber-900/20 group-hover:scale-105 transition-transform">
            <ShieldCheck className="w-5 h-5 text-[#E6AF2E]" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-baloo font-extrabold text-[16px] tracking-wide text-[#1C120C] leading-none">
                TAGTIQUE
              </span>
              <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-amber-100/70 text-amber-900 border border-amber-300/60 leading-none">
                PRO
              </span>
            </div>
            <span className="text-[10px] font-semibold tracking-wider text-[#8C7A6B] leading-tight">
              Smart Vehicle Contact
            </span>
          </div>
        </Link>

        {/* Live Status Pill */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-[11px] font-bold shadow-2xs">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="tracking-wide">ONLINE</span>
        </div>
      </div>
    </header>
  );
}

