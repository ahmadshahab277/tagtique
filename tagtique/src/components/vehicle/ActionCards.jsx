import React, { useState } from 'react';
import { Phone, MessageCircle, MessageSquare } from 'lucide-react';
import { smsUrl, telUrl, whatsappCallUrl, whatsappUrl } from '../../utils/contactLinks';

const QUICK_MESSAGES = [
  'Please move your car',
  'Your lights are on',
  'You are blocking the way',
  'I need to talk to you',
];

const DEFAULT_MESSAGE = 'Hello, I scanned the tag on your vehicle.';

function openLink(url) {
  if (!url) return;
  window.location.href = url;
}

export default function ActionCards({ vehicle }) {
  const [message, setMessage] = useState('');
  const phone = vehicle?.phoneNumber || '';
  const hasPhone = Boolean(telUrl(phone));
  const text = message.trim() || DEFAULT_MESSAGE;

  return (
    <div className="w-full flex flex-col gap-4">
      <div className="flex flex-col text-left px-1">
        <h1 className="font-baloo font-extrabold text-2xl sm:text-3xl text-[#1C120C] tracking-tight leading-tight">
          Contact the owner
        </h1>
        <p className="text-sm text-[#8C7A6B] font-medium mt-1 leading-relaxed">
          Tap one button. Your phone will open. You do not need to type a number.
        </p>
      </div>

      {!hasPhone && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-sm text-amber-950 leading-relaxed">
          This owner has not added a phone number yet, so call and message are not available.
        </div>
      )}

      <button
        type="button"
        disabled={!hasPhone}
        onClick={() => openLink(telUrl(phone))}
        className="w-full min-h-[84px] p-4 rounded-2xl bg-[#1C120C] hover:bg-[#2B1B10] active:scale-[0.99] transition-all flex items-center gap-4 text-left shadow-warm-sm disabled:opacity-50"
      >
        <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center text-[#E6AF2E] shrink-0">
          <Phone className="w-7 h-7" />
        </div>
        <div className="flex flex-col">
          <span className="font-extrabold text-lg text-[#FDF7EC]">Call the owner</span>
          <span className="text-sm text-white/75 font-medium mt-0.5">Opens your phone and calls them</span>
        </div>
      </button>

      <button
        type="button"
        disabled={!hasPhone}
        onClick={() => openLink(whatsappCallUrl(phone))}
        className="w-full min-h-[84px] p-4 rounded-2xl bg-emerald-700 hover:bg-emerald-800 active:scale-[0.99] transition-all flex items-center gap-4 text-left shadow-warm-sm disabled:opacity-50"
      >
        <div className="w-14 h-14 rounded-2xl bg-white/15 flex items-center justify-center text-white shrink-0">
          <Phone className="w-7 h-7" />
        </div>
        <div className="flex flex-col">
          <span className="font-extrabold text-lg text-white">Call on WhatsApp</span>
          <span className="text-sm text-white/80 font-medium mt-0.5">Opens WhatsApp and calls them</span>
        </div>
      </button>

      <div className="rounded-3xl bg-white border border-[#EAE3D6] p-4 sm:p-5 shadow-xs flex flex-col gap-4">
        <div>
          <h2 className="font-bold text-base text-[#1C120C]">Or send a message</h2>
          <p className="text-sm text-[#8C7A6B] font-medium mt-0.5">
            Tap a reason, or write your own. Then choose WhatsApp or a text.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-2">
          {QUICK_MESSAGES.map((item) => {
            const selected = message === item;
            return (
              <button
                key={item}
                type="button"
                onClick={() => setMessage(selected ? '' : item)}
                className={`w-full min-h-[52px] px-4 py-3 rounded-2xl text-left text-base font-semibold transition-all border ${
                  selected
                    ? 'bg-[#1C120C] text-[#FDF7EC] border-[#1C120C]'
                    : 'bg-[#FAF7F2] text-[#1C120C] border-[#EAE3D6] hover:border-[#1C120C]/30'
                }`}
              >
                {item}
              </button>
            );
          })}
        </div>

        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-bold text-[#1C120C]">Write your own</span>
          <textarea
            maxLength={300}
            rows={3}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={DEFAULT_MESSAGE}
            className="w-full px-4 py-3 rounded-2xl border border-[#EAE3D6] bg-[#FAF7F2] focus:bg-white text-base text-[#1C120C] font-medium outline-none focus:border-[#E6AF2E] transition-all resize-none leading-relaxed"
          />
        </label>

        <button
          type="button"
          disabled={!hasPhone}
          onClick={() => openLink(whatsappUrl(phone, text))}
          className="w-full min-h-[64px] px-4 py-3.5 rounded-2xl bg-emerald-700 hover:bg-emerald-800 active:scale-[0.99] text-white font-extrabold text-base flex items-center justify-center gap-2.5 transition-all disabled:opacity-50"
        >
          <MessageCircle className="w-5 h-5" />
          <span>Send on WhatsApp</span>
        </button>

        <button
          type="button"
          disabled={!hasPhone}
          onClick={() => openLink(smsUrl(phone, text))}
          className="w-full min-h-[64px] px-4 py-3.5 rounded-2xl bg-[#FAF7F2] border border-[#EAE3D6] hover:border-[#1C120C]/30 text-[#1C120C] font-extrabold text-base flex items-center justify-center gap-2.5 transition-all disabled:opacity-50"
        >
          <MessageSquare className="w-5 h-5" />
          <span>Send as a text</span>
        </button>
      </div>
    </div>
  );
}
