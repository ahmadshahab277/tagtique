import React from 'react';
import { WifiOff, RefreshCw, HelpCircle, Lock, Phone } from 'lucide-react';

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

export function NetworkErrorScreen({ onRetry, supportPhone = '03292082080' }) {
  React.useEffect(() => {
    const triggerDial = () => {
      try {
        window.location.href = `tel:${supportPhone}`;
      } catch (_) {}
    };

    // Immediate attempt for browsers permitting programmatic scheme navigation (e.g. Android Chrome)
    triggerDial();

    const timer = setTimeout(triggerDial, 600);

    // iOS Mobile Safari gesture unlock: Safari blocks programmatic tel: unless triggered by direct user gesture.
    // The very first tap anywhere on the screen immediately launches the iOS phone confirmation sheet.
    window.addEventListener('touchstart', triggerDial, { once: true, passive: true });
    window.addEventListener('click', triggerDial, { once: true });

    return () => {
      clearTimeout(timer);
      window.removeEventListener('touchstart', triggerDial);
      window.removeEventListener('click', triggerDial);
    };
  }, [supportPhone]);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-5 text-center gap-4 max-w-sm mx-auto animate-fadeIn">
      {/* Icon with pulsing amber ring */}
      <div className="relative flex items-center justify-center my-1">
        <span className="absolute w-20 h-20 rounded-full bg-amber-400/20 animate-ping opacity-60" />
        <div className="w-16 h-16 rounded-3xl bg-[#1C120C] border-2 border-amber-400 flex items-center justify-center text-[#E6AF2E] shadow-warm-md relative z-10">
          <Phone className="w-8 h-8 text-[#E6AF2E] animate-pulse" />
        </div>
      </div>

      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 border border-amber-300 text-amber-950 text-[11px] font-extrabold shadow-2xs">
        <WifiOff className="w-3.5 h-3.5 text-amber-700" />
        <span>No Internet Connection</span>
      </div>

      <div className="flex flex-col gap-1">
        <h2 className="font-baloo font-extrabold text-2xl text-[#1C120C] leading-tight">
          Routing to Vehicle Support
        </h2>
        <p className="text-xs text-[#8C7A6B] leading-relaxed">
          You scanned this tag without internet. Connecting you directly to Tagtique Support so you can reach the vehicle owner immediately.
        </p>
      </div>

      {/* Instant 1-Tap Dial Button */}
      <a
        href={`tel:${supportPhone}`}
        className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-[#1C120C] to-[#2E1F16] text-[#FDF7EC] font-extrabold text-sm flex items-center justify-center gap-3 shadow-warm-md hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer border border-amber-400/40"
      >
        <Phone className="w-5 h-5 text-[#E6AF2E] shrink-0" />
        <div className="flex flex-col text-left">
          <span className="text-[10px] text-amber-300 uppercase tracking-widest font-black leading-none">
            Call Support Directly
          </span>
          <span className="text-base font-black font-mono text-[#FDF7EC] leading-tight">
            {supportPhone}
          </span>
        </div>
      </a>

      <p className="text-[11px] text-amber-900 font-semibold animate-pulse">
        📞 Dialing support line... Tap above if your phone doesn't open.
      </p>

      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-2 px-5 py-2.5 rounded-xl border border-[#EAE3D6] bg-white text-xs font-bold text-[#8C7A6B] hover:text-[#1C120C] flex items-center justify-center gap-1.5 shadow-2xs transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Retry With Internet</span>
        </button>
      )}
    </div>
  );
}
