import React, { useState } from 'react';
import { downloadVCard } from '../utils/vcard';
import { Phone, Mail, Bookmark, AlertTriangle, Briefcase, User, Download } from 'lucide-react';

function InstagramIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
    </svg>
  );
}

const MODES = [
  {
    id: 'public',
    label: 'Public Mode',
    icon: User,
    badgeText: 'PUBLIC PROFILE',
    badgeBg: '#F4EADA',
    badgeColor: '#8A5A2B',
    kicker: 'FOR EVERYDAY NETWORKING',
    blurb: 'Hand out your socials and cell at cafes, meetups and travels without repeating your handle.',
    name: 'Ayesha Khan',
    sub: 'Ceramics & Industrial Design',
    rows: [
      { k: 'PHONE', v: '+92 300 114 2288', icon: Phone },
      { k: 'EMAIL', v: 'ayesha@tagtique.co', icon: Mail },
      { k: 'INSTAGRAM', v: '@ayesha.makes', icon: InstagramIcon }
    ],
    cta: 'Save contact'
  },
  {
    id: 'work',
    label: 'Work Mode',
    icon: Briefcase,
    badgeText: 'WORK & STUDIO',
    badgeBg: '#E8F5E9',
    badgeColor: '#2E7D32',
    kicker: 'FOR CLIENTS & CONFERENCES',
    blurb: 'Keep private numbers concealed. Direct prospective clients straight to your studio email and portfolio.',
    name: 'Ayesha Khan',
    sub: 'Founder · Studio Clay Lahore',
    rows: [
      { k: 'OFFICE', v: '+92 42 3578 9900', icon: Phone },
      { k: 'WORK EMAIL', v: 'hello@studioclay.pk', icon: Mail },
      { k: 'PORTFOLIO', v: 'studioclay.pk', icon: Bookmark }
    ],
    cta: 'Save business card'
  },
  {
    id: 'lost',
    label: 'Lost & Found',
    icon: AlertTriangle,
    badgeText: 'LOST & FOUND ACTIVE',
    badgeBg: '#FFEBEE',
    badgeColor: '#C62828',
    kicker: 'IF YOUR KEYS OR BAG WENT MISSING',
    blurb: 'Turn on from your phone in 5 seconds. Displays a prominent reward notice and direct finder WhatsApp line.',
    name: 'Reward Offered · PKR 5,000',
    sub: 'Belongs to Ayesha K. (Keys Tag)',
    rows: [
      { k: 'FINDER HOTLINE', v: '+92 300 114 2288', icon: Phone },
      { k: 'MESSAGE', v: 'Please WhatsApp or call if found!', icon: Mail },
      { k: 'RETURN ADDRESS', v: 'Drop off at Gulberg Police Station', icon: Bookmark }
    ],
    cta: 'Call owner now'
  }
];

export default function WhatTheySeeSection() {
  const [activeModeId, setActiveModeId] = useState('public');
  const activeMode = MODES.find((m) => m.id === activeModeId) || MODES[0];

  const handleCtaClick = () => {
    if (activeModeId === 'lost') {
      window.open('tel:+923001142288');
    } else {
      downloadVCard({
        name: 'Ayesha Khan',
        title: activeModeId === 'work' ? 'Founder' : 'Designer',
        organization: activeModeId === 'work' ? 'Studio Clay' : 'Tagtique',
        phone: '+92 300 114 2288',
        email: activeModeId === 'work' ? 'hello@studioclay.pk' : 'ayesha@tagtique.co',
        instagram: 'ayesha.makes'
      });
    }
  };

  return (
    <section id="what-they-see" className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="relative rounded-[36px] bg-tag-card border-[1.5px] border-tag-border p-6 sm:p-12 lg:p-14 overflow-hidden shadow-warm-md">
        {/* Glow orb */}
        <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-tag-amber/15 blur-3xl pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          
          {/* Left Text & Mode Selector */}
          <div className="lg:col-span-6 flex flex-col gap-6">
            <span className="font-mono text-[11px] font-bold tracking-[1.6px] text-tag-brown-light uppercase">
              WHAT THEY SEE
            </span>
            <h2 className="font-baloo font-extrabold text-3xl sm:text-4xl lg:text-5xl text-tag-brown leading-tight">
              Your card opens in their browser. Nothing to download.
            </h2>
            <p className="text-base sm:text-lg text-tag-brown-muted leading-relaxed font-medium">
              Three modes, one tag. Flip between them any time from your account — the engraved QR code on your tag never changes.
            </p>

            {/* Mode switch pills */}
            <div className="flex flex-wrap gap-2.5 pt-2">
              {MODES.map((m) => {
                const isActive = m.id === activeModeId;
                const IconComponent = m.icon;
                return (
                  <button
                    key={m.id}
                    onClick={() => setActiveModeId(m.id)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-bold transition-all ${
                      isActive
                        ? 'bg-tag-brown text-[#FDF7EC] shadow-warm-sm scale-105'
                        : 'bg-tag-bg text-tag-brown-muted border border-tag-border hover:border-tag-amber hover:text-tag-brown'
                    }`}
                  >
                    <IconComponent className="w-4 h-4" />
                    <span>{m.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Explanatory callout */}
            <div className="flex flex-col gap-2 border-l-2 border-tag-amber pl-4 py-1">
              <span className="font-mono text-[11px] font-bold tracking-wider text-tag-brown-light uppercase">
                {activeMode.kicker}
              </span>
              <p className="text-sm sm:text-base text-tag-brown font-medium leading-relaxed">
                {activeMode.blurb}
              </p>
            </div>
          </div>

          {/* Right Phone Simulator */}
          <div className="lg:col-span-6 flex justify-center items-center relative py-6">
            {/* Background halo */}
            <div className="absolute w-72 h-72 rounded-full bg-tag-amber/20 blur-2xl" />

            {/* Simulated Phone Device */}
            <div className="relative w-full max-w-[310px] rounded-[44px] border-[3px] border-tag-brown-deep bg-tag-bg p-3 shadow-warm-lg transition-transform duration-500 rotate-[-1.5deg] hover:rotate-0">
              
              {/* Speaker / Camera Notch */}
              <div className="flex justify-center pb-2.5">
                <span className="w-14 h-1 rounded-full bg-tag-border" />
              </div>

              {/* Screen Area */}
              <div className="rounded-[32px] border border-tag-border bg-tag-card p-5 flex flex-col gap-4 shadow-inner">
                {/* Browser URL bar simulation */}
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-[10px] tracking-wider text-tag-brown-subtle">
                    tagtique.co/ayesha
                  </span>
                  <span
                    className="text-[9px] font-mono font-bold tracking-wider px-2 py-0.5 rounded-full"
                    style={{ background: activeMode.badgeBg, color: activeMode.badgeColor }}
                  >
                    {activeMode.badgeText}
                  </span>
                </div>

                {/* Profile header */}
                <div className="flex items-center gap-3 pt-1">
                  <div className="w-12 h-12 rounded-full border-2 border-tag-brown-deep bg-tag-pill flex items-center justify-center font-baloo font-extrabold text-xl text-tag-brown-deep shadow-xs">
                    AK
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="font-baloo font-extrabold text-lg text-tag-brown leading-tight truncate">
                      {activeMode.name}
                    </span>
                    <span className="text-xs text-tag-brown-muted truncate">
                      {activeMode.sub}
                    </span>
                  </div>
                </div>

                {/* Information Rows */}
                <div className="flex flex-col gap-2.5 pt-1">
                  {activeMode.rows.map((row, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between gap-3 text-xs pb-2 border-b border-tag-border/60"
                    >
                      <span className="font-mono font-bold text-[10px] text-tag-brown-light tracking-wide">
                        {row.k}
                      </span>
                      <span className="font-semibold text-tag-brown truncate text-right">
                        {row.v}
                      </span>
                    </div>
                  ))}
                </div>

                {/* 1-Tap Save Action */}
                <button
                  type="button"
                  onClick={handleCtaClick}
                  className="amber-gradient-btn w-full py-3 rounded-full text-xs sm:text-sm font-extrabold text-tag-brown flex items-center justify-center gap-2 mt-1 shadow-sm"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{activeMode.cta}</span>
                </button>
              </div>

              {/* Floating Scan Metric Badge */}
              <div className="absolute -left-4 -top-3 flex items-center gap-2 bg-tag-card border border-tag-border rounded-full px-3 py-1.5 shadow-warm-md">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-mono text-[10px] font-bold text-tag-brown-muted tracking-wider">
                  SCAN #128 · 2 MIN AGO
                </span>
              </div>

              {/* Floating Speed Metric Badge */}
              <div className="absolute -left-2 -bottom-2 flex flex-col bg-tag-brown text-[#FDF7EC] rounded-2xl px-3.5 py-2 shadow-warm-lg">
                <span className="font-baloo font-extrabold text-lg leading-none text-tag-amber">
                  0.8s
                </span>
                <span className="font-mono text-[9px] tracking-wider text-[#A88B64]">
                  SCAN TO CARD
                </span>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
