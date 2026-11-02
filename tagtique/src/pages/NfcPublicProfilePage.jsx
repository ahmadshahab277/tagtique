import React, { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { loadNfcProfile, visibleProfileFields, verifyNfcPasscode } from '../data/nfcProfile';
import { findNfcDesign } from '../data/nfcCards';
import { downloadVCard } from '../utils/vcard';
import {
  Download,
  Share2,
  Check,
  Copy,
  ExternalLink,
  MapPin,
  Lock,
  Edit3,
  Phone,
  Mail,
  Globe,
  Sparkles,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

/* ================= BRAND ICONS ================= */
function InstagramIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
    </svg>
  );
}

function LinkedInIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
    </svg>
  );
}

function WhatsAppIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.007c.101.005.232-.038.36.27.13.313.447 1.091.487 1.171.04.081.066.174.013.281-.053.107-.08.174-.159.268-.08.093-.167.208-.239.279-.08.08-.163.167-.07.327.093.159.414.683.888 1.106.611.544 1.127.712 1.286.792.159.08.252.067.346-.04.093-.107.404-.471.512-.632.107-.16.216-.134.364-.08.148.053.94.443 1.102.523.162.08.27.12.31.187.04.067.04.387-.104.792z"/>
    </svg>
  );
}

function TwitterXIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
  );
}

function GitHubIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
    </svg>
  );
}

function YouTubeIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
    </svg>
  );
}

function TikTokIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.97v7.92c-.01 1.72-.54 3.44-1.57 4.81-1.45 1.93-3.79 3.09-6.21 3.1-2.45-.01-4.79-1.2-6.21-3.17-1.46-2.02-1.92-4.66-1.24-7.06.66-2.34 2.37-4.27 4.63-5.08.76-.27 1.56-.41 2.37-.41v4.06c-.84.05-1.68.37-2.3 1-.72.73-1.03 1.79-.83 2.79.19 1 .91 1.84 1.88 2.19 1 .37 2.15.17 2.94-.52.79-.69 1.18-1.74 1.18-2.79V.02z"/>
    </svg>
  );
}

function FacebookIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  );
}

export default function NfcPublicProfilePage() {
  const { profileId } = useParams();
  const navigate = useNavigate();

  // Load from local storage or mock profile
  const profile = profileId === 'unassigned' ? null : loadNfcProfile(profileId);
  const design = findNfcDesign(profile?.designId);
  const shown = visibleProfileFields(profile);

  const [copiedLink, setCopiedLink] = useState(false);
  const [passcodeModalOpen, setPasscodeModalOpen] = useState(false);
  const [enteredPasscode, setEnteredPasscode] = useState('');
  const [passcodeError, setPasscodeError] = useState('');

  // UNASSIGNED / EMPTY CARD STATE
  if (profileId === 'unassigned' || !profile) {
    return (
      <div className="min-h-screen bg-[#08090D] text-white flex items-center justify-center p-4 font-manrope selection:bg-amber-400 selection:text-black">
        <div className="max-w-md w-full bg-[#12131A] rounded-[36px] border border-white/10 p-8 text-center flex flex-col items-center gap-5 shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-amber-400/10 text-amber-400 flex items-center justify-center border border-amber-400/25">
            <Sparkles className="w-8 h-8" />
          </div>
          <div>
            <h1 className="font-extrabold text-2xl text-white tracking-tight">
              NFC Card Ready For Setup
            </h1>
            <p className="mt-2 text-xs text-white/60 leading-relaxed">
              This physical smart card has not been registered with links yet. If you are the owner, scan the barcode on the back of your card to configure your contact links.
            </p>
          </div>
          <Link
            to={`/nfc-card/${design ? design.id : 'executive-black'}/setup`}
            className="w-full py-3.5 px-6 rounded-full bg-amber-400 hover:bg-amber-300 text-black font-extrabold text-sm transition-all shadow-lg"
          >
            Activate & Set Links Now
          </Link>
        </div>
      </div>
    );
  }

  // Extract contact items for direct action strip
  const phoneField = shown.find((f) => f.id === 'phone');
  const whatsappField = shown.find((f) => f.id === 'whatsapp');
  const emailField = shown.find((f) => f.id === 'email');
  const websiteField = shown.find((f) => f.id === 'website');

  // Filter out direct contact fields from the bento links list to avoid duplicates
  const socialLinks = shown.filter((f) => !['phone', 'email'].includes(f.id));
  const customLinks = profile.customLinks || [];

  const handleCopyProfileUrl = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${profile.name} • Tagtique NFC Card`,
          text: `Connect with ${profile.name}`,
          url: window.location.href
        });
      } catch (_) {}
    } else {
      handleCopyProfileUrl();
    }
  };

  const handleSaveContact = () => {
    downloadVCard({
      name: profile.name,
      title: profile.title,
      organization: profile.company,
      phone: phoneField?.value || whatsappField?.value,
      email: emailField?.value,
      website: websiteField?.value,
      note: `Saved from Tagtique NFC Smart Card (${design?.name || 'Tagtique'})`
    });
  };

  const handleVerifyPasscode = (e) => {
    e.preventDefault();
    setPasscodeError('');
    if (enteredPasscode.length !== 5) {
      setPasscodeError('Please enter all 5 digits of your passcode.');
      return;
    }
    const isValid = verifyNfcPasscode(profile.id, enteredPasscode);
    if (isValid) {
      setPasscodeModalOpen(false);
      navigate(`/nfc-card/${profile.designId || 'executive-black'}/setup?profile=${profile.id}`);
    } else {
      setPasscodeError('Incorrect 5-digit passcode. Please try again.');
    }
  };

  const getFieldIcon = (id) => {
    switch (id) {
      case 'instagram':
        return <InstagramIcon className="w-5 h-5 text-pink-400" />;
      case 'linkedin':
        return <LinkedInIcon className="w-5 h-5 text-[#0A66C2]" />;
      case 'whatsapp':
        return <WhatsAppIcon className="w-5 h-5 text-[#25D366]" />;
      case 'twitter':
      case 'x':
        return <TwitterXIcon className="w-5 h-5 text-white" />;
      case 'github':
        return <GitHubIcon className="w-5 h-5 text-white" />;
      case 'youtube':
        return <YouTubeIcon className="w-5 h-5 text-red-500" />;
      case 'tiktok':
        return <TikTokIcon className="w-5 h-5 text-cyan-400" />;
      case 'facebook':
        return <FacebookIcon className="w-5 h-5 text-blue-500" />;
      default:
        return <Globe className="w-5 h-5 text-amber-400" />;
    }
  };

  return (
    <div className="min-h-screen bg-[#08090D] text-white selection:bg-amber-400 selection:text-black py-8 sm:py-16 px-4 font-manrope relative overflow-x-hidden">
      
      {/* Ambient background glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-80 bg-amber-400/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-96 h-96 bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Main Mobile-first Card Container */}
      <main className="max-w-md mx-auto w-full flex flex-col gap-5 relative z-10">
        
        {/* ================= TOP VERIFICATION BAR ================= */}
        <div className="flex items-center justify-between px-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-mono text-[10.5px] font-bold text-emerald-400 tracking-wider">
              TAGTIQUE VERIFIED NFC
            </span>
          </div>

          <button
            type="button"
            onClick={handleShare}
            className="p-2 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-white/80 hover:text-white transition-all cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
            title="Share Profile"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
            <span className="text-[11px]">{copiedLink ? 'Copied' : 'Share'}</span>
          </button>
        </div>

        {/* ================= HERO PROFILE BENTO CARD ================= */}
        <article className="bg-[#12131A] rounded-[36px] border border-white/15 p-7 shadow-[0_25px_60px_rgba(0,0,0,0.8)] flex flex-col items-center text-center gap-5 relative overflow-hidden">
          
          {/* Subtle Golden Sheen on Top of Card */}
          <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-amber-400/50 to-transparent" />

          {/* Avatar with luxury golden ring */}
          <div className="relative">
            <div className="w-24 h-24 rounded-full p-[2.5px] bg-gradient-to-tr from-amber-400 via-amber-200 to-amber-500 shadow-[0_0_30px_rgba(245,178,31,0.25)]">
              <div className="w-full h-full rounded-full bg-[#1A1B24] flex items-center justify-center font-extrabold text-3xl text-amber-300">
                {(profile.name || '?').split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() || 'T'}
              </div>
            </div>

            {/* Online NFC Badge */}
            <div className="absolute bottom-1 right-1 w-6 h-6 rounded-full bg-[#12131A] border border-white/20 flex items-center justify-center shadow">
              <span className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
            </div>
          </div>

          {/* Profile Identity Details */}
          <div className="flex flex-col items-center gap-1.5 w-full">
            <h1 className="font-extrabold text-2xl sm:text-3xl text-white tracking-tight leading-tight">
              {profile.name}
            </h1>

            {(profile.title || profile.company) && (
              <p className="text-xs sm:text-sm font-semibold text-amber-400/90 tracking-wide flex items-center justify-center gap-1.5 flex-wrap">
                {profile.title && <span>{profile.title}</span>}
                {profile.title && profile.company && <span className="text-white/30">•</span>}
                {profile.company && <span className="text-white/80">{profile.company}</span>}
              </p>
            )}

            {profile.city && (
              <span className="text-[11px] font-medium text-white/50 flex items-center gap-1 mt-0.5">
                <MapPin className="w-3 h-3 text-amber-400" />
                {profile.city}
              </span>
            )}

            {profile.bio && (
              <p className="mt-2 text-xs text-white/70 leading-relaxed font-normal bg-white/[0.03] border border-white/10 p-3.5 rounded-2xl w-full text-center">
                "{profile.bio}"
              </p>
            )}
          </div>

          {/* 1-TAP SAVE TO CONTACTS (.VCF) PRIMARY CTA */}
          <button
            type="button"
            onClick={handleSaveContact}
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-black font-extrabold text-sm flex items-center justify-center gap-2.5 shadow-[0_10px_25px_rgba(245,178,31,0.25)] transition-all cursor-pointer active:scale-[0.98]"
          >
            <Download className="w-4 h-4 stroke-[2.5]" />
            <span>Save to Contacts (.vcf)</span>
          </button>

          {/* QUICK DIRECT CONNECT STRIP */}
          <div className="grid grid-cols-3 gap-2 w-full pt-1">
            {whatsappField ? (
              <a
                href={whatsappField.href}
                target="_blank"
                rel="noopener noreferrer"
                className="py-3 px-2 rounded-2xl bg-white/[0.04] hover:bg-[#25D366]/20 border border-white/10 hover:border-[#25D366]/40 text-white flex flex-col items-center gap-1.5 transition-all text-center"
              >
                <WhatsAppIcon className="w-5 h-5 text-[#25D366]" />
                <span className="text-[11px] font-bold">WhatsApp</span>
              </a>
            ) : null}

            {phoneField ? (
              <a
                href={phoneField.href}
                className="py-3 px-2 rounded-2xl bg-white/[0.04] hover:bg-emerald-500/20 border border-white/10 hover:border-emerald-500/40 text-white flex flex-col items-center gap-1.5 transition-all text-center"
              >
                <Phone className="w-5 h-5 text-emerald-400" />
                <span className="text-[11px] font-bold">Call</span>
              </a>
            ) : null}

            {emailField ? (
              <a
                href={emailField.href}
                className="py-3 px-2 rounded-2xl bg-white/[0.04] hover:bg-amber-400/20 border border-white/10 hover:border-amber-400/40 text-white flex flex-col items-center gap-1.5 transition-all text-center"
              >
                <Mail className="w-5 h-5 text-amber-400" />
                <span className="text-[11px] font-bold">Email</span>
              </a>
            ) : null}
          </div>

        </article>

        {/* ================= ALL SOCIAL & PROFILE LINKS (BENTO) ================= */}
        <section className="flex flex-col gap-2.5">
          <div className="px-2 flex items-center justify-between">
            <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-white/50">
              Links & Profiles ({socialLinks.length + customLinks.length})
            </span>
            <span className="text-[10px] text-white/40">Tap to open</span>
          </div>

          {/* Social Links List */}
          {socialLinks.map((field) => (
            <a
              key={field.id}
              href={field.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group p-4 rounded-2xl bg-[#12131A] hover:bg-[#181922] border border-white/10 hover:border-amber-400/50 shadow-md hover:shadow-xl transition-all flex items-center justify-between gap-3 cursor-pointer"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-white/[0.06] border border-white/10 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  {getFieldIcon(field.id)}
                </div>
                <div className="min-w-0">
                  <span className="font-bold text-sm text-white block capitalize leading-tight group-hover:text-amber-400 transition-colors">
                    {field.label}
                  </span>
                  <span className="text-xs text-white/50 truncate block mt-0.5">
                    {field.value}
                  </span>
                </div>
              </div>

              <div className="w-8 h-8 rounded-full bg-white/[0.04] group-hover:bg-amber-400/20 text-white/40 group-hover:text-amber-400 flex items-center justify-center shrink-0 transition-colors">
                <ArrowUpRight className="w-4 h-4" />
              </div>
            </a>
          ))}

          {/* Custom Link Buttons */}
          {customLinks.map((link) => (
            <a
              key={link.id}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group p-4 rounded-2xl bg-gradient-to-r from-amber-400/10 to-amber-500/5 hover:from-amber-400/20 hover:to-amber-500/15 border border-amber-400/30 hover:border-amber-400/60 shadow-md transition-all flex items-center justify-between gap-3 cursor-pointer"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-amber-400/20 text-amber-400 flex items-center justify-center shrink-0">
                  <ExternalLink className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <span className="font-bold text-sm text-amber-300 block truncate leading-tight">
                    {link.title}
                  </span>
                  <span className="text-xs text-white/50 truncate block mt-0.5">
                    {link.url.replace(/^https?:\/\//, '')}
                  </span>
                </div>
              </div>

              <div className="w-8 h-8 rounded-full bg-amber-400/20 text-amber-400 flex items-center justify-center shrink-0">
                <ArrowUpRight className="w-4 h-4" />
              </div>
            </a>
          ))}

          {socialLinks.length === 0 && customLinks.length === 0 && (
            <div className="bg-[#12131A] rounded-2xl border border-white/10 p-6 text-center text-xs text-white/50">
              No additional links configured yet.
            </div>
          )}
        </section>

        {/* ================= OWNER RE-EDIT OPTION ================= */}
        <div className="pt-4 flex flex-col items-center justify-center text-center gap-3">
          {!passcodeModalOpen ? (
            <button
              type="button"
              onClick={() => setPasscodeModalOpen(true)}
              className="text-xs text-white/40 hover:text-amber-400 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Are you the owner? Edit Profile & Links</span>
            </button>
          ) : (
            <form onSubmit={handleVerifyPasscode} className="w-full bg-[#12131A] border border-amber-400/40 rounded-3xl p-5 flex flex-col gap-3 shadow-2xl">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-xs text-white flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-amber-400" />
                  <span>Enter 5-Digit Passcode</span>
                </span>
                <button
                  type="button"
                  onClick={() => { setPasscodeModalOpen(false); setPasscodeError(''); }}
                  className="text-white/40 hover:text-white text-xs cursor-pointer"
                >
                  Cancel
                </button>
              </div>

              <div className="flex gap-2">
                <input
                  type="password"
                  maxLength={5}
                  required
                  autoFocus
                  value={enteredPasscode}
                  onChange={(e) => setEnteredPasscode(e.target.value.replace(/\D/g, '').slice(0, 5))}
                  placeholder="•••••"
                  className="flex-1 py-2.5 px-3 text-center tracking-[0.3em] font-mono text-base font-bold rounded-xl bg-white/[0.05] border border-white/15 focus:border-amber-400 text-amber-400 outline-none"
                />
                <button
                  type="submit"
                  className="py-2.5 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-extrabold text-xs transition-colors cursor-pointer"
                >
                  Unlock & Edit
                </button>
              </div>

              {passcodeError && (
                <span className="text-[11px] text-red-400 font-semibold">{passcodeError}</span>
              )}
            </form>
          )}

          {/* Footer Branding */}
          <div className="pt-2 flex items-center gap-1.5 text-[11px] text-white/30 font-mono">
            <span>Powered by</span>
            <Link to="/" className="text-white/50 hover:text-white font-bold">
              Tagtique Smart NFC
            </Link>
          </div>
        </div>

      </main>

    </div>
  );
}
