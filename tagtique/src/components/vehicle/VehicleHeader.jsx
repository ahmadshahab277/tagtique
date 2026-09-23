import React from 'react';
import { ShieldCheck } from 'lucide-react';

export default function VehicleHeader() {
  return (
    <header className="w-full bg-white/90 backdrop-blur-md border-b border-[#EAE3D6] sticky top-0 z-30 transition-all shadow-xs">
      <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
        {/* Brand identity */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#1C120C] flex items-center justify-center text-[#E6AF2E] shadow-2xs">
            <ShieldCheck className="w-4.5 h-4.5" />
          </div>
          <div className="flex flex-col">
            <span className="font-baloo font-extrabold text-[15px] tracking-wide text-[#1C120C] leading-none">
              TAGTIQUE
            </span>
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#8C7A6B] leading-tight">
              Smart Vehicle Contact
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
