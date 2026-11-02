import React, { useMemo, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { findNfcDesign } from '../data/nfcCards';
import {
  NFC_FIELDS,
  createNfcProfile,
  fieldError,
  saveNfcProfile,
  loadNfcProfile,
  visibleProfileFields
} from '../data/nfcProfile';
import { getPublicSiteOrigin } from '../utils/scanUrl';
import NfcCardArt from '../components/NfcCardArt';
import {
  CheckCircle2,
  Lock,
  Plus,
  Trash2,
  ExternalLink,
  Smartphone,
  Sparkles,
  QrCode,
  ArrowRight,
  ShieldCheck,
  User,
  Briefcase,
  MapPin,
  FileText,
  Share2,
  Globe
} from 'lucide-react';

export default function NfcSetupPage() {
  const { designId, profileId } = useParams();
  const navigate = useNavigate();

  // If designId is a profile ID, load that profile
  const resolvedDesign = findNfcDesign(designId);
  const initialProfile = loadNfcProfile(profileId || designId) || createNfcProfile(resolvedDesign.id, profileId);

  const [profile, setProfile] = useState(initialProfile);
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState('contact'); // 'contact' | 'social' | 'custom'
  const [passcode, setPasscode] = useState(profile.passcode || '12345');
  const [customLinks, setCustomLinks] = useState(profile.customLinks || []);
  const [customTitle, setCustomTitle] = useState('');
  const [customUrl, setCustomUrl] = useState('');
  const [formError, setFormError] = useState('');

  const publicUrl = `${getPublicSiteOrigin()}/profile/${profile.id}`;
  const shownFields = useMemo(() => visibleProfileFields(profile), [profile]);

  const updateField = (id, patch) => {
    setSaved(false);
    setProfile((current) => ({
      ...current,
      fields: {
        ...current.fields,
        [id]: { ...current.fields[id], ...patch }
      }
    }));
  };

  const addCustomLink = () => {
    if (!customTitle.trim() || !customUrl.trim()) return;
    const url = customUrl.startsWith('http') ? customUrl.trim() : `https://${customUrl.trim()}`;
    const next = [...customLinks, { id: `link-${Date.now()}`, title: customTitle.trim(), url }];
    setCustomLinks(next);
    setCustomTitle('');
    setCustomUrl('');
    setSaved(false);
  };

  const removeCustomLink = (id) => {
    setCustomLinks(customLinks.filter((l) => l.id !== id));
    setSaved(false);
  };

  const handleSave = (e) => {
    e.preventDefault();
    setFormError('');

    if (!profile.name.trim()) {
      setFormError('Please enter your full name or display name.');
      return;
    }
    if (!passcode || String(passcode).replace(/\D/g, '').length !== 5) {
      setFormError('Please enter a valid 5-digit passcode (numbers only).');
      return;
    }

    const invalid = NFC_FIELDS.some(
      (field) => profile.fields[field.id]?.enabled && fieldError(field, profile.fields[field.id]?.value)
    );
    if (invalid) {
      setFormError('Please check highlighted link inputs for errors.');
      return;
    }

    const payload = {
      ...profile,
      passcode: String(passcode).replace(/\D/g, '').slice(0, 5),
      customLinks,
      updatedAt: Date.now()
    };

    saveNfcProfile(payload);
    setSaved(true);

    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.5 }
      });
    } catch (_) {}
  };

  return (
    <div className="bg-[#08090D] text-white min-h-screen pb-24 selection:bg-amber-400 selection:text-black font-manrope">
      
      {/* Background radial glow */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-96 h-96 bg-amber-400/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        
        {/* ================= HEADER ================= */}
        <div className="flex flex-col items-center text-center max-w-2xl mx-auto gap-3 mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-400/10 border border-amber-400/25">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-mono text-xs font-bold text-amber-400 tracking-wider uppercase">
              BARCODE SETUP • NFC SMART PROFILE
            </span>
          </div>
          <h1 className="font-extrabold text-3xl sm:text-4xl text-white tracking-tight">
            Activate Your NFC Card & Links
          </h1>
          <p className="text-sm text-white/70 leading-relaxed">
            Enter the contact details and social links you want to share. When you tap your NFC card on any smartphone or someone scans the printed QR code on the back, your public links page will open instantly.
          </p>
        </div>

        {/* ================= TWO COLUMN GRID ================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT: SETUP FORM (7 Cols) */}
          <form onSubmit={handleSave} className="lg:col-span-7 flex flex-col gap-6">
            
            {/* SECTION 1: IDENTITY & HEADLINE */}
            <div className="bg-[#12131A] border border-white/10 rounded-3xl p-6 sm:p-7 shadow-xl flex flex-col gap-4">
              <h2 className="font-extrabold text-base sm:text-lg text-white flex items-center gap-2">
                <User className="w-4 h-4 text-amber-400" />
                <span>1. Personal Identity & Bio</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-white/80 mb-1">
                    Display Name *
                  </label>
                  <input
                    required
                    type="text"
                    value={profile.name}
                    onChange={(e) => {
                      setSaved(false);
                      setProfile({ ...profile, name: e.target.value });
                    }}
                    placeholder="e.g. Ahmad Shahab"
                    className="w-full py-3 px-4 rounded-2xl bg-white/[0.04] border border-white/10 focus:border-amber-400 text-white text-sm outline-none transition-all placeholder:text-white/30"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-white/80 mb-1">
                    Professional Title / Role
                  </label>
                  <input
                    type="text"
                    value={profile.title || ''}
                    onChange={(e) => {
                      setSaved(false);
                      setProfile({ ...profile, title: e.target.value });
                    }}
                    placeholder="e.g. Founder & Creative Director"
                    className="w-full py-3 px-4 rounded-2xl bg-white/[0.04] border border-white/10 focus:border-amber-400 text-white text-sm outline-none transition-all placeholder:text-white/30"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-white/80 mb-1">
                    Company / Organization
                  </label>
                  <input
                    type="text"
                    value={profile.company || ''}
                    onChange={(e) => {
                      setSaved(false);
                      setProfile({ ...profile, company: e.target.value });
                    }}
                    placeholder="e.g. Tagtique Studio"
                    className="w-full py-3 px-4 rounded-2xl bg-white/[0.04] border border-white/10 focus:border-amber-400 text-white text-sm outline-none transition-all placeholder:text-white/30"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-white/80 mb-1">
                    Location / City
                  </label>
                  <input
                    type="text"
                    value={profile.city || ''}
                    onChange={(e) => {
                      setSaved(false);
                      setProfile({ ...profile, city: e.target.value });
                    }}
                    placeholder="e.g. Lahore, Pakistan"
                    className="w-full py-3 px-4 rounded-2xl bg-white/[0.04] border border-white/10 focus:border-amber-400 text-white text-sm outline-none transition-all placeholder:text-white/30"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-white/80 mb-1">
                  Short Introduction / Bio
                </label>
                <textarea
                  rows={2}
                  value={profile.bio || ''}
                  onChange={(e) => {
                    setSaved(false);
                    setProfile({ ...profile, bio: e.target.value });
                  }}
                  placeholder="Tell people who you are and what you do..."
                  className="w-full py-2.5 px-4 rounded-2xl bg-white/[0.04] border border-white/10 focus:border-amber-400 text-white text-sm outline-none transition-all placeholder:text-white/30 leading-relaxed"
                />
              </div>
            </div>

            {/* SECTION 2: CONTACT & SOCIAL LINKS */}
            <div className="bg-[#12131A] border border-white/10 rounded-3xl p-6 sm:p-7 shadow-xl flex flex-col gap-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <h2 className="font-extrabold text-base sm:text-lg text-white flex items-center gap-2">
                  <Globe className="w-4 h-4 text-emerald-400" />
                  <span>2. Contact & Social Links</span>
                </h2>

                {/* Tabs */}
                <div className="inline-flex p-1 rounded-full bg-white/[0.05] border border-white/10 text-xs">
                  <button
                    type="button"
                    onClick={() => setActiveTab('contact')}
                    className={`py-1 px-3 rounded-full font-bold transition-all cursor-pointer ${
                      activeTab === 'contact' ? 'bg-amber-400 text-black' : 'text-white/60 hover:text-white'
                    }`}
                  >
                    Direct Contact
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('social')}
                    className={`py-1 px-3 rounded-full font-bold transition-all cursor-pointer ${
                      activeTab === 'social' ? 'bg-amber-400 text-black' : 'text-white/60 hover:text-white'
                    }`}
                  >
                    Socials
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('custom')}
                    className={`py-1 px-3 rounded-full font-bold transition-all cursor-pointer ${
                      activeTab === 'custom' ? 'bg-amber-400 text-black' : 'text-white/60 hover:text-white'
                    }`}
                  >
                    Custom Links
                  </button>
                </div>
              </div>

              {/* TAB 1 & 2: STANDARD FIELDS */}
              {activeTab !== 'custom' && (
                <div className="flex flex-col gap-3">
                  {NFC_FIELDS.filter((field) => {
                    if (activeTab === 'contact') {
                      return ['whatsapp', 'phone', 'email', 'website'].includes(field.id);
                    }
                    return !['whatsapp', 'phone', 'email', 'website'].includes(field.id);
                  }).map((field) => {
                    const entry = profile.fields[field.id] || { enabled: false, value: '' };
                    const err = entry.enabled ? fieldError(field, entry.value) : '';

                    return (
                      <div
                        key={field.id}
                        className={`rounded-2xl border p-4 transition-all ${
                          entry.enabled
                            ? 'bg-white/[0.05] border-amber-400/30 shadow-sm'
                            : 'bg-white/[0.02] border-white/10'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <span className="font-bold text-sm text-white">{field.label}</span>
                          <button
                            type="button"
                            role="switch"
                            aria-checked={entry.enabled}
                            onClick={() => updateField(field.id, { enabled: !entry.enabled })}
                            className={`w-11 h-6 rounded-full p-0.5 transition-colors cursor-pointer ${
                              entry.enabled ? 'bg-amber-400' : 'bg-white/15'
                            }`}
                          >
                            <span
                              className={`block w-5 h-5 rounded-full transition-transform ${
                                entry.enabled ? 'translate-x-5 bg-black' : 'bg-white'
                              }`}
                            />
                          </button>
                        </div>

                        {entry.enabled && (
                          <div className="mt-3">
                            <input
                              type="text"
                              value={entry.value}
                              onChange={(e) => updateField(field.id, { value: e.target.value })}
                              placeholder={field.placeholder}
                              className={`w-full py-2.5 px-3.5 rounded-xl bg-white/[0.04] border text-white text-xs outline-none transition-all placeholder:text-white/30 ${
                                err ? 'border-red-500' : 'border-white/10 focus:border-amber-400'
                              }`}
                            />
                            {err && <p className="mt-1 text-[11px] text-red-400">{err}</p>}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* TAB 3: CUSTOM LINKS */}
              {activeTab === 'custom' && (
                <div className="flex flex-col gap-4">
                  <p className="text-xs text-white/60">
                    Add custom buttons to your public profile (e.g. Calendly, Portfolio, Online Store, Resume).
                  </p>

                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      value={customTitle}
                      onChange={(e) => setCustomTitle(e.target.value)}
                      placeholder="Button Title (e.g. Book a Meeting)"
                      className="flex-1 py-2.5 px-3.5 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs outline-none focus:border-amber-400"
                    />
                    <input
                      type="text"
                      value={customUrl}
                      onChange={(e) => setCustomUrl(e.target.value)}
                      placeholder="URL (e.g. calendly.com/yourname)"
                      className="flex-1 py-2.5 px-3.5 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs outline-none focus:border-amber-400"
                    />
                    <button
                      type="button"
                      onClick={addCustomLink}
                      className="py-2.5 px-4 rounded-xl bg-amber-400 text-black font-extrabold text-xs flex items-center justify-center gap-1.5 cursor-pointer hover:bg-amber-300"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add</span>
                    </button>
                  </div>

                  {customLinks.length > 0 && (
                    <div className="flex flex-col gap-2 mt-2">
                      {customLinks.map((link) => (
                        <div
                          key={link.id}
                          className="flex items-center justify-between p-3 rounded-xl bg-white/[0.04] border border-white/10 text-xs"
                        >
                          <div className="min-w-0 pr-2">
                            <span className="font-bold text-white block truncate">{link.title}</span>
                            <span className="text-[11px] text-white/50 block truncate">{link.url}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeCustomLink(link.id)}
                            className="p-1.5 text-white/40 hover:text-red-400 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

            </div>

            {/* SECTION 3: 5-DIGIT PASSCODE */}
            <div className="bg-[#12131A] border border-white/10 rounded-3xl p-6 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-400/10 text-amber-400 flex items-center justify-center border border-amber-400/20 shrink-0">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-bold text-sm text-white block">5-Digit Management Passcode</span>
                  <span className="text-xs text-white/50 block">Required whenever you want to re-edit your links</span>
                </div>
              </div>
              <input
                type="text"
                maxLength={5}
                value={passcode}
                onChange={(e) => setPasscode(e.target.value.replace(/\D/g, '').slice(0, 5))}
                placeholder="12345"
                className="w-28 text-center tracking-[0.25em] font-mono font-extrabold text-base py-2.5 px-3 rounded-xl bg-white/[0.06] border border-white/15 focus:border-amber-400 text-amber-400 outline-none"
              />
            </div>

            {formError && (
              <div className="p-4 rounded-2xl bg-red-500/15 border border-red-500/30 text-red-400 text-xs font-semibold text-center">
                {formError}
              </div>
            )}

            {/* SUBMIT BUTTON */}
            <div className="flex flex-col gap-3">
              <button
                type="submit"
                className="w-full py-4 px-8 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-black font-extrabold text-base shadow-[0_0_30px_rgba(245,178,31,0.25)] flex items-center justify-center gap-2.5 transition-all cursor-pointer"
              >
                <span>Save Profile & Activate NFC Card</span>
                <ArrowRight className="w-5 h-5" />
              </button>

              {saved && (
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                  <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    Profile saved successfully! Ready to test.
                  </span>
                  <Link
                    to={`/profile/${profile.id}`}
                    target="_blank"
                    className="py-1.5 px-3.5 rounded-xl bg-white text-black font-extrabold text-xs flex items-center gap-1 shadow hover:bg-zinc-200 transition-colors"
                  >
                    <span>View Public Links Page</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>
              )}
            </div>

          </form>

          {/* RIGHT: LIVE MOBILE PREVIEW (5 Cols) */}
          <aside className="lg:col-span-5 lg:sticky lg:top-24 flex flex-col gap-6">
            
            {/* PHYSICAL CARD DISPLAY */}
            <div className="bg-[#12131A] rounded-3xl border border-white/10 p-5 shadow-2xl flex flex-col items-center">
              <span className="text-[10px] font-mono uppercase tracking-widest text-white/50 mb-3 block">
                Physical Card Preview
              </span>
              <NfcCardArt
                design={resolvedDesign}
                side="back"
                qrValue={publicUrl}
                serial={profile.id.slice(0, 10).toUpperCase()}
              />
            </div>

            {/* MOBILE SCREEN MOCKUP */}
            <div className="bg-[#12131A] rounded-[36px] border border-white/15 p-5 shadow-2xl flex flex-col gap-4 relative overflow-hidden">
              <div className="flex items-center justify-between text-xs font-mono text-white/50 border-b border-white/10 pb-3">
                <span className="flex items-center gap-1.5 text-amber-400 font-bold">
                  <Smartphone className="w-4 h-4" />
                  MOBILE SCREEN PREVIEW
                </span>
                <Link
                  to={`/profile/${profile.id}`}
                  target="_blank"
                  className="text-white/60 hover:text-white flex items-center gap-1"
                >
                  <span>Open Full</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>

              {/* Simulated Mobile Card */}
              <div className="bg-[#08090D] border border-white/10 rounded-2xl p-4 flex flex-col items-center text-center gap-3">
                <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-amber-400 to-amber-200 text-black font-extrabold text-xl flex items-center justify-center shadow-md">
                  {(profile.name || '?').split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() || 'T'}
                </div>

                <div>
                  <h3 className="font-extrabold text-base text-white leading-tight">
                    {profile.name || 'Your Full Name'}
                  </h3>
                  <p className="text-[11px] text-white/60 mt-0.5">
                    {profile.title || 'Professional Title'} {profile.company ? `• ${profile.company}` : ''}
                  </p>
                </div>

                {profile.bio && (
                  <p className="text-[11px] text-white/70 italic line-clamp-2 px-2">
                    "{profile.bio}"
                  </p>
                )}

                {/* Simulated Links List */}
                <div className="w-full flex flex-col gap-1.5 mt-2">
                  {shownFields.length === 0 && customLinks.length === 0 && (
                    <div className="py-4 text-[11px] text-white/40 italic">
                      Enable fields or add custom links on the left to see them appear here.
                    </div>
                  )}

                  {shownFields.map((f) => (
                    <div
                      key={f.id}
                      className="py-2 px-3 rounded-xl bg-white/[0.04] border border-white/10 text-left flex items-center justify-between text-xs text-white/90"
                    >
                      <span className="font-bold capitalize">{f.label}</span>
                      <span className="text-[10px] text-white/40 truncate max-w-[120px]">{f.value}</span>
                    </div>
                  ))}

                  {customLinks.map((l) => (
                    <div
                      key={l.id}
                      className="py-2 px-3 rounded-xl bg-amber-400/10 border border-amber-400/30 text-left flex items-center justify-between text-xs text-amber-300 font-bold"
                    >
                      <span>{l.title}</span>
                      <ExternalLink className="w-3 h-3 text-amber-400" />
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </aside>

        </div>

      </div>

    </div>
  );
}
