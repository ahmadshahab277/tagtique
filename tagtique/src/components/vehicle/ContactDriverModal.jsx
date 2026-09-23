import React, { useState } from 'react';
import { X, Phone, MessageSquare, ShieldCheck, Lock, CheckCircle2, ArrowRight } from 'lucide-react';

export default function ContactDriverModal({
  isOpen,
  onClose,
  vehicle,
  onSelectSendMessage
}) {
  const [callInitiated, setCallInitiated] = useState(false);

  if (!isOpen) return null;

  const handleStartMaskedCall = () => {
    setCallInitiated(true);
    // In production, triggers the Twilio / Vonage / backend proxy bridge.
    // For browser demonstration, sets up the simulated proxy dialer.
    setTimeout(() => {
      // simulate prompt or tel bridge
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#1C120C]/70 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fadeIn">
      <div className="bg-white rounded-t-3xl sm:rounded-3xl border border-[#EAE3D6] max-w-md w-full p-6 flex flex-col gap-5 shadow-warm-lg animate-slideUp">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#F2ECE1] pb-3.5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
              <Phone className="w-4.5 h-4.5" />
            </div>
            <div className="flex flex-col">
              <h3 className="font-baloo font-extrabold text-lg text-[#1C120C] leading-tight">
                Contact Vehicle Owner
              </h3>
              <span className="text-[11px] text-[#8C7A6B] font-medium">
                Protected Anonymous Communication Relay
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-[#8C7A6B] hover:text-[#1C120C] hover:bg-[#FAF7F2] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Vehicle Identity Context */}
        <div className="p-3.5 rounded-2xl bg-[#FAF7F2] border border-[#EAE3D6] flex items-center justify-between text-xs">
          <div className="flex flex-col">
            <span className="text-[10px] text-[#8C7A6B] font-bold uppercase tracking-wider">
              Target Vehicle:
            </span>
            <span className="font-bold text-sm text-[#1C120C]">
              {vehicle?.vehicleName || 'Toyota Corolla'}
            </span>
          </div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white border border-[#EAE3D6] font-mono font-bold text-xs text-[#1C120C]">
            <span>{vehicle?.registrationNumber || 'ABC-123'}</span>
          </div>
        </div>

        {/* Masked Call Status */}
        {callInitiated ? (
          <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 flex flex-col items-center text-center gap-3 animate-fadeIn">
            <div className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center animate-bounce shadow-warm-sm">
              <Phone className="w-6 h-6" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-base text-emerald-950">
                Connecting Masked Voice Bridge...
              </span>
              <p className="text-xs text-emerald-800/80 mt-1 max-w-xs">
                A secure proxy line is connecting you to the vehicle driver. Neither party's personal telephone number will be displayed.
              </p>
            </div>

            <div className="flex items-center gap-2 pt-2 text-[11px] font-mono text-emerald-700">
              <Lock className="w-3.5 h-3.5" />
              <span>Proxy Bridge Active • +92 41 •••• RELAY</span>
            </div>

            <button
              type="button"
              onClick={() => setCallInitiated(false)}
              className="mt-2 px-4 py-1.5 rounded-full border border-emerald-300 text-xs font-bold text-emerald-800 bg-white hover:bg-emerald-100"
            >
              Cancel Call Bridge
            </button>
          </div>
        ) : (
          /* Communication Options */
          <div className="flex flex-col gap-3">
            {/* OPTION 1: CALL DRIVER (MASKED) */}
            <button
              type="button"
              onClick={handleStartMaskedCall}
              className="w-full min-h-[64px] p-4 rounded-2xl bg-[#1C120C] hover:bg-[#2B1B10] active:scale-[0.99] text-white flex items-center justify-between text-left transition-all shadow-warm-sm group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-[#E6AF2E] group-hover:scale-105 transition-transform shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm sm:text-base text-[#FDF7EC]">
                      Call Driver (Masked Call)
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-400/30">
                      Private
                    </span>
                  </div>
                  <span className="text-xs text-white/70 font-medium">
                    Call directly without revealing your personal number.
                  </span>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-[#E6AF2E] group-hover:translate-x-1 transition-transform shrink-0" />
            </button>

            {/* OPTION 2: SEND MESSAGE */}
            <button
              type="button"
              onClick={() => {
                onClose();
                onSelectSendMessage();
              }}
              className="w-full min-h-[64px] p-4 rounded-2xl bg-[#FAF7F2] border border-[#EAE3D6] hover:border-[#1C120C]/30 hover:bg-[#F3EDE2] active:scale-[0.99] flex items-center justify-between text-left transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white border border-[#EAE3D6] flex items-center justify-center text-[#975A16] group-hover:scale-105 transition-transform shrink-0">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-sm sm:text-base text-[#1C120C]">
                    Send a Message
                  </span>
                  <span className="text-xs text-[#8C7A6B] font-medium">
                    Send quick template or custom text to the driver.
                  </span>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-[#8C7A6B] group-hover:translate-x-1 transition-transform shrink-0" />
            </button>
          </div>
        )}

        {/* Privacy Assurance Banner */}
        <div className="p-3 rounded-2xl bg-amber-50/70 border border-amber-200/80 flex items-start gap-2.5 text-xs text-amber-950">
          <ShieldCheck className="w-4 h-4 text-[#D49A1F] shrink-0 mt-0.5" />
          <div className="flex flex-col text-[11px] leading-relaxed text-amber-900/90">
            <strong>Zero Personal Number Exposure:</strong>
            <span>
              Tagtique operates on encrypted call and message proxies. Neither your phone number nor the driver's private contact is ever shown publicly.
            </span>
          </div>
        </div>

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="w-full py-2.5 rounded-full border border-[#EAE3D6] text-xs font-bold text-[#1C120C] hover:bg-[#FAF7F2] transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
