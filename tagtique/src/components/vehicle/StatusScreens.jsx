import React from 'react';
import { ShieldAlert, AlertCircle, WifiOff, RefreshCw, HelpCircle, Lock } from 'lucide-react';

export function LoadingScreen() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center gap-4 animate-fadeIn">
      <div className="relative flex items-center justify-center">
        <div className="w-16 h-16 rounded-3xl bg-[#1C120C] flex items-center justify-center text-[#E6AF2E] shadow-warm-md animate-pulse">
          <RefreshCw className="w-8 h-8 animate-spin" />
        </div>
      </div>
      <div className="flex flex-col gap-1">
        <h3 className="font-baloo font-extrabold text-xl text-[#1C120C]">
          Finding this vehicle...
        </h3>
        <p className="text-sm text-[#8C7A6B]">
          One moment
        </p>
      </div>
    </div>
  );
}

export function InactiveTagScreen({ onRetry }) {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center gap-5 max-w-sm mx-auto animate-fadeIn">
      <div className="w-16 h-16 rounded-3xl bg-amber-50 border-2 border-amber-300 flex items-center justify-center text-[#975A16] shadow-warm-sm">
        <Lock className="w-8 h-8 text-[#D49A1F]" />
      </div>

      <div className="flex flex-col gap-1.5">
        <h2 className="font-baloo font-extrabold text-2xl text-[#1C120C]">
          Tagtique unavailable
        </h2>
        <p className="text-xs sm:text-sm text-[#8C7A6B] leading-relaxed">
          This vehicle's Tagtique profile is currently inactive.
        </p>
      </div>

      <div className="p-3.5 rounded-2xl bg-[#FAF7F2] border border-[#EAE3D6] text-xs text-[#8C7A6B] text-left leading-relaxed">
        The vehicle owner may have temporarily paused their profile or the tag is in transit. If this is an emergency, please contact local emergency authorities.
      </div>

      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="px-5 py-2.5 rounded-full border border-[#EAE3D6] text-xs font-bold text-[#1C120C] hover:bg-[#FAF7F2] flex items-center gap-1.5"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Check Again</span>
        </button>
      )}
    </div>
  );
}

export function NotFoundScreen({ tagId, onRetry }) {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center gap-5 max-w-sm mx-auto animate-fadeIn">
      <div className="w-16 h-16 rounded-3xl bg-red-50 border-2 border-red-200 flex items-center justify-center text-red-600 shadow-warm-sm">
        <HelpCircle className="w-8 h-8" />
      </div>

      <div className="flex flex-col gap-1.5">
        <h2 className="font-baloo font-extrabold text-2xl text-[#1C120C]">
          Tag Not Found
        </h2>
        <p className="text-xs sm:text-sm text-[#8C7A6B] leading-relaxed">
          No registered vehicle was found for code <strong className="font-mono text-[#1C120C]">{tagId || 'TAG-UNKNOWN'}</strong>.
        </p>
      </div>

      <div className="p-3.5 rounded-2xl bg-[#FAF7F2] border border-[#EAE3D6] text-xs text-[#8C7A6B] leading-relaxed">
        Please ensure you have scanned a genuine Tagtique vehicle sticker or check that the URL was entered correctly.
      </div>

      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="px-5 py-2.5 rounded-full bg-[#1C120C] text-[#FDF7EC] text-xs font-bold hover:bg-[#2B1B10] shadow-warm-sm flex items-center gap-1.5"
        >
          <RefreshCw className="w-3.5 h-3.5 text-[#E6AF2E]" />
          <span>Retry Lookup</span>
        </button>
      )}
    </div>
  );
}

export function NetworkErrorScreen({ onRetry }) {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center gap-5 max-w-sm mx-auto animate-fadeIn">
      <div className="w-16 h-16 rounded-3xl bg-red-50 border-2 border-red-200 flex items-center justify-center text-red-600 shadow-warm-sm">
        <WifiOff className="w-8 h-8" />
      </div>

      <div className="flex flex-col gap-1.5">
        <h2 className="font-baloo font-extrabold text-2xl text-[#1C120C]">
          Connection Error
        </h2>
        <p className="text-xs sm:text-sm text-[#8C7A6B] leading-relaxed">
          Unable to establish communication with Tagtique proxy servers. Please check your mobile internet connection.
        </p>
      </div>

      <button
        type="button"
        onClick={onRetry}
        className="px-6 py-3 rounded-full bg-[#1C120C] text-[#FDF7EC] text-xs font-extrabold hover:bg-[#2B1B10] shadow-warm-sm flex items-center gap-2"
      >
        <RefreshCw className="w-4 h-4 text-[#E6AF2E]" />
        <span>Try Again</span>
      </button>
    </div>
  );
}
