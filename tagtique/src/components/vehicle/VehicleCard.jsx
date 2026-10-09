import React, { useState } from 'react';
import { ShieldCheck, Car, Copy, Check, MapPin, Sparkles } from 'lucide-react';

export default function VehicleCard({ vehicle }) {
  const [copied, setCopied] = useState(false);
  const rawName = vehicle?.vehicleName || 'Vehicle';
  const vehicleName = rawName.replace(/\s*\(verified\)\s*/i, '').trim() || 'Vehicle';
  const registrationNumber = vehicle?.registrationNumber || 'ABC-123';
  const city = vehicle?.city || 'Pakistan';
  const tagId = vehicle?.tagId || 'TAG-001';
  const ownerName = vehicle?.ownerName || 'Verified Owner';

  const handleCopyTag = () => {
    navigator.clipboard?.writeText(tagId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full bg-white rounded-3xl border border-[#EAE3D6] p-5 sm:p-6 shadow-sm flex flex-col gap-4 relative overflow-hidden transition-all">
      {/* Decorative gradient corner aura */}
      <div className="absolute -top-16 -right-16 w-36 h-36 rounded-full bg-gradient-to-br from-amber-400/10 to-emerald-400/10 blur-2xl pointer-events-none" />

      {/* Top Tag & Status Badges */}
      <div className="flex items-center justify-between gap-2 flex-wrap relative z-10">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-300/80 text-[#975A16] text-[11px] font-extrabold shadow-2xs">
          <Sparkles className="w-3.5 h-3.5 text-[#D49A1F]" />
          <span>TAGTIQUE VERIFIED VEHICLE</span>
        </div>

        {/* Dynamic Tag ID with copy */}
        <button
          type="button"
          onClick={handleCopyTag}
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#FAF7F2] border border-[#EAE3D6] hover:border-[#1C120C]/30 text-[11px] font-mono font-bold text-[#8C7A6B] hover:text-[#1C120C] transition-all cursor-pointer"
          title="Click to copy Tag ID"
        >
          <span>ID: {tagId.length > 12 ? `${tagId.slice(0, 10)}...` : tagId}</span>
          {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3 text-[#8C7A6B]" />}
        </button>
      </div>

      {/* Realistic Embossed License Plate Visual */}
      <div className="relative z-10 w-full">
        <div className="w-full bg-[#FCFBF9] rounded-2xl border-2 border-[#1C120C]/25 p-3.5 sm:p-4 shadow-sm flex items-center justify-between gap-3 relative overflow-hidden">
          {/* Subtle plate reflection sheen */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none" />
          
          {/* Left: Authentic Green PK Ribbon */}
          <div className="flex flex-col items-center justify-center bg-emerald-800 text-white px-2.5 py-2 sm:py-2.5 rounded-xl shrink-0 shadow-xs border border-emerald-700">
            <span className="text-[10px] sm:text-[11px] font-black tracking-widest leading-none">PK</span>
            <span className="text-[8px] font-semibold text-emerald-200 mt-1 uppercase tracking-tighter">TAG</span>
          </div>

          {/* Center: License Plate Number */}
          <div className="flex flex-col items-center justify-center flex-1 text-center">
            <span className="font-mono font-black text-2xl sm:text-3xl text-[#1C120C] tracking-widest uppercase drop-shadow-2xs select-all">
              {registrationNumber}
            </span>
            <div className="flex items-center gap-1.5 mt-0.5 text-[10px] font-bold tracking-widest uppercase text-[#8C7A6B]">
              <MapPin className="w-2.5 h-2.5 text-amber-700" />
              <span>{city} • REGISTERED</span>
            </div>
          </div>

          {/* Right: Modern Car Icon Box */}
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br from-[#1C120C] to-[#2B1B10] flex items-center justify-center text-[#E6AF2E] shrink-0 shadow-2xs border border-amber-900/30">
            <Car className="w-6 h-6 sm:w-7 sm:h-7" />
          </div>
        </div>
      </div>

      {/* Vehicle Model & Owner Information */}
      <div className="flex items-center justify-between gap-2 pt-1 border-t border-[#F2ECE1] relative z-10">
        <div className="flex flex-col text-left">
          <span className="text-[11px] font-semibold text-[#8C7A6B] uppercase tracking-wider">
            Vehicle Model
          </span>
          <span className="text-base font-baloo font-bold text-[#1C120C] leading-tight">
            {vehicleName}
          </span>
        </div>

        <div className="flex flex-col text-right">
          <span className="text-[11px] font-semibold text-[#8C7A6B] uppercase tracking-wider">
            Registered Owner
          </span>
          <span className="text-base font-baloo font-bold text-[#1C120C] leading-tight">
            {ownerName}
          </span>
        </div>
      </div>

      {/* Reassuring Verification Badge */}
      <div className="pt-2 flex items-center justify-between text-xs text-[#8C7A6B] relative z-10 border-t border-[#F2ECE1]">
        <span className="flex items-center gap-1.5 font-semibold text-emerald-800">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Verified Tagtique Vehicle</span>
        </span>
        <span className="text-[11px] text-[#8C7A6B] font-medium">
          Official QR Safety System
        </span>
      </div>
    </div>
  );
}
