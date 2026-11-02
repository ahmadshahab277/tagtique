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
  Info,
  UserPlus,
  HelpCircle,
  FileQuestion,
  ArrowRight
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
  hasInfo = false,
  onOpenRegister,
  onOpenEdit
}) {
  const [copied, setCopied] = useState(false);
  const [passcodePromptOpen, setPasscodePromptOpen] = useState(false);
  const [enteredPasscode, setEnteredPasscode] = useState('');
  const [passcodeError, setPasscodeError] = useState('');

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

  const tagId = tag?.token || tag?.tagId || 'TGT-716242';
  const categoryId = tag?.category || tag?.itemTarget || 'mobile';
  const categoryObj = TAG_CATEGORIES.find((c) => c.id === categoryId) || TAG_CATEGORIES[0];
  const CategoryIcon = categoryObj.icon;

  const chips = getSituationChips(categoryId);
  const [selectedChipId, setSelectedChipId] = useState(chips[0]?.id || '');
  const [customMessage, setCustomMessage] = useState(
    chips[0]?.text?.replace('{tagId}', tagId) || ''
  );

  const handleChipClick = (chip) => {
    setSelectedChipId(chip.id);
    const resolvedText = chip.text.replace('{tagId}', tagId);
    setCustomMessage(resolvedText);
  };

  const handleCopyTagId = () => {
    navigator.clipboard?.writeText(tagId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // 5-digit passcode verification to unlock editing
  const handleVerifyPasscode = (e) => {
    e.preventDefault();
    setPasscodeError('');
    if (enteredPasscode.length !== 5) {
      setPasscodeError('Please enter all 5 digits of your passcode.');
      return;
    }
    const isValid = tagRegistryService.verifyPasscode(tagId, enteredPasscode);
    if (isValid) {
      setPasscodePromptOpen(false);
      setEnteredPasscode('');
      if (onOpenEdit) onOpenEdit();
    } else {
      setPasscodeError('Incorrect 5-digit passcode. Please try again.');
    }
  };

  // Clean phone number for WhatsApp
  const rawPhone = String(tag?.phoneNumber || '').replace(/\D/g, '');
  const cleanPhoneForWa = rawPhone.startsWith('0')
    ? '92' + rawPhone.slice(1)
    : rawPhone.startsWith('92')
    ? rawPhone
    : '92' + rawPhone;

  const waLink = `https://wa.me/${cleanPhoneForWa}?text=${encodeURIComponent(customMessage)}`;
  const callLink = `tel:${tag?.phoneNumber}`;
  const guardianCallLink = tag?.guardianNumber ? `tel:${tag.guardianNumber}` : null;

  return (
    <div className="w-full max-w-xl mx-auto px-4 sm:px-6 py-6 flex flex-col gap-6 font-manrope">
      
      {/* ================= TOP ACTION / REGISTRATION BANNER ================= */}
      {!hasInfo ? (
        /* FIRST-TIME REGISTRATION OPTION ON TOP (When NO INFO added yet) */
        <div className="bg-gradient-to-r from-amber-400/20 via-amber-400/10 to-amber-500/20 border-2 border-amber-400/40 rounded-3xl p-5 sm:p-6 shadow-[0_0_40px_rgba(245,178,31,0.15)] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 text-center sm:text-left">
            <div className="w-12 h-12 rounded-2xl bg-amber-400 text-black flex items-center justify-center shrink-0 shadow-md">
              <UserPlus className="w-6 h-6" />
            </div>
            <div>
              <span className="font-extrabold text-white text-base block">
                First-Time Setup
              </span>
              <span className="text-xs text-white/70 block mt-0.5">
                No information added yet. Register this tag now to link your contact details.
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onOpenRegister}
            className="w-full sm:w-auto py-3 px-5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-black font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-all shrink-0 cursor-pointer"
          >
            <span>First-Time Registration</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      ) : (
        /* RE-EDIT OPTION ON TOP (When INFO IS ADDED) */
        <div className="flex items-center justify-between gap-3 bg-white/[0.03] border border-white/10 rounded-2xl py-2.5 px-4 shadow-sm">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-bold text-white/80">Active Smart Tag</span>
            <span className="text-white/30">•</span>
            <span className="font-mono text-xs text-amber-400 font-bold">{tagId}</span>
          </div>

          <button
            type="button"
            onClick={() => setPasscodePromptOpen(true)}
            className="py-1.5 px-3.5 rounded-xl bg-white/[0.06] hover:bg-amber-400 hover:text-black border border-white/15 text-white/90 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Edit Information</span>
          </button>
        </div>
      )}

      {/* ================= 5-DIGIT PASSCODE MODAL / DRAWER ================= */}
      {passcodePromptOpen && (
        <div className="bg-[#12131A] border-2 border-amber-400/50 rounded-3xl p-6 shadow-2xl flex flex-col gap-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-400/15 text-amber-400 flex items-center justify-center border border-amber-400/30">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-white">Enter 5-Digit Passcode</h3>
                <p className="text-[11px] text-white/50">Required to re-edit this tag's details.</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => { setPasscodePromptOpen(false); setPasscodeError(''); setEnteredPasscode(''); }}
              className="text-white/40 hover:text-white text-xs px-2 py-1 rounded-lg hover:bg-white/10 transition-colors"
            >
              Cancel
            </button>
          </div>

          <form onSubmit={handleVerifyPasscode} className="flex flex-col gap-3">
            <div className="flex gap-2">
              <input
                type="password"
                maxLength={5}
                required
                autoFocus
                value={enteredPasscode}
                onChange={(e) => setEnteredPasscode(e.target.value.replace(/\D/g, '').slice(0, 5))}
                placeholder="•••••"
                className="flex-1 py-3 px-4 text-center tracking-[0.4em] font-mono text-xl font-extrabold rounded-2xl bg-white/[0.05] border border-white/20 focus:border-amber-400 text-amber-400 outline-none transition-all placeholder:text-white/20"
              />
              <button
                type="submit"
                className="py-3 px-5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-black font-extrabold text-xs transition-colors cursor-pointer shadow-md"
              >
                Unlock
              </button>
            </div>

            {passcodeError && (
              <span className="text-xs text-red-400 font-semibold text-center bg-red-500/10 py-1.5 px-3 rounded-xl border border-red-500/20">
                {passcodeError}
              </span>
            )}
          </form>
        </div>
      )}

      {/* ================= HERO INFORMATION CARD ================= */}
      <div className="bg-[#12131A] border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col gap-5 relative overflow-hidden">
        
        {/* Subtle Ambient Radial Glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-400/5 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header Pill */}
        <div className="flex items-center justify-between gap-2">
          {hasInfo ? (
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-mono text-xs font-bold text-emerald-400 tracking-wider">
                VERIFIED TAGTIQUE ID
              </span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/25">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span className="font-mono text-xs font-bold text-amber-400 tracking-wider">
                UNREGISTERED TAG
              </span>
            </div>
          )}

          <div className="flex items-center gap-1.5 font-mono text-xs text-white/60 bg-white/[0.04] px-2.5 py-1 rounded-full border border-white/10">
            <span>ID: {tagId}</span>
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
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-lg border ${
              hasInfo
                ? 'bg-amber-400/15 border-amber-400/30 text-amber-400'
                : 'bg-white/[0.05] border-white/10 text-white/40'
            }`}>
              {hasInfo ? <CategoryIcon className="w-7 h-7" /> : <FileQuestion className="w-7 h-7" />}
            </div>

            <div className="flex flex-col">
              <span className="font-mono text-xs font-bold text-amber-400 uppercase tracking-widest">
                {hasInfo ? categoryObj.label : 'SMART TAG'}
              </span>
              <h1 className="font-extrabold text-2xl sm:text-3xl text-white tracking-tight leading-tight mt-0.5">
                {hasInfo ? (tag?.itemName || tag?.vehicleName || 'Tagtique Item') : 'No Info Added Yet'}
              </h1>
              
              <div className="flex items-center gap-2 text-xs text-white/60 mt-1">
                {hasInfo ? (
                  <>
                    <span>Owner: <strong className="text-white">{tag?.ownerName || 'Verified Owner'}</strong></span>
                    {tag?.city && (
                      <>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-amber-400" />
                          {tag.city}
                        </span>
                      </>
                    )}
                  </>
                ) : (
                  <span className="text-amber-400/80 font-medium">
                    Owner: <em>Not registered yet</em>
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* REWARD BADGE IF OFFERED (When info is registered) */}
        {hasInfo && tag?.rewardOffered && (
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

        {/* OWNER'S CUSTOM NOTE OR EMPTY NOTE */}
        {hasInfo ? (
          tag?.customNote && (
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 text-xs text-white/85 leading-relaxed italic relative">
              <div className="text-[10px] uppercase font-mono font-bold text-amber-400/80 mb-1 not-italic">
                Note from Owner:
              </div>
              "{tag.customNote}"
            </div>
          )
        ) : (
          <div className="p-4 rounded-2xl bg-white/[0.02] border border-dashed border-white/15 text-xs text-white/60 leading-relaxed">
            <span className="font-bold text-white/80 block mb-1">Status: Unassigned Smart Tag</span>
            No contact details have been linked to this QR code yet. If you are the owner, tap the <strong>First-Time Registration</strong> button on top to add your information and set your 5-digit passcode.
          </div>
        )}

      </div>

      {/* ================= CONTACT ACTIONS / REGISTRATION PROMPT ================= */}
      {hasInfo ? (
        /* CONTACT ACTIONS (When INFO IS ADDED) */
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
            {tag?.callEnabled !== false && tag?.phoneNumber && (
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
      ) : (
        /* PROMPT WHEN NO INFO (Buttons inactive, directs user to register) */
        <div className="bg-[#12131A] border border-white/10 rounded-3xl p-6 sm:p-7 shadow-xl flex flex-col items-center text-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-400/10 text-amber-400 flex items-center justify-center border border-amber-400/20">
            <Sparkles className="w-6 h-6" />
          </div>
          <div className="max-w-md">
            <h3 className="font-extrabold text-lg text-white">
              Ready for Setup
            </h3>
            <p className="text-xs text-white/60 mt-1 leading-relaxed">
              Once you complete first-time registration, finders will be able to message you on WhatsApp or call you with one tap.
            </p>
          </div>
          <button
            type="button"
            onClick={onOpenRegister}
            className="w-full max-w-sm py-4 px-6 rounded-2xl bg-amber-400 hover:bg-amber-300 text-black font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Register This Tag Now</span>
          </button>
        </div>
      )}

    </div>
  );
}
