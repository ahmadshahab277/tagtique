import React, { useState } from 'react';
import {
  Phone,
  MessageCircle,
  MessageSquare,
  AlertTriangle,
  Lightbulb,
  Car,
  Bell,
  Sparkles,
  ChevronDown,
  ChevronUp,
  ShieldAlert,
  Send,
  CheckCircle2,
  Lock,
  Globe,
  Radio,
  Check
} from 'lucide-react';
import { smsUrl, telUrl, whatsappCallUrl, whatsappUrl } from '../../utils/contactLinks';

const QUICK_SCENARIOS = [
  {
    id: 'blocking',
    icon: Car,
    label: 'Car Blocking Way',
    getMessage: (plate) =>
      `Hello! Your vehicle (${plate}) is currently blocking the path. Could you please move it when convenient? Thank you!`
  },
  {
    id: 'lights',
    icon: Lightbulb,
    label: 'Lights Left On',
    getMessage: (plate) =>
      `Hello! The headlights/interior lights on your vehicle (${plate}) appear to be left on.`
  },
  {
    id: 'window',
    icon: AlertTriangle,
    label: 'Window Rolled Down',
    getMessage: (plate) =>
      `Hello! A window on your vehicle (${plate}) was left open/unattended.`
  },
  {
    id: 'alarm',
    icon: Bell,
    label: 'Alarm Ringing',
    getMessage: (plate) =>
      `Hello! The security alarm on your vehicle (${plate}) is currently ringing.`
  }
];

function openLink(url) {
  if (!url) return;
  window.location.href = url;
}

export default function ActionCards({ vehicle, onTogglePrivacy }) {
  const plate = vehicle?.registrationNumber || 'ABC-123';
  const tagId = vehicle?.tagId || 'TAG-001';
  const defaultText = `Hello, I scanned the Tagtique QR code on your vehicle (${plate}).`;

  const [selectedScenario, setSelectedScenario] = useState('blocking');
  const [message, setMessage] = useState(QUICK_SCENARIOS[0].getMessage(plate));
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [inAppAlertSent, setInAppAlertSent] = useState(false);

  const isPhonePrivate = (vehicle?.phonePrivacy || 'private') === 'private';
  const phone = vehicle?.phoneNumber || '03001234567';
  const guardianPhone = vehicle?.guardianNumber || '03019876543';
  const proxyPhone = vehicle?.proxyPhone || '03292082080';
  const proxyWhatsApp = vehicle?.proxyWhatsApp || '923292082080';

  const hasPhone = Boolean(telUrl(phone));
  const hasGuardian = Boolean(vehicle?.hasGuardianConfigured && guardianPhone);

  const handleSelectScenario = (scenario) => {
    if (selectedScenario === scenario.id) {
      setSelectedScenario(null);
      setMessage(defaultText);
    } else {
      setSelectedScenario(scenario.id);
      setMessage(scenario.getMessage(plate));
    }
  };

  const finalMessage = message.trim() || defaultText;

  // Formatted proxy relay message for Tagtique Concierge
  const proxyRelayMessage = `🚨 *[TAGTIQUE SMART PROXY RELAY]*\n\n📌 *Vehicle:* ${plate}\n🔑 *Tag ID:* ${tagId}\n\n💬 *Alert Message:*\n"${finalMessage}"\n\n🛡️ _Alert routed through Tagtique Proxy Bridge. The owner's phone number remains private._`;

  const handleSendInAppPing = () => {
    setInAppAlertSent(true);
    setTimeout(() => setInAppAlertSent(false), 4500);
  };

  return (
    <div className="w-full flex flex-col gap-5">
      {/* 1. Header & Context */}
      <div className="flex flex-col text-left px-1">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-700">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Smart Assistance</span>
          </div>

          {/* Interactive Privacy Switcher (for instant testing/demonstration) */}
          {onTogglePrivacy && (
            <div className="flex items-center gap-1 bg-[#FAF7F2] p-1 rounded-full border border-[#EAE3D6] text-[11px] font-bold shadow-2xs">
              <span className="text-[10px] text-[#8C7A6B] pl-1 pr-0.5">Mode:</span>
              <button
                type="button"
                onClick={() => onTogglePrivacy('private')}
                className={`px-2 py-0.5 rounded-full transition-all cursor-pointer flex items-center gap-1 ${
                  isPhonePrivate
                    ? 'bg-[#1C120C] text-[#FDF7EC] shadow-2xs'
                    : 'text-[#8C7A6B] hover:text-[#1C120C]'
                }`}
              >
                <Lock className="w-2.5 h-2.5" />
                <span>Private (Through Us)</span>
              </button>
              <button
                type="button"
                onClick={() => onTogglePrivacy('public')}
                className={`px-2 py-0.5 rounded-full transition-all cursor-pointer flex items-center gap-1 ${
                  !isPhonePrivate
                    ? 'bg-[#1C120C] text-[#FDF7EC] shadow-2xs'
                    : 'text-[#8C7A6B] hover:text-[#1C120C]'
                }`}
              >
                <Globe className="w-2.5 h-2.5" />
                <span>Public (Direct)</span>
              </button>
            </div>
          )}
        </div>

        <h1 className="font-baloo font-extrabold text-2xl sm:text-3xl text-[#1C120C] tracking-tight leading-tight mt-1">
          {isPhonePrivate ? 'Contact Owner via Tagtique' : 'Contact Vehicle Owner'}
        </h1>
        <p className="text-sm text-[#8C7A6B] font-medium mt-1 leading-relaxed">
          {isPhonePrivate
            ? 'The owner has set their number to private. Your message will be securely delivered to them through Tagtique.'
            : 'Select a reason below or tap to call or message the vehicle owner directly.'}
        </p>
      </div>

      {/* Privacy Mode Info Banner */}
      <div
        className={`p-3.5 rounded-2xl border text-xs flex items-start gap-3 transition-all ${
          isPhonePrivate
            ? 'bg-gradient-to-r from-emerald-500/10 via-amber-500/10 to-emerald-500/5 border-emerald-300/80 text-emerald-950'
            : 'bg-blue-50 border-blue-200 text-blue-950'
        }`}
      >
        {isPhonePrivate ? (
          <>
            <div className="w-8 h-8 rounded-xl bg-emerald-700 text-white flex items-center justify-center shrink-0 shadow-2xs">
              <Lock className="w-4 h-4" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-sm text-[#1C120C]">
                Tagtique Masked Proxy Bridge Active
              </span>
              <span className="text-[11.5px] text-[#5C4A3C] mt-0.5 leading-relaxed">
                The vehicle owner's personal phone number is <strong>100% hidden</strong>. When you tap WhatsApp or Call, you connect through Tagtique's automated bridge line without either party seeing private numbers.
              </span>
            </div>
          </>
        ) : (
          <>
            <div className="w-8 h-8 rounded-xl bg-blue-700 text-white flex items-center justify-center shrink-0 shadow-2xs">
              <Globe className="w-4 h-4" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-sm text-[#1C120C]">
                Direct Public Contact Enabled
              </span>
              <span className="text-[11.5px] text-[#5C4A3C] mt-0.5 leading-relaxed">
                The owner has made their phone number (<strong className="font-mono">{phone}</strong>) public. You are connecting directly with the driver.
              </span>
            </div>
          </>
        )}
      </div>

      {/* 2. Interactive Situational Reason Chips */}
      <div className="flex flex-col gap-2">
        <span className="text-xs font-bold uppercase tracking-wider text-[#8C7A6B] px-1">
          Select Situation Reason
        </span>
        <div className="grid grid-cols-2 gap-2 sm:gap-2.5">
          {QUICK_SCENARIOS.map((item) => {
            const Icon = item.icon;
            const isSelected = selectedScenario === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelectScenario(item)}
                className={`p-3 rounded-2xl border text-left flex items-center gap-2.5 transition-all cursor-pointer relative overflow-hidden ${
                  isSelected
                    ? 'bg-gradient-to-br from-[#1C120C] to-[#2E1F16] text-[#FDF7EC] border-[#1C120C] shadow-sm scale-[1.01]'
                    : 'bg-white hover:bg-[#FAF7F2] text-[#1C120C] border-[#EAE3D6] hover:border-[#1C120C]/30 shadow-2xs'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                    isSelected ? 'bg-amber-400 text-[#1C120C]' : 'bg-[#FAF7F2] text-[#1C120C]'
                  }`}
                >
                  <Icon className="w-4.5 h-4.5" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs sm:text-sm font-extrabold truncate leading-tight">
                    {item.label}
                  </span>
                  <span
                    className={`text-[10px] font-medium truncate ${
                      isSelected ? 'text-amber-200' : 'text-[#8C7A6B]'
                    }`}
                  >
                    Tap to apply
                  </span>
                </div>
                {isSelected && (
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 absolute top-2 right-2" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Primary CTA Actions */}
      <div className="flex flex-col gap-3">
        {/* WhatsApp Card (Primary) */}
        <div className="rounded-3xl bg-gradient-to-br from-emerald-600 to-emerald-800 p-4 sm:p-5 text-white shadow-warm-sm border border-emerald-500/50 flex flex-col gap-3.5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none" />

          <div className="flex items-center justify-between gap-3 relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white shrink-0 border border-white/20 shadow-xs">
                <MessageCircle className="w-6 h-6" />
              </div>
              <div className="flex flex-col">
                <span className="text-[11px] font-black uppercase tracking-wider text-emerald-200">
                  {isPhonePrivate ? 'Routed Through Us' : 'Fastest & Direct'}
                </span>
                <span className="font-baloo font-extrabold text-xl leading-tight text-white">
                  {isPhonePrivate ? 'WhatsApp via Tagtique Proxy' : 'Direct WhatsApp Alert'}
                </span>
              </div>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/20 text-white backdrop-blur-xs">
              Instant
            </span>
          </div>

          {/* Message Preview Quote */}
          <div className="p-3 rounded-xl bg-black/20 backdrop-blur-xs border border-white/10 text-xs sm:text-[13px] text-white/90 leading-relaxed font-medium">
            "{finalMessage}"
          </div>

          {/* Action Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 relative z-10">
            <button
              type="button"
              disabled={!hasPhone}
              onClick={() => {
                if (isPhonePrivate) {
                  openLink(whatsappUrl(proxyWhatsApp, proxyRelayMessage));
                } else {
                  openLink(whatsappUrl(phone, finalMessage));
                }
              }}
              className="w-full py-3 px-4 rounded-xl bg-white hover:bg-emerald-50 active:scale-[0.98] text-emerald-950 font-extrabold text-sm flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer disabled:opacity-50"
            >
              <Send className="w-4 h-4 text-emerald-700" />
              <span>{isPhonePrivate ? 'Send via Tagtique Proxy' : 'Send on WhatsApp'}</span>
            </button>

            <button
              type="button"
              disabled={!hasPhone}
              onClick={() => {
                if (isPhonePrivate) {
                  openLink(whatsappCallUrl(proxyWhatsApp));
                } else {
                  openLink(whatsappCallUrl(phone));
                }
              }}
              className="w-full py-3 px-4 rounded-xl bg-white/15 hover:bg-white/25 active:scale-[0.98] text-white font-bold text-sm flex items-center justify-center gap-2 border border-white/25 transition-all cursor-pointer disabled:opacity-50"
            >
              <Phone className="w-4 h-4 text-white" />
              <span>{isPhonePrivate ? 'Proxy WhatsApp Call' : 'WhatsApp Call'}</span>
            </button>
          </div>
        </div>

        {/* Voice Call Card */}
        <button
          type="button"
          disabled={!hasPhone}
          onClick={() => {
            if (isPhonePrivate) {
              openLink(telUrl(proxyPhone));
            } else {
              openLink(telUrl(phone));
            }
          }}
          className="w-full min-h-[76px] p-4 rounded-3xl bg-gradient-to-r from-[#1C120C] to-[#2B1B10] hover:from-[#26180F] hover:to-[#382315] active:scale-[0.99] transition-all flex items-center justify-between gap-4 text-left shadow-sm border border-amber-900/30 group cursor-pointer disabled:opacity-50"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-amber-400/15 border border-amber-400/30 flex items-center justify-center text-[#E6AF2E] shrink-0 group-hover:scale-105 transition-transform">
              <Phone className="w-6 h-6" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-base sm:text-lg text-[#FDF7EC] leading-tight">
                {isPhonePrivate ? 'Call via Tagtique Voice Proxy' : 'Direct Phone Call'}
              </span>
              <span className="text-xs text-white/70 font-medium mt-0.5">
                {isPhonePrivate
                  ? 'Connects via Tagtique automated bridge line (Owner number hidden)'
                  : `Calls ${phone} directly via your mobile phone dialer`}
              </span>
            </div>
          </div>
          <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-[#E6AF2E] shrink-0">
            <Phone className="w-4 h-4" />
          </div>
        </button>

        {/* Instant In-App Tagtique Relay Ping (Only in Private mode) */}
        {isPhonePrivate && (
          <button
            type="button"
            onClick={handleSendInAppPing}
            className={`w-full py-3.5 px-4 rounded-2xl border text-sm font-extrabold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs ${
              inAppAlertSent
                ? 'bg-emerald-600 text-white border-emerald-500'
                : 'bg-gradient-to-r from-amber-500/15 to-orange-500/10 border-amber-300 text-amber-950 hover:bg-amber-100/70'
            }`}
          >
            {inAppAlertSent ? (
              <>
                <Check className="w-4 h-4 text-white" />
                <span>Alert Dispatched to Owner's Phone!</span>
              </>
            ) : (
              <>
                <Radio className="w-4 h-4 text-amber-700 animate-pulse" />
                <span>Dispatch Instant In-App Alert to Owner</span>
              </>
            )}
          </button>
        )}

        {/* SMS Text Option */}
        <button
          type="button"
          disabled={!hasPhone}
          onClick={() => {
            if (isPhonePrivate) {
              openLink(smsUrl(proxyPhone, proxyRelayMessage));
            } else {
              openLink(smsUrl(phone, finalMessage));
            }
          }}
          className="w-full py-3 px-4 rounded-2xl bg-white hover:bg-[#FAF7F2] border border-[#EAE3D6] hover:border-[#1C120C]/30 text-[#1C120C] font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 shadow-2xs"
        >
          <MessageSquare className="w-4 h-4 text-[#8C7A6B]" />
          <span>{isPhonePrivate ? 'Send via Tagtique SMS Gateway' : 'Send Normal SMS Text'}</span>
        </button>
      </div>

      {/* 4. Optional Custom Message Box (Accordion) */}
      <div className="rounded-3xl bg-white border border-[#EAE3D6] p-4 sm:p-5 shadow-xs flex flex-col gap-3">
        <button
          type="button"
          onClick={() => setShowCustomInput(!showCustomInput)}
          className="flex items-center justify-between w-full text-left cursor-pointer"
        >
          <div className="flex flex-col">
            <span className="font-bold text-sm text-[#1C120C]">
              Customize or Edit Message
            </span>
            <span className="text-xs text-[#8C7A6B]">
              Add specific instructions or your name
            </span>
          </div>
          <div className="w-7 h-7 rounded-full bg-[#FAF7F2] border border-[#EAE3D6] flex items-center justify-center text-[#8C7A6B]">
            {showCustomInput ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </button>

        {showCustomInput && (
          <div className="flex flex-col gap-2 pt-2 border-t border-[#F2ECE1] animate-fadeIn">
            <textarea
              maxLength={300}
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your custom message here..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#EAE3D6] bg-[#FAF7F2] focus:bg-white text-sm text-[#1C120C] font-medium outline-none focus:border-[#E6AF2E] transition-all resize-none leading-relaxed"
            />
            <div className="flex items-center justify-between text-[11px] text-[#8C7A6B]">
              <span>Will be delivered when you tap WhatsApp or SMS</span>
              <span>{message.length}/300</span>
            </div>
          </div>
        )}
      </div>

      {/* 5. Emergency Guardian Escalation */}
      <div className="rounded-3xl bg-gradient-to-br from-amber-50 to-orange-50/50 border border-amber-200/80 p-4 sm:p-5 shadow-xs flex flex-col gap-3">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-400 flex items-center justify-center text-amber-900 shrink-0">
            <ShieldAlert className="w-5 h-5 text-amber-800" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-sm text-amber-950">
              Emergency or Owner Not Responding?
            </span>
            <span className="text-xs text-amber-900/80 mt-0.5 leading-relaxed">
              If this is an urgent safety concern or the vehicle owner cannot be reached, you can alert the registered secondary contact.
            </span>
          </div>
        </div>

        {hasGuardian ? (
          <div className="pt-2 border-t border-amber-200/60 flex items-center justify-between gap-2">
            <div className="text-xs font-mono font-bold text-amber-900">
              Guardian: {vehicle?.maskedGuardian || '+92 ••• ••••543'}
            </div>
            <button
              type="button"
              onClick={() =>
                openLink(
                  telUrl(
                    isPhonePrivate ? proxyPhone : guardianPhone
                  )
                )
              }
              className="px-3.5 py-1.5 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-extrabold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Call Guardian</span>
            </button>
          </div>
        ) : (
          <div className="text-[11px] text-amber-800/80 italic">
            Secondary emergency contact has not been configured by owner.
          </div>
        )}
      </div>
    </div>
  );
}

