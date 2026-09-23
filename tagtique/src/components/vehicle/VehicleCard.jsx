import React from 'react';
import { ShieldCheck, CheckCircle2, Car, Shield } from 'lucide-react';

export default function VehicleCard({ vehicle }) {
  const vehicleName = vehicle?.vehicleName || 'Toyota Corolla';
  const registrationNumber = vehicle?.registrationNumber || 'ABC-123';
  const tagId = vehicle?.tagId || 'TAG-001';

  return (
    <div className="w-full bg-white rounded-3xl border border-[#EAE3D6] p-5 sm:p-6 shadow-warm-sm flex flex-col gap-4 relative overflow-hidden">
      {/* Decorative gradient corner aura */}
      <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-emerald-500/5 blur-2xl pointer-events-none" />

      {/* Top Tag & Status Badges */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-[#975A16] text-[11px] font-bold">
          <ShieldCheck className="w-3.5 h-3.5 text-[#D49A1F]" />
          <span>TAGTIQUE VERIFIED VEHICLE</span>
        </div>

        {/* Green Active Indicator */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-bold">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Vehicle profile active</span>
        </div>
      </div>

      {/* Main Vehicle Plate & Identity */}
      <div className="flex items-center justify-between gap-4 pt-1">
        <div className="flex flex-col">
          <span className="text-xs font-bold text-[#8C7A6B] uppercase tracking-wider">
            Vehicle
          </span>
          <h2 className="text-xl sm:text-2xl font-baloo font-extrabold text-[#1C120C] leading-tight">
            {vehicleName}
          </h2>

          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs font-bold text-[#8C7A6B]">
              Registration:
            </span>
            {/* Embossed Luxury License Plate Pill */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#FAF7F2] border-2 border-[#1C120C]/15 font-mono font-black text-sm text-[#1C120C] uppercase tracking-wider shadow-2xs">
              <span className="text-[10px] px-1 py-0.5 rounded bg-emerald-700 text-white font-bold tracking-normal font-sans">
                PK
              </span>
              <span>{registrationNumber}</span>
            </div>
          </div>
        </div>

        {/* Clean Modern Car Visual */}
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-[#FAF7F2] to-[#F3EDE2] border border-[#EAE3D6] flex items-center justify-center text-[#1C120C] shadow-2xs shrink-0">
          <Car className="w-9 h-9 sm:w-11 sm:h-11 text-[#1C120C]" />
        </div>
      </div>

      {/* Privacy Guarantee Notice */}
      <div className="pt-3 border-t border-[#F2ECE1] flex items-center justify-between text-xs text-[#8C7A6B]">
        <div className="flex items-center gap-1.5">
          <Shield className="w-3.5 h-3.5 text-emerald-600" />
          <span className="text-[11px] font-medium">
            Call, text, or WhatsApp the owner
          </span>
        </div>
        <span className="text-[10.5px] font-mono font-bold text-[#A89889]">
          ID: {tagId}
        </span>
      </div>
    </div>
  );
}
