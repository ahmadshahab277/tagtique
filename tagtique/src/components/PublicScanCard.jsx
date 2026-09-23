import React, { useState } from 'react';
import { downloadVCard } from '../utils/vcard';
import {
  X,
  Phone,
  Mail,
  Download,
  CheckCircle2,
  ExternalLink,
  MessageCircle,
  AlertTriangle,
  ArrowRight
} from 'lucide-react';

function InstagramIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
    </svg>
  );
}

export default function PublicScanCard({
  isOpen,
  onClose,
  profile = {
    name: 'Ayesha Khan',
    title: 'Ceramics & Industrial Designer',
    organization: 'Studio Clay Lahore',
    phone: '+92 300 114 2288',
    email: 'ayesha@tagtique.co',
    instagram: 'ayesha.makes',
    whatsapp: '+92 300 114 2288',
    bio: 'Sculpting functional homeware and minimal tactile everyday carry. Based in Lahore.'
  },
  onOrderTag
}) {
  const [activeMode, setActiveMode] = useState('public'); // 'public' | 'work' | 'lost'

  if (!isOpen) return null;

  const handleSaveContact = () => {
    downloadVCard({
      name: profile.name,
      title: activeMode === 'work' ? 'Founder & Creative Lead' : profile.title,
      organization: profile.organization,
      phone: profile.phone,
      email: profile.email,
      instagram: profile.instagram,
      note: 'Saved from Tagtique 3D QR Tag'
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto bg-black/75 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-sm rounded-[38px] bg-tag-card border-[2.5px] border-tag-brown-deep shadow-2xl overflow-hidden my-auto">
        
        {/* Top Phone Chrome bar */}
        <div className="bg-tag-brown text-[#FDF7EC] px-5 py-3.5 flex items-center justify-between border-b border-tag-brown-deep">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="font-mono text-[11px] font-bold tracking-wider text-tag-amber uppercase">
              TAGTIQUE CONNECT
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-[#E9D9C1] hover:text-white transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Mode Preview Switcher (Allows testing scanner's perspective) */}
        <div className="flex items-center justify-around border-b border-tag-border bg-tag-pill/80 p-1.5 text-xs font-bold">
          {['public', 'work', 'lost'].map((m) => (
            <button
              key={m}
              onClick={() => setActiveMode(m)}
              className={`px-3 py-1 rounded-full transition-all capitalize ${
                activeMode === m
                  ? 'bg-tag-card text-tag-brown shadow-xs'
                  : 'text-tag-brown-muted hover:text-tag-brown'
              }`}
            >
              {m === 'lost' ? 'Lost & Found' : m}
            </button>
          ))}
        </div>

        {/* Card Body */}
        <div className="p-6 flex flex-col gap-5">
          
          {/* Lost & Found Alert Banner */}
          {activeMode === 'lost' ? (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-300 flex flex-col gap-2 text-rose-900 animate-fadeIn">
              <div className="flex items-center gap-2 font-bold text-sm text-rose-700">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <span>Lost Item Notice</span>
              </div>
              <p className="text-xs leading-relaxed font-medium">
                These keys belong to <strong>{profile.name}</strong>. If found, please call or WhatsApp the owner immediately. Reward of <strong>PKR 5,000</strong> upon return.
              </p>
              <a
                href={`tel:${profile.phone}`}
                className="mt-1 w-full text-center py-2.5 rounded-full bg-rose-600 text-white font-bold text-xs shadow-sm hover:bg-rose-700 transition-colors"
              >
                Call Hotline: {profile.phone}
              </a>
            </div>
          ) : (
            <>
              {/* Profile Header */}
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full border-2 border-tag-brown-deep bg-gradient-to-tr from-tag-amber to-amber-200 flex items-center justify-center font-baloo font-extrabold text-2xl text-tag-brown-deep shadow-md">
                    {profile.name.split(' ').map((n) => n[0]).join('')}
                  </div>
                  <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center text-white">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </span>
                </div>

                <div className="flex flex-col min-w-0">
                  <h3 className="font-baloo font-extrabold text-2xl text-tag-brown leading-tight truncate">
                    {profile.name}
                  </h3>
                  <span className="text-xs font-semibold text-tag-brown-light truncate">
                    {activeMode === 'work' ? profile.organization : profile.title}
                  </span>
                  <span className="font-mono text-[10px] text-tag-brown-subtle tracking-wider mt-0.5">
                    VERIFIED TAGTIQUE ID
                  </span>
                </div>
              </div>

              {/* Bio */}
              <p className="text-xs sm:text-sm text-tag-brown-muted leading-relaxed font-medium bg-tag-bg p-3 rounded-2xl border border-tag-border/60">
                {profile.bio}
              </p>

              {/* Primary 1-Tap Save Button */}
              <button
                type="button"
                onClick={handleSaveContact}
                className="amber-gradient-btn w-full py-3.5 rounded-full text-sm font-extrabold text-tag-brown flex items-center justify-center gap-2 shadow-warm-sm"
              >
                <Download className="w-4 h-4" />
                <span>Save to Contacts (.vcf)</span>
              </button>

              {/* Quick Action Buttons */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <a
                  href={`tel:${profile.phone}`}
                  className="p-2.5 rounded-2xl border border-tag-border bg-tag-bg hover:bg-tag-pill transition-colors flex flex-col items-center gap-1 text-tag-brown"
                >
                  <Phone className="w-4 h-4 text-tag-brown-light" />
                  <span className="text-[10px] font-bold">Call</span>
                </a>
                <a
                  href={`mailto:${profile.email}`}
                  className="p-2.5 rounded-2xl border border-tag-border bg-tag-bg hover:bg-tag-pill transition-colors flex flex-col items-center gap-1 text-tag-brown"
                >
                  <Mail className="w-4 h-4 text-tag-brown-light" />
                  <span className="text-[10px] font-bold">Email</span>
                </a>
                <a
                  href={`https://wa.me/${profile.whatsapp.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-2xl border border-tag-border bg-tag-bg hover:bg-tag-pill transition-colors flex flex-col items-center gap-1 text-tag-brown"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-600" />
                  <span className="text-[10px] font-bold">WhatsApp</span>
                </a>
              </div>

              {/* Detailed Links */}
              <div className="flex flex-col gap-2 text-xs">
                <a
                  href={`https://instagram.com/${profile.instagram.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 rounded-xl bg-tag-bg border border-tag-border/60 hover:border-tag-amber transition-colors text-tag-brown font-semibold"
                >
                  <div className="flex items-center gap-2.5">
                    <InstagramIcon className="w-4 h-4 text-tag-brown-light" />
                    <span>Instagram</span>
                  </div>
                  <span className="text-tag-brown-subtle flex items-center gap-1">
                    {profile.instagram}
                    <ExternalLink className="w-3 h-3" />
                  </span>
                </a>
              </div>
            </>
          )}

          {/* Footer promo for the scanner */}
          <div className="pt-2 border-t border-tag-border/60 text-center flex flex-col gap-2">
            <button
              onClick={() => {
                onClose();
                onOrderTag();
              }}
              className="text-[11px] font-bold text-tag-brown hover:text-tag-amber-deep flex items-center justify-center gap-1.5"
            >
              <span>Get your own custom 3D Tagtique</span>
              <ArrowRight className="w-3.5 h-3.5 text-tag-amber" />
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
