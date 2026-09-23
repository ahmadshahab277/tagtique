import React from 'react';
import { X, Phone, MessageSquare, ArrowRight } from 'lucide-react';
import { smsUrl, telUrl, whatsappUrl } from '../../utils/contactLinks';

function openLink(url) {
  if (!url) return;
  window.location.href = url;
}

export default function ContactDriverModal({
  isOpen,
  onClose,
  vehicle
}) {
  if (!isOpen) return null;

  const phone = vehicle?.phoneNumber || '';
  const hasPhone = Boolean(telUrl(phone));

  return (
    <div className="fixed inset-0 z-50 bg-[#1C120C]/70 backdrop-blur-xs overflow-y-auto overscroll-contain">
      <div className="min-h-full flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white rounded-t-3xl sm:rounded-3xl border border-[#EAE3D6] max-w-md w-full p-6 flex flex-col gap-5 shadow-warm-lg animate-slideUp max-h-[92dvh] overflow-y-auto">
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
                Call on SIM, text, or WhatsApp
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

        <div className="flex flex-col gap-3">
            <button
              type="button"
              disabled={!hasPhone}
              onClick={() => openLink(telUrl(phone))}
              className="w-full min-h-[64px] p-4 rounded-2xl bg-[#1C120C] hover:bg-[#2B1B10] active:scale-[0.99] text-white flex items-center justify-between text-left transition-all shadow-warm-sm group disabled:opacity-50"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-[#E6AF2E] shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-sm sm:text-base text-[#FDF7EC]">
                    Call on SIM
                  </span>
                  <span className="text-xs text-white/70 font-medium">
                    Opens your phone dialer and calls the driver.
                  </span>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-[#E6AF2E] shrink-0" />
            </button>

            <button
              type="button"
              disabled={!hasPhone}
              onClick={() => openLink(smsUrl(phone))}
              className="w-full min-h-[64px] p-4 rounded-2xl bg-[#FAF7F2] border border-[#EAE3D6] hover:border-[#1C120C]/30 hover:bg-[#F3EDE2] active:scale-[0.99] flex items-center justify-between text-left transition-all group disabled:opacity-50"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white border border-[#EAE3D6] flex items-center justify-center text-[#1C120C] shrink-0">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-sm sm:text-base text-[#1C120C]">
                    Text on SIM
                  </span>
                  <span className="text-xs text-[#8C7A6B] font-medium">
                    Opens your messages app to text the driver.
                  </span>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-[#8C7A6B] shrink-0" />
            </button>

            <button
              type="button"
              disabled={!hasPhone}
              onClick={() => openLink(whatsappUrl(phone, 'Hello, I scanned your Tagtique vehicle tag.'))}
              className="w-full min-h-[64px] p-4 rounded-2xl bg-[#FAF7F2] border border-[#EAE3D6] hover:border-[#1C120C]/30 hover:bg-[#F3EDE2] active:scale-[0.99] flex items-center justify-between text-left transition-all group disabled:opacity-50"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 shrink-0">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-sm sm:text-base text-[#1C120C]">
                    WhatsApp
                  </span>
                  <span className="text-xs text-[#8C7A6B] font-medium">
                    Opens WhatsApp to message the driver.
                  </span>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-[#8C7A6B] shrink-0" />
            </button>
          </div>
        {!hasPhone && (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-950">
            This vehicle does not have a phone number saved yet, so call, text, and WhatsApp stay unavailable until one is added.
          </div>
        )}

        <button
          type="button"
          onClick={onClose}
          className="w-full py-2.5 rounded-full border border-[#EAE3D6] text-xs font-bold text-[#1C120C] hover:bg-[#FAF7F2] transition-colors"
        >
          Cancel
        </button>
      </div>
      </div>
    </div>
  );
}
