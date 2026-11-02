import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  Smartphone,
  Laptop,
  Car,
  Briefcase,
  Key,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Lock,
  MapPin,
  Phone,
  User,
  Tag,
  Award,
  ArrowRight,
  Eye,
  MessageSquare
} from 'lucide-react';
import { tagRegistryService } from '../../services/tagRegistryService';

export const TAG_CATEGORIES = [
  {
    id: 'mobile',
    label: 'Smartphone',
    sub: 'iPhone, Galaxy, etc.',
    icon: Smartphone,
    defaultName: 'Smart Mobile Phone',
    defaultNote: 'Assalam-o-Alaikum! If you found my phone, please message or call me so I can retrieve it safely. Finder reward offered!'
  },
  {
    id: 'laptop',
    label: 'Laptop / Tablet',
    sub: 'MacBook, iPad, PC',
    icon: Laptop,
    defaultName: 'Personal Laptop',
    defaultNote: 'Assalam-o-Alaikum! If you found my laptop or charger/bag, please alert me on WhatsApp or call. Critical work data inside!'
  },
  {
    id: 'vehicle',
    label: 'Vehicle / Car',
    sub: 'Car, Bike, Scooter',
    icon: Car,
    defaultName: 'Vehicle Tag',
    defaultNote: 'Assalam-o-Alaikum! If my vehicle is blocking your way, lights are left on, or in case of emergency, please ping me via WhatsApp or call.'
  },
  {
    id: 'bag',
    label: 'Bag / Luggage',
    sub: 'Backpack, Suitcase',
    icon: Briefcase,
    defaultName: 'Everyday Backpack',
    defaultNote: 'Assalam-o-Alaikum! If you found my bag or luggage, please call or message me. Finder reward offered upon return!'
  },
  {
    id: 'keys',
    label: 'Keys / EDC',
    sub: 'Keychain, Pouch',
    icon: Key,
    defaultName: 'Personal Keys',
    defaultNote: 'Assalam-o-Alaikum! If you found my keys, please contact me immediately so we can arrange their return. Thank you!'
  },
  {
    id: 'sticker',
    label: 'Smart Sticker',
    sub: 'Any Valued Item',
    icon: Sparkles,
    defaultName: 'Smart Tagged Item',
    defaultNote: 'Assalam-o-Alaikum! If you found this tagged item, please message or call me to arrange its safe return.'
  }
];

export default function QrRegistrationView({
  tagId,
  initialData = null,
  onRegisterSuccess,
  isEditing = false,
  onCancelEdit
}) {
  const [category, setCategory] = useState(initialData?.category || initialData?.itemTarget || 'mobile');
  const [itemName, setItemName] = useState(
    initialData?.itemName || initialData?.vehicleName || TAG_CATEGORIES.find((c) => c.id === 'mobile')?.defaultName || ''
  );
  const [ownerName, setOwnerName] = useState(initialData?.ownerName || '');
  const [phoneNumber, setPhoneNumber] = useState(initialData?.phoneNumber || '');
  const [guardianNumber, setGuardianNumber] = useState(initialData?.guardianNumber || '');
  const [city, setCity] = useState(initialData?.city || 'Faisalabad, Pakistan');
  const [customNote, setCustomNote] = useState(
    initialData?.customNote || TAG_CATEGORIES.find((c) => c.id === 'mobile')?.defaultNote || ''
  );
  const [rewardOffered, setRewardOffered] = useState(initialData?.rewardOffered ?? true);
  const [whatsappEnabled, setWhatsappEnabled] = useState(initialData?.whatsappEnabled ?? true);
  const [callEnabled, setCallEnabled] = useState(initialData?.callEnabled ?? true);
  const [passcode, setPasscode] = useState(initialData?.passcode || initialData?.pin || '12345');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Category switch helper: updates defaults if untouched
  const handleCategorySelect = (catId) => {
    setCategory(catId);
    const cat = TAG_CATEGORIES.find((c) => c.id === catId);
    if (!cat) return;
    if (!itemName || TAG_CATEGORIES.some((c) => c.defaultName === itemName)) {
      setItemName(cat.defaultName);
    }
    if (!customNote || TAG_CATEGORIES.some((c) => c.defaultNote === customNote)) {
      setCustomNote(cat.defaultNote);
    }
  };

  const currentCategoryObj = TAG_CATEGORIES.find((c) => c.id === category) || TAG_CATEGORIES[0];
  const CategoryIcon = currentCategoryObj.icon;

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!ownerName.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }
    if (!phoneNumber.trim()) {
      setErrorMsg('Please enter your primary phone number / WhatsApp.');
      return;
    }
    if (!itemName.trim()) {
      setErrorMsg('Please enter a name or model for your tagged item.');
      return;
    }
    if (!passcode || passcode.length !== 5) {
      setErrorMsg('Please enter a valid 5-digit passcode (numbers only).');
      return;
    }

    setIsSubmitting(true);

    try {
      const saved = tagRegistryService.saveRegisteredTag({
        qrToken: tagId,
        token: tagId,
        tagId: tagId,
        registrationNumber: tagId,
        category,
        itemTarget: category,
        itemName: itemName.trim(),
        vehicleName: itemName.trim(),
        vehicleType: currentCategoryObj.label,
        ownerName: ownerName.trim(),
        phoneNumber: phoneNumber.trim(),
        guardianNumber: guardianNumber.trim(),
        city: city.trim(),
        customNote: customNote.trim(),
        rewardOffered,
        whatsappEnabled,
        callEnabled,
        passcode: passcode.trim(),
        pin: passcode.trim(),
        isRegistered: true,
        status: 'active'
      });

      try {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.45 }
        });
      } catch (_) {}

      setTimeout(() => {
        setIsSubmitting(false);
        if (onRegisterSuccess) {
          onRegisterSuccess(saved);
        }
      }, 500);
    } catch (err) {
      setIsSubmitting(false);
      setErrorMsg('Failed to save tag details. Please try again.');
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-4 sm:px-6 py-8 flex flex-col gap-8 font-manrope">
      
      {/* ================= HEADER INTRO ================= */}
      <div className="flex flex-col items-center text-center gap-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-400/10 border border-amber-400/25">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          <span className="font-mono text-xs font-bold text-amber-400 tracking-wider uppercase">
            {isEditing ? 'EDIT TAG SETTINGS' : 'STEP 1 OF 1 • ONE-TIME ACTIVATION'}
          </span>
          <span className="text-white/30">•</span>
          <span className="font-mono text-xs font-bold text-white/90">
            {tagId}
          </span>
        </div>

        <h1 className="font-extrabold text-3xl sm:text-4xl text-white tracking-tight">
          {isEditing ? 'Update Your Smart Tag' : 'Activate Your Smart Tag'}
        </h1>
        <p className="text-sm text-white/70 max-w-lg leading-relaxed">
          {isEditing
            ? 'Modify your contact information, recovery note, or attached item for this Tagtique QR code.'
            : 'Link this physical QR sticker to your private contact profile so anyone who scans it can return your item or reach you instantly.'}
        </p>
      </div>

      {/* ================= REAL-TIME LIVE PREVIEW CARD ================= */}
      <div className="bg-[#12131A] border border-amber-400/30 rounded-3xl p-5 sm:p-6 shadow-[0_0_40px_rgba(245,178,31,0.08)] relative overflow-hidden">
        <div className="absolute top-0 right-0 bg-amber-400 text-black font-mono font-extrabold text-[10px] px-3 py-1 rounded-bl-xl tracking-wider uppercase">
          Live Finder Preview
        </div>

        <div className="flex items-center gap-3.5 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-400/15 border border-amber-400/30 flex items-center justify-center text-amber-400 shrink-0">
            <CategoryIcon className="w-6 h-6" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg text-white truncate block">
                {itemName || 'Your Item Name'}
              </span>
              {rewardOffered && (
                <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-extrabold text-amber-300 bg-amber-400/15 px-2 py-0.5 rounded-full border border-amber-400/30">
                  <Award className="w-3 h-3" />
                  Reward
                </span>
              )}
            </div>
            <p className="text-xs text-white/60 flex items-center gap-1.5 mt-0.5">
              <span>Owner: <strong className="text-white">{ownerName || 'Your Name'}</strong></span>
              <span>•</span>
              <span className="flex items-center gap-0.5">
                <MapPin className="w-3 h-3 text-amber-400" />
                {city}
              </span>
            </p>
          </div>
        </div>

        <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-3.5 text-xs text-white/80 italic leading-relaxed">
          "{customNote || 'Assalam-o-Alaikum! Please return this item...'}"
        </div>
      </div>

      {/* ================= ACTIVATION FORM ================= */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-8">
        
        {/* STEP 1: ITEM CATEGORY PICKER */}
        <div className="bg-[#12131A] border border-white/10 rounded-3xl p-6 sm:p-7 shadow-xl flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-extrabold text-base sm:text-lg text-white">
                1. What is this tag attached to?
              </h2>
              <p className="text-xs text-white/60 mt-0.5">
                Select your item type to optimize the recovery instructions and finder experience.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {TAG_CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const isSelected = category === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => handleCategorySelect(cat.id)}
                  className={`p-4 rounded-2xl border text-left transition-all flex flex-col gap-2.5 cursor-pointer relative overflow-hidden ${
                    isSelected
                      ? 'bg-amber-400/10 border-amber-400 shadow-[0_0_20px_rgba(245,178,31,0.15)] ring-1 ring-amber-400'
                      : 'bg-white/[0.03] border-white/10 hover:border-white/20 hover:bg-white/[0.05]'
                  }`}
                >
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
                    isSelected ? 'bg-amber-400 text-black' : 'bg-white/10 text-white/80'
                  }`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <span className={`font-bold text-sm block leading-tight ${isSelected ? 'text-amber-400' : 'text-white'}`}>
                      {cat.label}
                    </span>
                    <span className="text-[11px] text-white/50 block mt-0.5">
                      {cat.sub}
                    </span>
                  </div>
                  {isSelected && (
                    <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-amber-400" />
                  )}
                </button>
              );
            })}
          </div>

          {/* ITEM NAME INPUT */}
          <div className="mt-2">
            <label className="block text-xs font-bold text-white/80 mb-1.5 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-amber-400" />
              <span>Specific Item Name or Model</span>
            </label>
            <input
              type="text"
              required
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              placeholder="e.g. iPhone 15 Pro, MacBook M3, Honda Civic 2022"
              className="w-full py-3 px-4 rounded-2xl bg-white/[0.04] border border-white/10 focus:border-amber-400 text-white text-sm outline-none transition-all placeholder:text-white/30"
            />
          </div>
        </div>

        {/* STEP 2: OWNER CONTACT INFORMATION */}
        <div className="bg-[#12131A] border border-white/10 rounded-3xl p-6 sm:p-7 shadow-xl flex flex-col gap-5">
          <div>
            <h2 className="font-extrabold text-base sm:text-lg text-white">
              2. Your Contact Information
            </h2>
            <p className="text-xs text-white/60 mt-0.5">
              Finders will use these details to contact you directly via WhatsApp or phone call.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* FULL NAME */}
            <div>
              <label className="block text-xs font-bold text-white/80 mb-1.5 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-amber-400" />
                <span>Your Full Name</span>
              </label>
              <input
                type="text"
                required
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                placeholder="e.g. Ahmed Khan"
                className="w-full py-3 px-4 rounded-2xl bg-white/[0.04] border border-white/10 focus:border-amber-400 text-white text-sm outline-none transition-all placeholder:text-white/30"
              />
            </div>

            {/* CITY / LOCATION */}
            <div>
              <label className="block text-xs font-bold text-white/80 mb-1.5 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-amber-400" />
                <span>City / Area</span>
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g. Lahore, Karachi, Islamabad"
                className="w-full py-3 px-4 rounded-2xl bg-white/[0.04] border border-white/10 focus:border-amber-400 text-white text-sm outline-none transition-all placeholder:text-white/30"
              />
            </div>

            {/* PRIMARY PHONE */}
            <div>
              <label className="block text-xs font-bold text-white/80 mb-1.5 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-emerald-400" />
                <span>Primary WhatsApp & Call Number</span>
              </label>
              <input
                type="tel"
                required
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="e.g. 0300 1234567 or +92 300 1234567"
                className="w-full py-3 px-4 rounded-2xl bg-white/[0.04] border border-white/10 focus:border-emerald-400 text-white text-sm outline-none transition-all placeholder:text-white/30 font-mono"
              />
            </div>

            {/* ALTERNATE / EMERGENCY PHONE */}
            <div>
              <label className="block text-xs font-bold text-white/80 mb-1.5 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                <span>Emergency / Backup Contact (Optional)</span>
              </label>
              <input
                type="tel"
                value={guardianNumber}
                onChange={(e) => setGuardianNumber(e.target.value)}
                placeholder="e.g. Friend / Family member number"
                className="w-full py-3 px-4 rounded-2xl bg-white/[0.04] border border-white/10 focus:border-amber-400 text-white text-sm outline-none transition-all placeholder:text-white/30 font-mono"
              />
            </div>
          </div>
        </div>

        {/* STEP 3: CUSTOM NOTE & RECOVERY PREFERENCES */}
        <div className="bg-[#12131A] border border-white/10 rounded-3xl p-6 sm:p-7 shadow-xl flex flex-col gap-5">
          <div>
            <h2 className="font-extrabold text-base sm:text-lg text-white">
              3. Finder Note & Return Message
            </h2>
            <p className="text-xs text-white/60 mt-0.5">
              Displayed prominently to anyone who scans your tag.
            </p>
          </div>

          <div>
            <textarea
              rows={3}
              value={customNote}
              onChange={(e) => setCustomNote(e.target.value)}
              placeholder="Write a message to whoever finds your item..."
              className="w-full py-3 px-4 rounded-2xl bg-white/[0.04] border border-white/10 focus:border-amber-400 text-white text-sm outline-none transition-all placeholder:text-white/30 leading-relaxed"
            />
          </div>

          {/* TOGGLES */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-white/10">
            
            {/* Reward Badge Toggle */}
            <label className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-between cursor-pointer hover:bg-white/[0.05] transition-colors">
              <div className="flex items-center gap-2.5">
                <Award className="w-4 h-4 text-amber-400" />
                <div>
                  <span className="font-bold text-xs text-white block">Offer Finder Reward</span>
                  <span className="text-[10px] text-white/50 block">Incentivizes safe item returns</span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={rewardOffered}
                onChange={(e) => setRewardOffered(e.target.checked)}
                className="w-4 h-4 accent-amber-400 cursor-pointer"
              />
            </label>

            {/* Direct Calling Toggle */}
            <label className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-between cursor-pointer hover:bg-white/[0.05] transition-colors">
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-emerald-400" />
                <div>
                  <span className="font-bold text-xs text-white block">Allow Direct Calling</span>
                  <span className="text-[10px] text-white/50 block">Finders can call your phone</span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={callEnabled}
                onChange={(e) => setCallEnabled(e.target.checked)}
                className="w-4 h-4 accent-amber-400 cursor-pointer"
              />
            </label>

          </div>

          {/* SECURITY PASSCODE */}
          <div className="pt-3 border-t border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-400/10 text-amber-400 flex items-center justify-center border border-amber-400/20">
                <Lock className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-xs text-white block">5-Digit Management Passcode</span>
                <span className="text-[11px] text-white/50 block">Set a 5-digit passcode. Required to re-edit your information later.</span>
              </div>
            </div>
            <input
              type="text"
              maxLength={5}
              value={passcode}
              onChange={(e) => setPasscode(e.target.value.replace(/\D/g, '').slice(0, 5))}
              placeholder="12345"
              className="w-28 text-center tracking-widest font-mono font-extrabold text-base py-2 px-3 rounded-xl bg-white/[0.06] border border-white/15 focus:border-amber-400 text-amber-400 outline-none"
            />
          </div>
        </div>

        {/* ERROR MESSAGE IF ANY */}
        {errorMsg && (
          <div className="p-4 rounded-2xl bg-red-500/15 border border-red-500/30 text-red-400 text-xs font-semibold text-center">
            {errorMsg}
          </div>
        )}

        {/* ================= ACTIONS ================= */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          {isEditing && (
            <button
              type="button"
              onClick={onCancelEdit}
              className="py-4 px-6 rounded-2xl border border-white/15 hover:bg-white/[0.05] text-white font-bold text-sm transition-all"
            >
              Cancel
            </button>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 py-4 px-8 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-black font-extrabold text-base shadow-[0_0_30px_rgba(245,178,31,0.25)] flex items-center justify-center gap-2.5 transition-all cursor-pointer disabled:opacity-50"
          >
            <span>{isSubmitting ? 'Saving Tag Identity...' : isEditing ? 'Save Changes' : 'Activate Tag & Go Live'}</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>

      </form>

    </div>
  );
}

