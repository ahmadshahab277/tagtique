import React from 'react';
import { ShieldCheck, Car, Shield } from 'lucide-react';

export default function VehicleCard({ vehicle }) {
  const rawName = vehicle?.vehicleName || 'Car';
  const vehicleName = rawName.replace(/\s*\(verified\)\s*/i, '').trim() || 'Car';
  const registrationNumber = vehicle?.registrationNumber || 'ABC-123';

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
          <span>Ready to contact</span>
        </div>
      </div>

      {/* Main Vehicle Plate & Identity */}
      <div className="flex items-center justify-between gap-4 pt-1">
        <div className="flex flex-col">
          <span className="text-sm font-bold text-[#8C7A6B]">
            This vehicle
          </span>
          <h2 className="text-2xl font-baloo font-extrabold text-[#1C120C] leading-tight">
            {vehicleName}
          </h2>

          <div className="flex flex-col gap-1.5 mt-3">
            <span className="text-sm font-bold text-[#8C7A6B]">
              Number plate
            </span>
            <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#FAF7F2] border-2 border-[#1C120C]/15 font-mono font-black text-lg text-[#1C120C] uppercase tracking-wider shadow-2xs w-fit">
              <span className="text-xs px-1.5 py-0.5 rounded bg-emerald-700 text-white font-bold tracking-normal font-sans">
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
      <div className="pt-3 border-t border-[#F2ECE1] flex items-center gap-1.5 text-sm text-[#8C7A6B]">
        <Shield className="w-4 h-4 text-emerald-600 shrink-0" />
        <span className="font-medium">
          The phone number stays private on this page.
        </span>
      </div>
    </div>
  );
}
