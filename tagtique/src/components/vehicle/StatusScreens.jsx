import React from 'react';
import { WifiOff, RefreshCw, HelpCircle, Lock, Phone } from 'lucide-react';
import { telUrl } from '../../utils/contactLinks';

export function LoadingScreen() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center gap-4 animate-fadeIn">
      <div className="relative flex items-center justify-center">
        <div className="w-16 h-16 rounded-3xl bg-[#12131A] border border-amber-400/30 flex items-center justify-center text-amber-400 shadow-[0_0_30px_rgba(245,158,11,0.2)]">
          <RefreshCw className="w-8 h-8 animate-spin text-amber-400" />
        </div>
      </div>
      <div className="flex flex-col gap-1.5 mt-2">
        <h3 className="font-extrabold text-xl text-white font-manrope">
          Finding this vehicle...
        </h3>
        <p className="text-xs text-white/50">
          One moment while we load safety credentials
        </p>
      </div>
    </div>
  );
}

export function InactiveTagScreen({ onRetry }) {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center gap-5 max-w-sm mx-auto animate-fadeIn">
      <div className="w-16 h-16 rounded-3xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400 shadow-[0_0_30px_rgba(245,158,11,0.2)]">
        <Lock className="w-8 h-8 text-amber-400" />
      </div>

      <div className="flex flex-col gap-1.5">
        <h2 className="font-extrabold text-2xl text-white font-manrope">
          Tag Unavailable
        </h2>
        <p className="text-xs sm:text-sm text-white/60 leading-relaxed">
          This vehicle's Tagtique profile is currently inactive.
        </p>
      </div>

      <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 text-xs text-white/60 text-left leading-relaxed">
        The vehicle owner may have temporarily paused their profile or the tag is in transit. If this is an emergency, please contact local emergency authorities.
      </div>

      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="px-6 py-3 rounded-full bg-white/10 hover:bg-white/15 border border-white/15 text-xs font-bold text-white flex items-center gap-2 cursor-pointer transition-all"
        >
          <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
          <span>Check Again</span>
        </button>
      )}
    </div>
  );
}

export function NotFoundScreen({ tagId, onRetry }) {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center gap-5 max-w-sm mx-auto animate-fadeIn">
      <div className="w-16 h-16 rounded-3xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 shadow-[0_0_30px_rgba(239,68,68,0.2)]">
        <HelpCircle className="w-8 h-8 text-red-400" />
      </div>

      <div className="flex flex-col gap-1.5">
        <h2 className="font-extrabold text-2xl text-white font-manrope">
          Tag Not Found
        </h2>
        <p className="text-xs sm:text-sm text-white/60 leading-relaxed">
          No registered vehicle was found for code <strong className="font-mono text-amber-400">{tagId || 'TAG-UNKNOWN'}</strong>.
        </p>
      </div>

      <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 text-xs text-white/60 text-left leading-relaxed">
        Please ensure you have scanned a genuine Tagtique vehicle sticker or check that the URL was entered correctly.
      </div>

      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="px-6 py-3 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-black text-xs font-extrabold shadow-[0_0_20px_rgba(245,158,11,0.25)] flex items-center gap-2 cursor-pointer transition-all"
        >
          <RefreshCw className="w-3.5 h-3.5 text-black" />
          <span>Retry Lookup</span>
        </button>
      )}
    </div>
  );
}

export function NetworkErrorScreen({
  onRetry,
  targetPhone = '03292082080',
  vehicleNumber = ''
}) {
  const cleanPhone = String(targetPhone || '03292082080').trim();
  const href = telUrl(cleanPhone) || 'tel:+923292082080';

  return (
    <div className="w-full bg-[#12131A] rounded-[28px] border border-amber-400/30 p-6 shadow-2xl flex flex-col gap-5 text-center max-w-md mx-auto animate-fadeIn backdrop-blur-xl">
      <div className="w-16 h-16 rounded-3xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400 mx-auto shadow-[0_0_30px_rgba(245,158,11,0.2)]">
        <WifiOff className="w-8 h-8" />
      </div>

      <div className="flex flex-col gap-1.5">
        <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400 font-bold">
          Zero-Data Offline Routing
        </span>
        <h2 className="font-extrabold text-2xl text-white font-manrope">
          No Internet Connection
        </h2>
        <p className="text-xs text-white/70 leading-relaxed">
          {vehicleNumber ? (
            <>
              Tagtique detected offline mode for vehicle{' '}
              <strong className="font-mono text-amber-400">{vehicleNumber}</strong>. You can call directly below.
            </>
          ) : (
            'You are currently offline. You can still reach the owner or helpline via direct phone call.'
          )}
        </p>
      </div>

      <div className="flex flex-col gap-3 pt-2">
        <a
          href={href}
          className="w-full min-h-[54px] py-3 px-5 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 active:scale-[0.99] text-black font-extrabold text-sm flex items-center justify-center gap-3 shadow-[0_4px_25px_rgba(245,158,11,0.25)] transition-all cursor-pointer"
        >
          <Phone className="w-4.5 h-4.5" />
          <span>Call Directly ({cleanPhone})</span>
        </a>

        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="w-full py-3 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-xs font-bold text-white flex items-center justify-center gap-2 cursor-pointer transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
            <span>Retry Internet Connection</span>
          </button>
        )}
      </div>
    </div>
  );
}
