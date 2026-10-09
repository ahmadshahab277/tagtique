import React, { useState } from 'react';
import {
  Phone,
  MessageCircle,
  AlertTriangle,
  Lightbulb,
  Car,
  Bell,
  ShieldAlert,
  UserCheck
} from 'lucide-react';
import { smsUrl, telUrl, whatsappUrl } from '../../utils/contactLinks';

export function formatPhoneDisplay(raw) {
  if (!raw) return 'Not available';
  const digits = String(raw).replace(/\D/g, '');
  if (digits.length === 11 && digits.startsWith('03')) {
    return `${digits.slice(0, 4)}-${digits.slice(4)}`;
  }
  if (digits.length === 12 && digits.startsWith('923')) {
    return `0${digits.slice(2, 5)}-${digits.slice(5)}`;
  }
  if (digits.length === 10 && digits.startsWith('3')) {
    return `0${digits.slice(0, 3)}-${digits.slice(3)}`;
  }
  return raw;
}

const QUICK_SCENARIOS = [
  {
    id: 'blocking',
    icon: Car,
    label: 'Car Blocking Way',
    getMessage: (plate) =>
      `Assalam-o-Alaikum! Your vehicle (${plate}) is currently blocking the path. Could you please move it when convenient? Thank you!`
  },
  {
    id: 'lights',
    icon: Lightbulb,
    label: 'Headlights On',
    getMessage: (plate) =>
      `Assalam-o-Alaikum! The lights on your vehicle (${plate}) appear to be left on.`
  },
  {
    id: 'window',
    icon: AlertTriangle,
    label: 'Window Open',
    getMessage: (plate) =>
      `Assalam-o-Alaikum! A window on your vehicle (${plate}) was left open/unattended.`
  },
  {
    id: 'alarm',
    icon: Bell,
    label: 'Alarm Ringing',
    getMessage: (plate) =>
      `Assalam-o-Alaikum! The security alarm on your vehicle (${plate}) is currently ringing.`
  }
];

function openLink(url) {
  if (!url) return;
  window.location.href = url;
}

export default function ActionCards({ vehicle }) {
  const plate = vehicle?.registrationNumber || 'ABC-123';
  const tagId = vehicle?.tagId || 'TAG-001';
  const ownerName = vehicle?.ownerName || 'Vehicle Owner';

  const defaultText = `Assalam-o-Alaikum! Your vehicle (${plate}) is currently blocking the path. Could you please move it when convenient? Thank you!`;

  const [selectedScenario, setSelectedScenario] = useState('blocking');
  const [message, setMessage] = useState(defaultText);
  const [showCustomInput, setShowCustomInput] = useState(false);

  const isPhonePrivate = (vehicle?.phonePrivacy || 'private') === 'private';
  const rawOwnerPhone = vehicle?.phoneNumber || '03001234567';
  const rawGuardianPhone =
    vehicle?.guardianNumber ||
    vehicle?.guardian_phone ||
    vehicle?.guardian_number ||
    vehicle?.emergencyPhone ||
    '03019876543';
  const guardianName = vehicle?.guardianName || vehicle?.guardian_name || 'Emergency Guardian';

  const proxyPhone = vehicle?.proxyPhone || '03292082080';
  const proxyWhatsApp = vehicle?.proxyWhatsApp || '923292082080';

  // Target numbers for owner actions
  const targetOwnerCall = isPhonePrivate ? proxyPhone : rawOwnerPhone;
  const targetOwnerWhatsApp = isPhonePrivate ? proxyWhatsApp : rawOwnerPhone;

  // Emergency Guardian is always directly reachable for urgent safety
  const targetGuardianCall = rawGuardianPhone;
  const targetGuardianWhatsApp = rawGuardianPhone;

  const handleSelectScenario = (scenario) => {
    setSelectedScenario(scenario.id);
    setMessage(scenario.getMessage(plate));
  };

  const finalMessage = message.trim() || defaultText;

  const proxyRelayMessage = `🚨 *[TAGTIQUE SMART ALERT]*\n\n📌 *Vehicle:* ${plate}\n🔑 *Tag ID:* ${tagId}\n\n💬 *Message for Owner:*\n"${finalMessage}"\n\n🛡️ _Sent securely via Tagtique QR System._`;

  const guardianEmergencyMessage = `🚨 *[EMERGENCY VEHICLE ALERT]*\n\nAssalam-o-Alaikum, I am contacting you as the registered emergency guardian for vehicle *${plate}* (${vehicle?.vehicleName || 'Vehicle'}).\n\nI am trying to reach the owner (${ownerName}), but am unable to connect. Please assist urgently.\n\nThank you!`;

  const ownerWhatsAppText = isPhonePrivate ? proxyRelayMessage : finalMessage;

  return (
    <div className="w-full flex flex-col gap-4">
      {/* 1. Main Action Card: Contact Vehicle Owner */}
      <div className="w-full bg-white rounded-3xl border border-[#EAE3D6] p-5 sm:p-6 shadow-sm flex flex-col gap-4">
        <div className="flex flex-col text-left">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h2 className="font-baloo font-extrabold text-2xl sm:text-3xl text-[#1C120C] leading-none">
              Contact Vehicle Owner
            </h2>
          </div>
          <p className="text-xs text-[#8C7A6B] font-medium mt-1.5 leading-relaxed">
            Choose a quick reason below, then tap WhatsApp or Call to alert the driver.
          </p>
        </div>

        {/* Quick Reason Chips */}
        <div className="grid grid-cols-2 gap-2">
          {QUICK_SCENARIOS.map((item) => {
            const Icon = item.icon;
            const isSelected = selectedScenario === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelectScenario(item)}
                className={`py-2.5 px-3 rounded-2xl border text-left flex items-center gap-2 transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#1C120C] text-[#FDF7EC] border-[#1C120C] shadow-sm'
                    : 'bg-[#FAF7F2] hover:bg-[#F2ECE1] text-[#1C120C] border-[#EAE3D6]'
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 ${
                    isSelected ? 'bg-amber-400 text-[#1C120C]' : 'bg-white text-[#1C120C]'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold truncate leading-tight">
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Message Preview Box */}
        <div className="p-3.5 rounded-2xl bg-[#FAF7F2] border border-[#EAE3D6] text-xs text-[#5C4A3C] leading-relaxed relative">
          <span className="font-bold text-[#1C120C] block mb-1">Pre-filled Message:</span>
          <p className="italic font-medium text-[#1C120C]">"{finalMessage}"</p>
          <button
            type="button"
            onClick={() => setShowCustomInput(!showCustomInput)}
            className="mt-2 text-[11px] font-bold text-amber-800 hover:text-amber-950 flex items-center gap-1 cursor-pointer"
          >
            <span>{showCustomInput ? '▲ Hide message editor' : '✏️ Tap to edit message text'}</span>
          </button>

          {showCustomInput && (
            <div className="mt-2.5 pt-2.5 border-t border-[#EAE3D6] flex flex-col gap-1.5 animate-fadeIn">
              <textarea
                rows={2}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message to the vehicle owner..."
                className="w-full px-3 py-2 rounded-xl bg-white border border-[#EAE3D6] text-xs text-[#1C120C] outline-none focus:border-amber-400"
              />
            </div>
          )}
        </div>

        {/* 2 Big Primary Buttons for Owner */}
        <div className="flex flex-col gap-2.5 pt-1">
          {/* WhatsApp Owner Button */}
          <button
            type="button"
            onClick={() => openLink(whatsappUrl(targetOwnerWhatsApp, ownerWhatsAppText))}
            className="w-full min-h-[58px] py-3.5 px-5 rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 active:scale-[0.99] text-white font-extrabold text-base flex items-center justify-center gap-3 shadow-warm-md transition-all cursor-pointer"
          >
            <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
              <MessageCircle className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-[10px] uppercase tracking-wider text-emerald-200 font-bold leading-none">
                Fastest Response
              </span>
              <span className="text-base font-black leading-tight">
                WhatsApp Vehicle Owner
              </span>
            </div>
          </button>

          {/* Call Owner Button */}
          <button
            type="button"
            onClick={() => openLink(telUrl(targetOwnerCall))}
            className="w-full min-h-[58px] py-3.5 px-5 rounded-2xl bg-gradient-to-r from-[#1C120C] to-[#2B1B10] hover:from-[#2B1B10] hover:to-[#1C120C] active:scale-[0.99] text-[#FDF7EC] font-extrabold text-base flex items-center justify-center gap-3 shadow-warm-md transition-all cursor-pointer border border-amber-900/30"
          >
            <div className="w-8 h-8 rounded-xl bg-amber-400/20 flex items-center justify-center shrink-0">
              <Phone className="w-5 h-5 text-[#E6AF2E]" />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-[10px] uppercase tracking-wider text-amber-300 font-bold leading-none">
                Direct Voice Call
              </span>
              <span className="text-base font-black leading-tight">
                Call Vehicle Owner
              </span>
            </div>
          </button>

          {/* Discreet SMS fallback */}
          <div className="text-center pt-0.5">
            <button
              type="button"
              onClick={() => openLink(smsUrl(targetOwnerCall, finalMessage))}
              className="text-xs text-[#8C7A6B] hover:text-[#1C120C] underline font-medium cursor-pointer"
            >
              Prefer standard SMS text message? Tap here
            </button>
          </div>
        </div>
      </div>

      {/* 2. DEDICATED EMERGENCY CONTACT (GUARDIAN) SECTION */}
      <div className="w-full bg-gradient-to-br from-amber-500/10 via-orange-500/10 to-amber-500/5 rounded-3xl border-2 border-amber-400/90 p-5 sm:p-6 shadow-sm flex flex-col gap-3.5 relative overflow-hidden">
        {/* Ambient glow */}
        <div className="absolute -top-12 -right-12 w-28 h-28 bg-amber-400/20 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-100 border border-red-300 text-red-900 text-[11px] font-black uppercase tracking-wider shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-red-600 animate-ping" />
            <span>Emergency Contact (Guardian)</span>
          </div>
          <span className="text-[11px] font-bold text-amber-900 bg-amber-200/60 px-2 py-0.5 rounded-full">
            24/7 Safety Line
          </span>
        </div>

        <div className="flex flex-col text-left">
          <h3 className="font-baloo font-extrabold text-xl sm:text-2xl text-[#1C120C] leading-tight">
            Emergency or Owner Not Responding?
          </h3>
          <p className="text-xs text-[#705540] font-medium mt-1 leading-relaxed">
            In case of an urgent emergency, accident, or if the driver does not answer, contact the registered guardian directly.
          </p>
        </div>

        {/* Guardian Contact Info Card */}
        <div className="p-3.5 rounded-2xl bg-white border border-amber-300/80 shadow-2xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 border border-amber-300 text-amber-900 flex items-center justify-center shrink-0">
              <UserCheck className="w-5 h-5 text-amber-900" />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-[10px] font-bold text-[#8C7A6B] uppercase tracking-wider leading-none">
                Registered Guardian
              </span>
              <span className="font-baloo font-extrabold text-base text-[#1C120C] leading-tight mt-0.5">
                {guardianName}
              </span>
              <span className="font-mono font-bold text-xs text-amber-950">
                {formatPhoneDisplay(rawGuardianPhone)}
              </span>
            </div>
          </div>
        </div>

        {/* 2 Immediate Emergency Action Buttons for Guardian */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-0.5">
          {/* Call Guardian Button */}
          <button
            type="button"
            onClick={() => openLink(telUrl(targetGuardianCall))}
            className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-700 hover:to-rose-800 active:scale-[0.98] text-white font-extrabold text-sm flex items-center justify-center gap-2.5 shadow-warm-xs transition-all cursor-pointer"
          >
            <Phone className="w-4.5 h-4.5 text-white" />
            <span>Call Guardian ({formatPhoneDisplay(rawGuardianPhone)})</span>
          </button>

          {/* WhatsApp Guardian Button */}
          <button
            type="button"
            onClick={() => openLink(whatsappUrl(targetGuardianWhatsApp, guardianEmergencyMessage))}
            className="w-full py-3.5 px-4 rounded-2xl bg-white hover:bg-emerald-50 active:scale-[0.98] text-emerald-900 border border-emerald-400 font-extrabold text-sm flex items-center justify-center gap-2 shadow-2xs transition-all cursor-pointer"
          >
            <MessageCircle className="w-4.5 h-4.5 text-emerald-600" />
            <span>WhatsApp Guardian</span>
          </button>
        </div>
      </div>

      {/* 3. Official Tagtique Helpline */}
      <div className="p-3 rounded-2xl bg-[#FAF7F2] border border-[#EAE3D6] text-center text-xs text-[#8C7A6B] flex items-center justify-center gap-2">
        <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0" />
        <span>
          Need Official Tagtique Assistance? Call Helpline:{' '}
          <a href="tel:03292082080" className="font-bold text-[#1C120C] underline font-mono">
            0329-2082080
          </a>
        </span>
      </div>
    </div>
  );
}
