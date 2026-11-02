import React, { useState } from 'react';
import {
  Smartphone,
  Laptop,
  Car,
  Briefcase,
  Key,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Copy,
  Check,
  Phone,
  MessageSquare,
  Award,
  MapPin,
  Lock,
  Edit3,
  ExternalLink,
  AlertTriangle,
  Info
} from 'lucide-react';
import { TAG_CATEGORIES } from './QrRegistrationView';
import { tagRegistryService } from '../../services/tagRegistryService';

function WhatsAppIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.007c.101.005.232-.038.36.27.13.313.447 1.091.487 1.171.04.081.066.174.013.281-.053.107-.08.174-.159.268-.08.093-.167.208-.239.279-.08.08-.163.167-.07.327.093.159.414.683.888 1.106.611.544 1.127.712 1.286.792.159.08.252.067.346-.04.093-.107.404-.471.512-.632.107-.16.216-.134.364-.08.148.053.94.443 1.102.523.162.08.27.12.31.187.04.067.04.387-.104.792z"/>
    </svg>
  );
}

export default function QrContactView({
  tag,
  onOpenEdit
}) {
  const [copied, setCopied] = useState(false);
  const [pinPromptOpen, setPinPromptOpen] = useState(false);
  const [enteredPin, setEnteredPin] = useState('');
  const [pinError, setPinError] = useState('');

  // Situation reasons tailored to item category
  const getSituationChips = (catId) => {
    switch (catId) {
      case 'vehicle':
        return [
          { id: 'blocking', label: 'Car Blocking Way', text: 'Assalam-o-Alaikum! Your vehicle ({tagId}) is currently blocking the path. Could you please move it slightly?' },
          { id: 'lights', label: 'Headlights On', text: 'Assalam-o-Alaikum! Your headlights/interior lights are left ON for your vehicle ({tagId}).' },
          { id: 'window', label: 'Window Open', text: 'Assalam-o-Alaikum! Your vehicle ({tagId}) window is rolled down. Alerting you for safety.' },
          { id: 'alarm', label: 'Alarm Ringing', text: 'Assalam-o-Alaikum! Your vehicle ({tagId}) alarm is going off.' }
        ];
      case 'laptop':
        return [
          { id: 'found', label: 'Found Your Laptop', text: 'Assalam-o-Alaikum! I have found your laptop ({tagId}). It is safe with me. Please reply so we can arrange its return.' },
          { id: 'workplace', label: 'Left at Cafe / Office', text: 'Assalam-o-Alaikum! Your laptop ({tagId}) was left behind at the desk/cafe. It has been secured safely.' },
          { id: 'urgent', label: 'Urgent Return', text: 'Assalam-o-Alaikum! I have your laptop with Tagtique Tag ({tagId}). Please call or message me to retrieve it.' },
          { id: 'general', label: 'Quick Note', text: 'Assalam-o-Alaikum! Alerting you regarding your laptop ({tagId}).' }
        ];
      case 'bag':
        return [
          { id: 'found', label: 'Found Your Bag', text: 'Assalam-o-Alaikum! I have found your bag/luggage with Tagtique Tag ({tagId}). It is in safe hands.' },
          { id: 'terminal', label: 'Left in Transit', text: 'Assalam-o-Alaikum! Your bag ({tagId}) was left behind. Please reach out to collect it.' },
          { id: 'urgent', label: 'Urgent Alert', text: 'Assalam-o-Alaikum! Urgent: I found your luggage ({tagId}). Please reply.' }
        ];
      case 'keys':
        return [
          { id: 'found', label: 'Found Your Keys', text: 'Assalam-o-Alaikum! I found your set of keys with Tagtique Tag ({tagId}). Please contact me to get them back.' },
          { id: 'dropped', label: 'Dropped on Floor', text: 'Assalam-o-Alaikum! Your keys ({tagId}) dropped nearby. I picked them up for you safely.' }
        ];
      default: // mobile or sticker
        return [
          { id: 'found', label: 'Found Your Phone', text: 'Assalam-o-Alaikum! I have found your smartphone ({tagId}). It is safe with me. Please reply so we can arrange its safe return.' },
          { id: 'left', label: 'Left in Public Area', text: 'Assalam-o-Alaikum! Your phone was left behind with Tagtique ID ({tagId}). It has been kept safe.' },
          { id: 'urgent', label: 'Emergency Alert', text: 'Assalam-o-Alaikum! I have your mobile phone ({tagId}). Please get in touch promptly.' },
          { id: 'general', label: 'Direct Note', text: 'Assalam-o-Alaikum! Reaching out regarding your Tagtique-tagged device ({tagId}).' }
        ];
    }
  };

  const chips = getSituationChips(tag.category || tag.itemTarget || 'mobile');
  const [selectedChipId, setSelectedChipId] = useState(chips[0]?.id || '');
  const [customMessage, setCustomMessage] = useState(
    chips[0]?.text?.replace('{tagId}', tag.token || tag.tagId || 'TAG-1') || ''
  );

  const handleChipClick = (chip) => {
    setSelectedChipId(chip.id);
    const resolvedText = chip.text.replace('{tagId}', tag.token || tag.tagId || 'TAG-1');
    setCustomMessage(resolvedText);
  };

  const handleCopyTagId = () => {
    navigator.clipboard?.writeText(tag.token || tag.tagId || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleVerifyPin = (e) => {
    e.preventDefault();
    setPinError('');
    const isValid = tagRegistryService.verifyPin(tag.token || tag.tagId, enteredPin);
    if (isValid) {
      setPinPromptOpen(false);
      setEnteredPin('');
      if (onOpenEdit) onOpenEdit();
    } else {
      setPinError('Incorrect 4-digit PIN. Please try again.');
    }
  };

  const categoryObj = TAG_CATEGORIES.find((c) => c.id === (tag.category || tag.itemTarget)) || TAG_CATEGORIES[0];
  const CategoryIcon = categoryObj.icon;

  // Clean phone number for WhatsApp: ensure leading country code
  const rawPhone = String(tag.phoneNumber || '').replace(/\D/g, '');
  const cleanPhoneForWa = rawPhone.startsWith('0')
    ? '92' + rawPhone.slice(1)
    : rawPhone.startsWith('92')
    ? rawPhone
    : '92' + rawPhone;

  const waLink = `https://wa.me/${cleanPhoneForWa}?text=${encodeURIComponent(customMessage)}`;
  const callLink = `tel:${tag.phoneNumber}`;
  const guardianCallLink = tag.guardianNumber ? `tel:${tag.guardianNumber}` : null;

  return (
    <div className="w-full max-w-xl mx-auto px-4 sm:px-6 py-8 flex flex-col gap-6 font-manrope">
      
      {/* ================= HERO VERIFIED IDENTITY CARD ================= */}
      <div className="bg-[#12131A] border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col gap-5 relative overflow-hidden">
        
        {/* Subtle Ambient Radial Glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-400/5 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header Pill */}
        <div className="flex items-center justify-between gap-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-mono text-xs font-bold text-emerald-400 tracking-wider">
              VERIFIED TAGTIQUE ID
            </span>
          </div>

          <div className="flex items-center gap-1.5 font-mono text-xs text-white/60 bg-white/[0.04] px-2.5 py-1 rounded-full border border-white/10">
            <span>ID: {tag.token || tag.tagId}</span>
            <button
              type="button"
              onClick={handleCopyTagId}
              className="text-white/40 hover:text-white transition-colors cursor-pointer"
              title="Copy ID"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Center Tag Identification */}
        <div className="flex items-start justify-between gap-4 pt-1">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-400/15 border border-amber-400/30 text-amber-400 flex items-center justify-center shrink-0 shadow-lg">
              <CategoryIcon className="w-7 h-7" />
            </div>

            <div className="flex flex-col">
              <span className="font-mono text-xs font-bold text-amber-400 uppercase tracking-widest">
                {categoryObj.label}
              </span>
              <h1 className="font-extrabold text-2xl sm:text-3xl text-white tracking-tight leading-tight mt-0.5">
                {tag.itemName || tag.vehicleName || 'Tagtique Item'}
              </h1>
              <div className="flex items-center gap-2 text-xs text-white/60 mt-1">
                <span>Owner: <strong className="text-white">{tag.ownerName || 'Verified Owner'}</strong></span>
                {tag.city && (
                  <>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-amber-400" />
                      {tag.city}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* REWARD BADGE IF OFFERED */}
        {tag.rewardOffered && (
          <div className="p-3 rounded-2xl bg-gradient-to-r from-amber-400/15 to-amber-500/10 border border-amber-400/35 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-400/20 text-amber-400 flex items-center justify-center shrink-0">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <span className="font-extrabold text-xs text-amber-300 block">
                Finder Reward Offered
              </span>
              <span className="text-[11px] text-white/70 block">
                The owner offers a return reward as thanks for your prompt honesty.
              </span>
            </div>
          </div>
        )}

        {/* OWNER'S CUSTOM NOTE */}
        {tag.customNote && (
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 text-xs text-white/85 leading-relaxed italic relative">
            <div className="text-[10px] uppercase font-mono font-bold text-amber-400/80 mb-1 not-italic">
              Note from Owner:
            </div>
            "{tag.customNote}"
          </div>
        )}

      </div>

      {/* ================= CONTACT ACTIONS CARD ================= */}
      <div className="bg-[#12131A] border border-white/10 rounded-3xl p-6 sm:p-7 shadow-xl flex flex-col gap-5">
        <div>
          <h2 className="font-extrabold text-lg text-white">
            Contact Owner Directly
          </h2>
          <p className="text-xs text-white/60 mt-0.5">
            Pick a quick alert reason below or customize the message, then tap WhatsApp or Call.
          </p>
        </div>

        {/* Situation Chips */}
        <div className="grid grid-cols-2 gap-2.5">
          {chips.map((chip) => {
            const isSelected = selectedChipId === chip.id;
            return (
              <button
                key={chip.id}
                type="button"
                onClick={() => handleChipClick(chip)}
                className={`py-2.5 px-3.5 rounded-xl border text-xs font-bold transition-all text-left truncate cursor-pointer ${
                  isSelected
                    ? 'bg-amber-400 text-black border-amber-400 shadow-md font-extrabold'
                    : 'bg-white/[0.03] border-white/10 text-white/80 hover:bg-white/[0.06] hover:text-white'
                }`}
              >
                {chip.label}
              </button>
            );
          })}
        </div>

        {/* Editable Message Preview Box */}
        <div>
          <label className="block text-[11px] font-mono text-white/50 uppercase tracking-wider mb-1.5 flex items-center justify-between">
            <span>Pre-Filled WhatsApp Message</span>
            <span className="text-[10px] text-white/40">Tap below to customize</span>
          </label>
          <textarea
            rows={3}
            value={customMessage}
            onChange={(e) => setCustomMessage(e.target.value)}
            className="w-full p-3 rounded-2xl bg-white/[0.03] border border-white/10 text-white text-xs leading-relaxed outline-none focus:border-amber-400 transition-all font-sans"
          />
        </div>

        {/* PRIMARY ACTION BUTTONS */}
        <div className="flex flex-col gap-3 pt-1">
          {/* WhatsApp Direct Button */}
          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-4 px-6 rounded-2xl bg-[#25D366] hover:bg-[#20ba59] text-white font-extrabold text-sm flex items-center justify-center gap-2.5 shadow-[0_0_25px_rgba(37,211,102,0.3)] transition-all cursor-pointer"
          >
            <WhatsAppIcon className="w-5 h-5 text-white" />
            <span>Message on WhatsApp</span>
          </a>

          {/* Direct Call Button (if enabled) */}
          {tag.callEnabled !== false && (
            <a
              href={callLink}
              className="w-full py-3.5 px-6 rounded-2xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/15 text-white font-extrabold text-sm flex items-center justify-center gap-2.5 transition-all"
            >
              <Phone className="w-4 h-4 text-emerald-400" />
              <span>Direct Phone Call</span>
            </a>
          )}

          {/* Emergency / Backup Phone (if provided) */}
          {guardianCallLink && (
            <a
              href={guardianCallLink}
              className="w-full py-3 px-6 rounded-2xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/10 text-white/80 font-bold text-xs flex items-center justify-center gap-2 transition-all"
            >
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>Call Alternate / Emergency Contact</span>
            </a>
          )}
        </div>

        {/* Safety Note */}
        <div className="pt-3 border-t border-white/10 flex items-center gap-2.5 text-[11px] text-white/50 leading-relaxed">
          <Info className="w-4 h-4 text-amber-400 shrink-0" />
          <span>
            Tagtique Security: Always arrange to return lost items in a secure, well-lit public space.
          </span>
        </div>
      </div>

      {/* ================= OWNER MANAGEMENT DRAWER / LINK ================= */}
      <div className="flex flex-col items-center justify-center gap-3 text-center pt-2">
        {!pinPromptOpen ? (
          <button
            type="button"
            onClick={() => setPinPromptOpen(true)}
            className="text-xs text-white/50 hover:text-amber-400 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Are you the owner? Manage or Edit Tag Settings</span>
          </button>
        ) : (
          <form onSubmit={handleVerifyPin} className="w-full max-w-sm bg-[#12131A] border border-amber-400/30 rounded-2xl p-4 flex flex-col gap-3 shadow-xl">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-xs text-white flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-amber-400" />
                <span>Enter 4-Digit Management PIN</span>
              </span>
              <button
                type="button"
                onClick={() => { setPinPromptOpen(false); setPinError(''); }}
                className="text-white/40 hover:text-white text-xs cursor-pointer"
              >
                Cancel
              </button>
            </div>

            <div className="flex gap-2">
              <input
                type="password"
                maxLength={4}
                required
                autoFocus
                value={enteredPin}
                onChange={(e) => setEnteredPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                placeholder="••••"
                className="flex-1 py-2 px-3 text-center tracking-widest font-mono text-base font-bold rounded-xl bg-white/[0.05] border border-white/15 focus:border-amber-400 text-amber-400 outline-none"
              />
              <button
                type="submit"
                className="py-2 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-extrabold text-xs transition-colors cursor-pointer"
              >
                Verify & Edit
              </button>
            </div>

            {pinError && (
              <span className="text-[11px] text-red-400 font-semibold">{pinError}</span>
            )}
          </form>
        )}
      </div>

    </div>
  );
}
