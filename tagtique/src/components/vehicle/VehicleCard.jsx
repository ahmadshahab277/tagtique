import React, { useState } from 'react';
import { Car, Copy, Check, MapPin, ShieldCheck } from 'lucide-react';

export default function VehicleCard({ vehicle }) {
  const [copied, setCopied] = useState(false);
  const rawName = vehicle?.vehicleName || 'Vehicle';
  const vehicleName = rawName.replace(/\s*\(verified\)\s*/i, '').trim() || 'Vehicle';
  const registrationNumber = vehicle?.registrationNumber || 'TAG-1';
  const city = vehicle?.city || 'Faisalabad';
  const tagId = vehicle?.tagId || '';
  const ownerName = vehicle?.ownerName || 'Vehicle Owner';

  const handleCopyTag = () => {
    navigator.clipboard?.writeText(tagId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full bg-[#12131A] rounded-[28px] border border-white/10 p-5 sm:p-6 shadow-[0_20px_50px_rgba(0,0,0,0.6)] flex flex-col gap-4 relative overflow-hidden backdrop-blur-xl">
      {/* Ambient corner light */}
      <div className="absolute -top-16 -right-16 w-36 h-36 bg-amber-400/10 rounded-full blur-2xl pointer-events-none" />

      {/* Top Header: Verified status & Copy ID Button */}
      <div className="flex items-center justify-between gap-2 relative z-10">
        <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Verified Tag</span>
        </div>

        <button
          type="button"
          onClick={handleCopyTag}
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10 hover:border-amber-400/40 text-[11px] font-mono text-white/70 hover:text-white transition-all cursor-pointer shadow-inner"
          title="Click to copy Tag ID"
        >
          <span>ID: {tagId ? (tagId.length > 12 ? `${tagId.slice(0, 10)}...` : tagId) : '—'}</span>
          {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-white/50" />}
        </button>
      </div>

      {/* Realistic Luxury Embossed License Plate Visual */}
      <div className="relative z-10 w-full">
        <div className="w-full bg-gradient-to-b from-[#181A22] via-[#101217] to-[#0A0B0E] rounded-2xl border-2 border-white/15 p-4 sm:p-5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),0_10px_25px_rgba(0,0,0,0.5)] flex items-center justify-between gap-3 relative overflow-hidden">
          {/* Subtle metallic reflection sheen */}
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.06] to-transparent pointer-events-none" />
          
          {/* Left: Authentic Green PK Ribbon */}
          <div className="flex flex-col items-center justify-center bg-gradient-to-b from-emerald-600 to-emerald-800 text-white px-3 py-2.5 sm:py-3 rounded-xl shrink-0 shadow-md border border-emerald-400/30">
            <span className="text-[11px] sm:text-xs font-black tracking-widest leading-none">PK</span>
            <span className="text-[8px] font-bold text-emerald-200 mt-1 uppercase tracking-tighter">TAG</span>
          </div>

          {/* Center: License Plate Number & City */}
          <div className="flex flex-col items-center justify-center flex-1 text-center min-w-0">
            <span className="font-mono font-black text-2xl sm:text-4xl text-white tracking-[0.18em] uppercase select-all drop-shadow-[0_2px_8px_rgba(255,255,255,0.2)] truncate">
              {registrationNumber}
            </span>
            {city && (
              <div className="flex items-center gap-1 mt-1 text-[10px] sm:text-[11px] font-bold tracking-widest uppercase text-amber-400/90">
                <MapPin className="w-3 h-3 text-amber-400 shrink-0" />
                <span>{city}</span>
              </div>
            )}
          </div>

          {/* Right: Modern Car Icon Box with Amber Glow */}
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400 shrink-0 shadow-[0_0_20px_rgba(245,158,11,0.2)]">
            <Car className="w-6 h-6 sm:w-7 sm:h-7" />
          </div>
        </div>
      </div>

      {/* Vehicle Model & Owner Information */}
      <div className="grid grid-cols-2 gap-3 pt-3 border-t border-white/10 relative z-10">
        <div className="flex flex-col text-left">
          <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">
            Vehicle Model
          </span>
          <span className="text-base font-extrabold text-white leading-tight font-manrope mt-0.5 truncate">
            {vehicleName}
          </span>
        </div>

        <div className="flex flex-col text-right">
          <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">
            Registered Owner
          </span>
          <span className="text-base font-extrabold text-white leading-tight font-manrope mt-0.5 truncate">
            {ownerName || '—'}
          </span>
        </div>
      </div>
    </div>
  );
}
