import React, { useState } from 'react';
import {
  Phone,
  MessageCircle,
  AlertTriangle,
  Lightbulb,
  Car,
  Bell,
  ShieldAlert,
  UserCheck,
  ChevronDown,
  ChevronUp,
  Smartphone,
  Laptop,
  Tag
} from 'lucide-react';
import { smsUrl, telUrl, whatsappUrl } from '../../utils/contactLinks';
import { settingsService } from '../../services/settingsService';

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

function openLink(url) {
  if (!url) return;
  window.location.href = url;
}

export default function ActionCards({ vehicle }) {
  const plate = vehicle?.registrationNumber || 'TAG-1';
  const ownerName = vehicle?.ownerName || 'Tag Owner';

  // Determine target device/placement
  const target = vehicle?.itemTarget || vehicle?.target || (
    vehicle?.vehicleType?.toLowerCase().includes('iphone') ||
    vehicle?.vehicleType?.toLowerCase().includes('mobile') ||
    vehicle?.vehicleName?.toLowerCase().includes('iphone') ||
    vehicle?.vehicleName?.toLowerCase().includes('mobile')
      ? 'mobile'
      : vehicle?.vehicleType?.toLowerCase().includes('macbook') ||
        vehicle?.vehicleType?.toLowerCase().includes('laptop') ||
        vehicle?.vehicleName?.toLowerCase().includes('macbook') ||
        vehicle?.vehicleName?.toLowerCase().includes('laptop')
      ? 'laptop'
      : vehicle?.vehicleType?.toLowerCase().includes('car') ||
        vehicle?.vehicleType?.toLowerCase().includes('vehicle') ||
        vehicle?.vehicleName?.toLowerCase().includes('car') ||
        vehicle?.vehicleName?.toLowerCase().includes('vehicle')
      ? 'vehicle'
      : 'mobile'
  );

  const getScenarios = () => {
    if (target === 'mobile') {
      return {
        header: 'Contact Phone Owner',
        subtitle: 'Found this mobile device or need to alert the owner? Tap WhatsApp or Call.',
        whatsappLabel: 'WhatsApp Phone Owner',
        callLabel: 'Call Phone Owner',
        list: [
          {
            id: 'found_phone',
            icon: Smartphone,
            label: 'Found Your Phone',
            getMessage: () =>
              `Assalam-o-Alaikum! I have found your mobile phone (${plate}). It is safe with me. Please reply so we can arrange to return it to you safely.`
          },
          {
            id: 'left_behind',
            icon: AlertTriangle,
            label: 'Left in Public Area',
            getMessage: () =>
              `Assalam-o-Alaikum! Your mobile device (${plate}) was left behind. Please reply to retrieve it.`
          },
          {
            id: 'emergency',
            icon: ShieldAlert,
            label: 'Emergency Alert',
            getMessage: () =>
              `Assalam-o-Alaikum! Reaching out urgently via your Tagtique emergency QR tag regarding your phone.`
          },
          {
            id: 'direct_msg',
            icon: MessageCircle,
            label: 'Direct Note',
            getMessage: () =>
              `Assalam-o-Alaikum! I scanned your Tagtique emergency QR tag on your mobile. Please get in touch.`
          }
        ]
      };
    }

    if (target === 'laptop') {
      return {
        header: 'Contact Laptop Owner',
        subtitle: 'Found this laptop or bag? Tap WhatsApp or Call to alert the owner.',
        whatsappLabel: 'WhatsApp Laptop Owner',
        callLabel: 'Call Laptop Owner',
        list: [
          {
            id: 'found_laptop',
            icon: Laptop,
            label: 'Found Laptop / Bag',
            getMessage: () =>
              `Assalam-o-Alaikum! I found your laptop / gear bag (${plate}). It is safe with me. Please reply to arrange return.`
          },
          {
            id: 'at_desk',
            icon: AlertTriangle,
            label: 'Left at Desk / Cafe',
            getMessage: () =>
              `Assalam-o-Alaikum! Your laptop device (${plate}) was left behind in a public area. Reaching out so you can retrieve it.`
          },
          {
            id: 'reception',
            icon: UserCheck,
            label: 'Handed to Security',
            getMessage: () =>
              `Assalam-o-Alaikum! Your laptop (${plate}) was found and handed to the building reception / security for safekeeping.`
          },
          {
            id: 'direct_msg',
            icon: MessageCircle,
            label: 'Direct Contact',
            getMessage: () =>
              `Assalam-o-Alaikum! I scanned your Tagtique laptop tag to reach you.`
          }
        ]
      };
    }

    if (target === 'vehicle') {
      return {
        header: 'Contact Vehicle Owner',
        subtitle: 'Choose a quick reason below, then tap WhatsApp or Call to alert the driver.',
        whatsappLabel: 'WhatsApp Vehicle Owner',
        callLabel: 'Call Vehicle Owner',
        list: [
          {
            id: 'blocking',
            icon: Car,
            label: 'Car Blocking Way',
            getMessage: () =>
              `Assalam-o-Alaikum! Your vehicle (${plate}) is currently blocking the path. Could you please move it when convenient? Thank you!`
          },
          {
            id: 'lights',
            icon: Lightbulb,
            label: 'Headlights Left On',
            getMessage: () =>
              `Assalam-o-Alaikum! The lights on your vehicle (${plate}) appear to be left on.`
          },
          {
            id: 'window',
            icon: AlertTriangle,
            label: 'Window Open',
            getMessage: () =>
              `Assalam-o-Alaikum! A window on your vehicle (${plate}) was left open/unattended.`
          },
          {
            id: 'alarm',
            icon: Bell,
            label: 'Alarm Ringing',
            getMessage: () =>
              `Assalam-o-Alaikum! The security alarm on your vehicle (${plate}) is currently ringing.`
          }
        ]
      };
    }

    return {
      header: 'Contact Owner',
      subtitle: 'Found this item with Tagtique emergency tag? Tap WhatsApp or Call.',
      whatsappLabel: 'WhatsApp Owner',
      callLabel: 'Call Owner',
      list: [
        {
          id: 'found_item',
          icon: Tag,
          label: 'Found Your Belonging',
          getMessage: () =>
            `Assalam-o-Alaikum! I found your item (${plate}) with the Tagtique emergency QR tag. Please let me know how to return it.`
        },
        {
          id: 'left_behind',
          icon: AlertTriangle,
          label: 'Left in Public Area',
          getMessage: () =>
            `Assalam-o-Alaikum! Your belonging (${plate}) was left behind. Reaching out so you can retrieve it safely.`
        },
        {
          id: 'emergency',
          icon: ShieldAlert,
          label: 'Emergency Alert',
          getMessage: () =>
            `Assalam-o-Alaikum! Contacting you urgently via your Tagtique emergency identity tag.`
        },
        {
          id: 'direct_msg',
          icon: MessageCircle,
          label: 'Direct Contact',
          getMessage: () =>
            `Assalam-o-Alaikum! I scanned your Tagtique smart QR code to get in touch.`
        }
      ]
    };
  };

  const scenarioConfig = getScenarios();
  const defaultText = scenarioConfig.list[0].getMessage();

  const [selectedScenario, setSelectedScenario] = useState(scenarioConfig.list[0].id);
  const [message, setMessage] = useState(defaultText);
  const [showCustomInput, setShowCustomInput] = useState(false);

  const rawOwnerPhone = vehicle?.phoneNumber || '';
  const rawGuardianPhone =
    vehicle?.guardianNumber ||
    vehicle?.guardian_phone ||
    vehicle?.guardian_number ||
    vehicle?.emergencyPhone ||
    '03019876543';
  const guardianName = vehicle?.guardianName || vehicle?.guardian_name || 'Emergency Guardian';

  const proxyPhone = vehicle?.proxyPhone || settingsService.getSupportPhone();

  // Target numbers for owner actions
  const targetOwnerCall = rawOwnerPhone;
  const targetOwnerWhatsApp = rawOwnerPhone;

  // Emergency Guardian target numbers
  const targetGuardianCall = rawGuardianPhone;
  const targetGuardianWhatsApp = rawGuardianPhone;

  const handleSelectScenario = (item) => {
    setSelectedScenario(item.id);
    setMessage(item.getMessage());
  };

  const finalMessage = message.trim() || defaultText;

  const guardianEmergencyMessage = `🚨 *[EMERGENCY TAG ALERT]*\n\nAssalam-o-Alaikum, I am contacting you as the registered emergency guardian for *${plate}* (${vehicle?.vehicleName || 'Tagtique Item'}).\n\nI am trying to reach the owner (${ownerName}), but am unable to connect. Please assist urgently.\n\nThank you!`;

  return (
    <div className="w-full flex flex-col gap-5">
      {/* 1. Main Action Card */}
      <div className="w-full bg-[#12131A] rounded-[28px] border border-white/10 p-5 sm:p-6 shadow-[0_20px_50px_rgba(0,0,0,0.6)] flex flex-col gap-5 relative backdrop-blur-xl">
        <div className="flex flex-col text-left">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_10px_rgba(52,211,153,0.8)]" />
            <h2 className="font-extrabold text-2xl sm:text-3xl text-white font-manrope leading-none tracking-tight">
              {scenarioConfig.header}
            </h2>
          </div>
          <p className="text-xs text-white/60 font-medium mt-2 leading-relaxed">
            {scenarioConfig.subtitle}
          </p>
        </div>

        {/* Quick Reason Chips */}
        <div className="grid grid-cols-2 gap-2.5">
          {scenarioConfig.list.map((item) => {
            const Icon = item.icon;
            const isSelected = selectedScenario === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelectScenario(item)}
                className={`py-3 px-3.5 rounded-2xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-black border-amber-400 shadow-[0_0_25px_rgba(245,158,11,0.35)]'
                    : 'bg-white/[0.03] hover:bg-white/[0.07] text-white/80 border-white/10 hover:border-white/20'
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 ${
                    isSelected ? 'bg-black/20 text-black' : 'bg-white/10 text-amber-400'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <span className={`text-xs truncate leading-tight ${isSelected ? 'font-extrabold text-black' : 'font-bold text-white'}`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Message Preview Box */}
        <div className="p-4 rounded-2xl bg-black/40 border border-white/10 text-xs text-white/70 leading-relaxed relative">
          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 block mb-1.5">
            Pre-filled Message:
          </span>
          <p className="italic font-medium text-white/95 leading-relaxed">
            "{finalMessage}"
          </p>
          <button
            type="button"
            onClick={() => setShowCustomInput(!showCustomInput)}
            className="mt-3 text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            {showCustomInput ? (
              <>
                <ChevronUp className="w-3.5 h-3.5" />
                <span>Hide message editor</span>
              </>
            ) : (
              <>
                <span>✏️ Tap to edit message text</span>
              </>
            )}
          </button>

          {showCustomInput && (
            <div className="mt-3 pt-3 border-t border-white/10 flex flex-col gap-2">
              <textarea
                rows={2}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message to the owner..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#181920] border border-white/15 text-xs text-white outline-none focus:border-amber-400 transition-colors resize-none"
              />
            </div>
          )}
        </div>

        {typeof navigator !== 'undefined' && !navigator.onLine && (
          <div className="p-3 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold flex items-center gap-2">
            <span>⚠️ Offline Mode Active — Phone calls connect directly via cellular line.</span>
          </div>
        )}

        {/* 2 Big Primary Buttons for Owner */}
        <div className="flex flex-col gap-3 pt-1">
          {/* WhatsApp Owner Button */}
          <button
            type="button"
            onClick={() => {
              if (typeof navigator !== 'undefined' && !navigator.onLine) {
                alert('WhatsApp requires an active internet connection. Connecting you via standard voice call instead...');
                openLink(telUrl(targetOwnerCall));
                return;
              }
              openLink(whatsappUrl(targetOwnerWhatsApp, finalMessage));
            }}
            className="w-full min-h-[58px] py-3.5 px-5 rounded-2xl bg-[#25D366] hover:bg-[#20ba59] active:scale-[0.99] text-black font-extrabold text-base flex items-center justify-center gap-3.5 shadow-[0_4px_25px_rgba(37,211,102,0.35)] transition-all cursor-pointer"
          >
            <div className="w-9 h-9 rounded-xl bg-black/15 flex items-center justify-center shrink-0">
              <MessageCircle className="w-5 h-5 text-black" />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-[10px] uppercase tracking-wider text-black/70 font-black leading-none">
                {typeof navigator !== 'undefined' && !navigator.onLine ? 'Requires Internet' : 'Fastest Response'}
              </span>
              <span className="text-base font-black leading-tight text-black mt-0.5">
                {scenarioConfig.whatsappLabel}
              </span>
            </div>
          </button>

          {/* Call Owner Button */}
          <button
            type="button"
            onClick={() => openLink(telUrl(targetOwnerCall))}
            className="w-full min-h-[58px] py-3.5 px-5 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 active:scale-[0.99] text-black font-extrabold text-base flex items-center justify-center gap-3.5 shadow-[0_4px_25px_rgba(245,158,11,0.25)] transition-all cursor-pointer"
          >
            <div className="w-9 h-9 rounded-xl bg-black/15 flex items-center justify-center shrink-0">
              <Phone className="w-5 h-5 text-black" />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-[10px] uppercase tracking-wider text-black/70 font-black leading-none">
                Direct Call (Works Offline)
              </span>
              <span className="text-base font-black leading-tight text-black mt-0.5">
                {`${scenarioConfig.callLabel} (${formatPhoneDisplay(rawOwnerPhone)})`}
              </span>
            </div>
          </button>

          {/* Discreet SMS fallback */}
          <div className="text-center pt-1">
            <button
              type="button"
              onClick={() => openLink(smsUrl(targetOwnerCall, finalMessage))}
              className="text-xs text-white/50 hover:text-white underline font-medium cursor-pointer transition-colors"
            >
              Prefer standard SMS text message? Tap here
            </button>
          </div>
        </div>
      </div>

      {/* 2. DEDICATED EMERGENCY CONTACT (GUARDIAN) SECTION */}
      <div className="w-full bg-gradient-to-br from-red-950/40 via-[#180E12] to-[#12131A] rounded-[28px] border-2 border-red-500/40 p-5 sm:p-6 shadow-[0_0_40px_rgba(239,68,68,0.15)] flex flex-col gap-4 relative overflow-hidden backdrop-blur-xl">
        {/* Ambient red glow */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-red-600/15 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/20 border border-red-500/40 text-red-400 text-[11px] font-black uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
            <span>Emergency Contact (Guardian)</span>
          </div>
          <span className="text-[11px] font-bold text-red-200 bg-red-900/40 border border-red-500/20 px-2.5 py-0.5 rounded-full">
            24/7 Safety Line
          </span>
        </div>

        <div className="flex flex-col text-left">
          <h3 className="font-extrabold text-xl sm:text-2xl text-white leading-tight font-manrope">
            Emergency or Owner Not Responding?
          </h3>
          <p className="text-xs text-white/70 font-medium mt-1 leading-relaxed">
            In case of an urgent emergency or if the owner does not answer, contact the registered guardian directly.
          </p>
        </div>

        {/* Guardian Contact Info Card */}
        <div className="p-4 rounded-2xl bg-black/50 border border-red-500/25 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-500/20 border border-red-500/40 text-red-400 flex items-center justify-center shrink-0">
              <UserCheck className="w-5 h-5 text-red-400" />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-[10px] font-bold text-white/40 uppercase tracking-wider leading-none">
                Registered Guardian
              </span>
              <span className="font-extrabold text-base text-white leading-tight mt-1">
                {guardianName}
              </span>
              <span className="font-mono font-bold text-xs text-red-400 mt-0.5">
                {formatPhoneDisplay(rawGuardianPhone)}
              </span>
            </div>
          </div>
        </div>

        {/* 2 Immediate Emergency Action Buttons for Guardian */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-0.5">
          {/* Call Guardian Button */}
          <button
            type="button"
            onClick={() => openLink(telUrl(targetGuardianCall))}
            className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 active:scale-[0.98] text-white font-extrabold text-sm flex items-center justify-center gap-2.5 shadow-[0_0_25px_rgba(239,68,68,0.35)] transition-all cursor-pointer"
          >
            <Phone className="w-4 h-4 text-white" />
            <span>Call Guardian ({formatPhoneDisplay(rawGuardianPhone)})</span>
          </button>

          {/* WhatsApp Guardian Button */}
          <button
            type="button"
            onClick={() => openLink(whatsappUrl(targetGuardianWhatsApp, guardianEmergencyMessage))}
            className="w-full py-3.5 px-4 rounded-2xl bg-white/10 hover:bg-white/15 active:scale-[0.98] text-white border border-white/20 font-extrabold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <MessageCircle className="w-4 h-4 text-emerald-400" />
            <span>WhatsApp Guardian</span>
          </button>
        </div>
      </div>

      {/* 3. Official Tagtique Helpline */}
      <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 text-center text-xs text-white/50 flex items-center justify-center gap-2">
        <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
        <span>
          Need Official Assistance? Call Helpline:{' '}
          <a href={`tel:${proxyPhone}`} className="font-bold text-amber-400 hover:text-amber-300 underline font-mono">
            {proxyPhone}
          </a>
        </span>
      </div>
    </div>
  );
}
