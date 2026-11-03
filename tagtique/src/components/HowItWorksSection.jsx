import React from 'react';
import { 
  Laptop, 
  Phone, 
  Wifi, 
  WifiOff, 
  CheckCircle2, 
  ShieldCheck, 
  QrCode, 
  ArrowRight, 
  Check, 
  Radio, 
  Lock, 
  Smartphone, 
  Car,
  Briefcase,
  Key,
  Shield, 
  ChevronRight, 
  ExternalLink,
  Sparkles,
  MapPin
} from 'lucide-react';
import { SETUP_STEPS } from '../data/setupGuide';

// High-res Mimi sticker asset
const MIMI_IMG = '/assets/stickers/designed/Pink_Cat.png';

function WhatsAppIcon({ className = "w-3 h-3" }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.007c.101.005.232-.038.36.27.13.313.447 1.091.487 1.171.04.081.066.174.013.281-.053.107-.08.174-.159.268-.08.093-.167.208-.239.279-.08.08-.163.167-.07.327.093.159.414.683.888 1.106.611.544 1.127.712 1.286.792.159.08.252.067.346-.04.093-.107.404-.471.512-.632.107-.16.216-.134.364-.08.148.053.94.443 1.102.523.162.08.27.12.31.187.04.067.04.387-.104.792z"/>
    </svg>
  );
}

/**
 * Ultra-sleek Titanium Phone Mockup with Luxury Dark OLED Display
 */
function PhoneShell({ children, className = '' }) {
  return (
    <div className={`w-[184px] sm:w-[192px] shrink-0 rounded-[34px] bg-gradient-to-b from-[#2E2F3A] via-[#1B1C24] to-[#101117] p-2.5 shadow-[0_22px_45px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.25)] border border-white/10 transition-transform duration-300 group-hover:scale-[1.03] ${className}`}>
      {/* Glossy OLED Screen */}
      <div className="rounded-[26px] bg-[#0B0C12] overflow-hidden h-[230px] flex flex-col relative border border-white/10 shadow-inner">
        {/* Dynamic Island Header */}
        <div className="h-6 flex items-center justify-between px-3 shrink-0 pt-1 border-b border-white/[0.04]">
          <span className="text-[8px] font-bold text-white/60 font-mono">9:41</span>
          <div className="h-2.5 w-11 rounded-full bg-black/90 border border-white/10 flex items-center justify-end px-1.5 shadow-sm">
            <span className="w-1 h-1 rounded-full bg-emerald-400 shadow-[0_0_4px_rgba(16,185,129,0.8)]" />
          </div>
          <div className="flex items-center gap-0.5 text-white/60">
            <span className="text-[7px] font-bold font-mono">5G</span>
          </div>
        </div>
        {/* Screen Content */}
        <div className="flex-1 flex flex-col justify-between p-2.5 overflow-hidden text-left">
          {children}
        </div>
      </div>
    </div>
  );
}

export default function HowItWorksSection() {
  return (
    <section 
      id="how" 
      className="w-full bg-[#08090D] text-white py-16 sm:py-24 relative overflow-hidden border-t border-b border-white/[0.08] font-manrope selection:bg-amber-400 selection:text-black"
    >
      {/* Ambient Radial Lighting & Subtle Dot Grid */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-12 left-1/3 w-[650px] h-[550px] bg-[radial-gradient(circle,rgba(245,178,31,0.06)_0%,transparent_70%)] blur-3xl" />
        <div className="absolute bottom-16 right-1/4 w-[600px] h-[500px] bg-[radial-gradient(circle,rgba(16,185,129,0.06)_0%,transparent_70%)] blur-3xl" />
        <div 
          className="absolute inset-0 opacity-15"
          style={{
            backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.15) 1px, transparent 1px)',
            backgroundSize: '24px 24px',
            maskImage: 'radial-gradient(circle at 50% 30%, black 50%, transparent 85%)',
            WebkitMaskImage: 'radial-gradient(circle at 50% 30%, black 50%, transparent 85%)'
          }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* ========================================================================= */}
        {/* PART 1: HOW THE STICKER HELPS (DUAL ROUTING: ONLINE & OFFLINE)            */}
        {/* ========================================================================= */}
        <div>
          {/* Eyebrow & Main Header */}
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-black uppercase tracking-widest mb-3.5 shadow-sm">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Dual-Layer Recovery System</span>
            </div>
            <h2 className="font-extrabold text-3xl sm:text-4xl lg:text-5xl text-white tracking-tight leading-[1.05]">
              How the sticker helps.
            </h2>
            <p className="mt-3 text-base sm:text-lg text-white/65 leading-relaxed">
              Stick it on anything you value. Anyone who scans it reaches your private contact card online, and can still place a direct phone call even when completely offline.
            </p>
          </div>

          {/* 3 Interactive Feature Showcase Cards */}
          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-stretch">
            
            {/* Card 1: Physical Belongings */}
            <article className="rounded-[32px] bg-gradient-to-b from-[#14151D] via-[#101117] to-[#0A0B0F] border border-white/10 p-6 sm:p-8 flex flex-col justify-between shadow-[0_20px_50px_rgba(0,0,0,0.6)] hover:shadow-[0_25px_60px_rgba(0,0,0,0.8)] hover:border-purple-400/40 transition-all duration-300 hover:-translate-y-1.5 group relative overflow-hidden">
              {/* Top Pill */}
              <div className="flex items-center justify-between mb-5">
                <span className="text-[10px] font-black tracking-wider uppercase px-3 py-1 rounded-full bg-purple-500/15 text-purple-300 border border-purple-500/30 shadow-sm">
                  Physical Belongings
                </span>
                <span className="text-xs font-mono font-extrabold text-white/30">01</span>
              </div>

              {/* Graphic Mockup: Premium Device Surface with High-Res Mimi Sticker */}
              <div className="h-[240px] rounded-2xl bg-gradient-to-b from-[#24242C] via-[#1A1A22] to-[#121218] border border-white/10 flex flex-col items-center justify-center relative overflow-hidden p-4 shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)] group-hover:border-purple-300/50 transition-colors">
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.04] to-transparent pointer-events-none" />
                <div className="absolute -top-10 -left-10 w-40 h-40 rounded-full bg-purple-500/15 blur-2xl pointer-events-none" />

                {/* Sticker on Device Surface */}
                <div className="relative flex flex-col items-center">
                  <div className="relative">
                    <img 
                      src={MIMI_IMG} 
                      alt="Mimi Smart QR Sticker" 
                      className="w-28 sm:w-32 h-auto object-contain select-none drop-shadow-[0_16px_28px_rgba(0,0,0,0.5)] transition-transform duration-300 group-hover:scale-105"
                      draggable={false}
                    />
                  </div>
                </div>

                {/* Placement Pills Tag Bar matching current product logic */}
                <div className="mt-3.5 flex flex-wrap items-center justify-center gap-1.5 z-10">
                  <span className="px-2 py-0.5 rounded-md bg-white/10 text-white/90 text-[9px] font-bold backdrop-blur-sm">Phone</span>
                  <span className="px-2 py-0.5 rounded-md bg-white/10 text-white/90 text-[9px] font-bold backdrop-blur-sm">Laptop</span>
                  <span className="px-2 py-0.5 rounded-md bg-white/10 text-white/90 text-[9px] font-bold backdrop-blur-sm">Vehicle</span>
                  <span className="px-2 py-0.5 rounded-md bg-white/10 text-white/90 text-[9px] font-bold backdrop-blur-sm">Keys</span>
                  <span className="px-2 py-0.5 rounded-md bg-white/10 text-white/90 text-[9px] font-bold backdrop-blur-sm">Bag</span>
                </div>
              </div>

              {/* Text & Icon Details */}
              <div className="mt-6 flex flex-col">
                <div className="w-11 h-11 rounded-2xl bg-white/10 text-white flex items-center justify-center shadow-md mb-3.5 group-hover:bg-purple-600 transition-colors">
                  <Smartphone className="w-5 h-5 text-purple-300" aria-hidden="true" />
                </div>
                <h3 className="font-extrabold text-xl text-white tracking-tight">
                  Easier to get an item home
                </h3>
                <p className="mt-2 text-sm text-white/65 leading-relaxed">
                  A phone, laptop, car, keys, or bag carries a durable smart QR instead of your private number exposed on the outside.
                </p>
              </div>
            </article>

            {/* Card 2: Online Mode (Redesigned Verified Contact Card) */}
            <article className="rounded-[32px] bg-gradient-to-b from-[#14151D] via-[#101117] to-[#0A0B0F] border border-white/10 p-6 sm:p-8 flex flex-col justify-between shadow-[0_20px_50px_rgba(0,0,0,0.6)] hover:shadow-[0_25px_60px_rgba(0,0,0,0.8)] hover:border-emerald-400/40 transition-all duration-300 hover:-translate-y-1.5 group relative overflow-hidden">
              {/* Top Pill */}
              <div className="flex items-center justify-between mb-5">
                <span className="text-[10px] font-black tracking-wider uppercase px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shadow-sm">
                  Online Portal
                </span>
                <span className="text-xs font-mono font-extrabold text-white/30">02</span>
              </div>

              {/* Phone Shell: Matches our exact live QrContactView design */}
              <div className="h-[240px] flex items-center justify-center">
                <PhoneShell>
                  {/* Web Profile Header */}
                  <div className="flex items-center justify-between border-b border-white/10 pb-1.5">
                    <div className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="text-[8px] font-mono font-bold text-emerald-400 uppercase tracking-wider">
                        VERIFIED TAG
                      </span>
                    </div>
                    <span className="text-[7px] font-mono text-white/50 bg-white/[0.05] px-1.5 py-0.5 rounded">
                      ID: TGT-716
                    </span>
                  </div>

                  {/* Device Info */}
                  <div className="my-auto flex flex-col gap-1.5">
                    <div className="bg-white/[0.04] border border-white/10 rounded-xl p-2 flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-amber-400/15 border border-amber-400/30 text-amber-400 flex items-center justify-center shrink-0">
                        <Smartphone className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-[7px] font-mono uppercase font-bold text-amber-400 block leading-tight">Smartphone</span>
                        <span className="text-[10px] font-extrabold text-white block truncate leading-tight">iPhone 15 Pro</span>
                        <span className="text-[7px] text-white/50 block">Owner: Ahmad K.</span>
                      </div>
                    </div>

                    {/* Situation Chip */}
                    <div className="flex gap-1">
                      <span className="py-0.5 px-2 rounded-md bg-amber-400 text-black text-[7.5px] font-extrabold shadow-xs">
                        Found Your Phone
                      </span>
                      <span className="py-0.5 px-1.5 rounded-md bg-white/[0.05] border border-white/10 text-white/60 text-[7.5px]">
                        Urgent Note
                      </span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col gap-1">
                      <div className="w-full py-1.5 px-2 rounded-lg bg-[#25D366] text-white text-[8.5px] font-extrabold flex items-center justify-center gap-1 shadow-sm">
                        <WhatsAppIcon className="w-2.5 h-2.5 text-white" />
                        <span>Message on WhatsApp</span>
                      </div>
                      <div className="w-full py-1 px-2 rounded-lg bg-white/[0.06] border border-white/10 text-white/90 text-[8px] font-extrabold flex items-center justify-center gap-1">
                        <Phone className="w-2 h-2 text-emerald-400" />
                        <span>Direct Phone Call</span>
                      </div>
                    </div>
                  </div>

                  {/* Footer note */}
                  <div className="flex items-center justify-center gap-1 pt-1 border-t border-white/[0.06]">
                    <Lock className="w-2 h-2 text-amber-400" />
                    <span className="text-[7px] text-center text-white/50 font-bold">
                      Protected by 5-Digit Passcode
                    </span>
                  </div>
                </PhoneShell>
              </div>

              {/* Text & Icon Details */}
              <div className="mt-6 flex flex-col">
                <div className="w-11 h-11 rounded-2xl bg-white/10 text-white flex items-center justify-center shadow-md mb-3.5 group-hover:bg-emerald-600 transition-colors">
                  <Wifi className="w-5 h-5 text-emerald-400" aria-hidden="true" />
                </div>
                <h3 className="font-extrabold text-xl text-white tracking-tight">
                  Instant Online Portal
                </h3>
                <p className="mt-2 text-sm text-white/65 leading-relaxed">
                  The scan opens your live verified contact card. Finders tap WhatsApp or Call directly — no app installation needed.
                </p>
              </div>
            </article>

            {/* Card 3: Offline Mode (Direct Cell Network Dialer) */}
            <article className="rounded-[32px] bg-gradient-to-b from-[#14151D] via-[#101117] to-[#0A0B0F] border border-white/10 p-6 sm:p-8 flex flex-col justify-between shadow-[0_20px_50px_rgba(0,0,0,0.6)] hover:shadow-[0_25px_60px_rgba(0,0,0,0.8)] hover:border-amber-400/40 transition-all duration-300 hover:-translate-y-1.5 group relative overflow-hidden">
              {/* Top Pill */}
              <div className="flex items-center justify-between mb-5">
                <span className="text-[10px] font-black tracking-wider uppercase px-3 py-1 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 shadow-sm">
                  Zero Internet Required
                </span>
                <span className="text-xs font-mono font-extrabold text-white/30">03</span>
              </div>

              {/* Phone Shell: Native Dialer Screen */}
              <div className="h-[240px] flex items-center justify-center">
                <PhoneShell>
                  <div className="flex-1 flex flex-col items-center justify-center text-center">
                    {/* Steady Call Avatar with Concentric Rings */}
                    <div className="relative mb-2">
                      <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-amber-500 to-amber-400 text-black flex items-center justify-center shadow-lg relative z-10">
                        <Phone className="w-4 h-4 text-black" />
                      </div>
                      <div className="absolute -inset-1.5 rounded-full border border-amber-400/40 pointer-events-none animate-pulse" />
                      <div className="absolute -inset-3 rounded-full border border-amber-400/15 pointer-events-none" />
                    </div>

                    <span className="text-[10px] font-extrabold text-white leading-tight">Tagtique Emergency</span>
                    <span className="text-[8px] text-white/50 font-mono mt-0.5">Calling owner directly...</span>
                    
                    <div className="mt-2.5 flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-400/10 text-amber-300 text-[7.5px] font-extrabold border border-amber-400/30 shadow-sm">
                      <WifiOff className="w-2.5 h-2.5 text-amber-400" />
                      <span>Offline Dialer Mode</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-center gap-1 pt-1 border-t border-white/[0.06]">
                    <Radio className="w-2 h-2 text-amber-400" />
                    <span className="text-[7.5px] text-center text-white/50 font-bold">
                      Direct Cellular Voice Fallback
                    </span>
                  </div>
                </PhoneShell>
              </div>

              {/* Text & Icon Details */}
              <div className="mt-6 flex flex-col">
                <div className="w-11 h-11 rounded-2xl bg-white/10 text-white flex items-center justify-center shadow-md mb-3.5 group-hover:bg-amber-600 transition-colors">
                  <WifiOff className="w-5 h-5 text-amber-400" aria-hidden="true" />
                </div>
                <h3 className="font-extrabold text-xl text-white tracking-tight">
                  Offline Cellular Fallback
                </h3>
                <p className="mt-2 text-sm text-white/65 leading-relaxed">
                  No internet opens the phone dialer directly. The sticker connects immediately without tracking or GPS battery drain.
                </p>
              </div>
            </article>

          </div>
        </div>

        {/* ========================================================================= */}
        {/* PART 2: AFTER YOU BUY IT (THE 4-STEP ONBOARDING WALKTHROUGH)              */}
        {/* ========================================================================= */}
        <div className="mt-20 sm:mt-28 pt-16 border-t border-white/10">
          
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12">
            <div className="max-w-2xl">
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-white/[0.06] border border-white/10 text-white/80 text-xs font-semibold tracking-wide mb-3.5">
                <span>Zero App Downloads, 100% Browser Based</span>
              </div>
              <h3 className="font-extrabold text-3xl sm:text-4xl text-white tracking-tight leading-[1.1]">
                After your sticker arrives.
              </h3>
              <p className="mt-3 text-base text-white/65 leading-relaxed">
                No app store downloads, accounts, or subscriptions. Just 4 simple steps to link your device, set your contact, and protect your belongings.
              </p>
            </div>

            {/* Quick Reassurance Badges */}
            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white/[0.06] border border-white/10 text-xs font-bold text-white/85 shadow-xs">
                <Check className="w-3.5 h-3.5 text-emerald-400 stroke-[3]" />
                iOS & Android
              </span>
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white/[0.06] border border-white/10 text-xs font-bold text-white/85 shadow-xs">
                <Check className="w-3.5 h-3.5 text-emerald-400 stroke-[3]" />
                5-Digit Passcode Protected
              </span>
            </div>
          </div>

          {/* 4 Connected Setup Cards */}
          <div className="relative">
            <ol className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch relative z-10">
              
              {/* Step 1: Scan QR with Phone Camera */}
              <li className="rounded-[26px] bg-[#12131A] border border-white/10 p-5 sm:p-6 flex flex-col justify-between shadow-xl hover:shadow-[0_20px_40px_rgba(0,0,0,0.8)] hover:border-amber-400/40 transition-all duration-300 hover:-translate-y-1 group">
                <div>
                  <div className="flex items-center justify-between pb-3.5 mb-3.5 border-b border-white/10">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-white/10 border border-white/15 text-white text-[11px] font-mono font-extrabold flex items-center justify-center shadow-xs">
                        {SETUP_STEPS[0].n}
                      </span>
                      <span className="text-[11px] font-mono font-extrabold uppercase tracking-wider text-white/50 group-hover:text-white transition-colors">
                        STEP {SETUP_STEPS[0].n}
                      </span>
                    </div>
                    <span className="text-[10px] font-bold text-white/60 bg-white/[0.06] px-2 py-0.5 rounded-full">
                      {SETUP_STEPS[0].time}
                    </span>
                  </div>

                  {/* Visual: Authentic Native Camera Viewfinder */}
                  <div className="h-[190px] rounded-2xl bg-gradient-to-b from-[#181920] to-[#0D0E12] border border-white/10 p-3 flex flex-col justify-between relative overflow-hidden shadow-inner group-hover:border-amber-500/30 transition-colors mb-5">
                    {/* Camera Top HUD */}
                    <div className="flex items-center justify-between text-white/60 text-[9px] px-1 font-mono">
                      <span>CAMERA</span>
                      <div className="flex items-center gap-1.5 bg-black/40 px-2 py-0.5 rounded-full text-[8px] font-bold text-white/80">
                        <span>.5</span>
                        <span className="text-amber-400 font-extrabold">1x</span>
                        <span>2</span>
                      </div>
                    </div>

                    {/* Viewfinder Target with High-Res Mimi Sticker */}
                    <div className="relative flex items-center justify-center py-1">
                      {/* Focus Corner Brackets */}
                      <div className="absolute w-24 h-24 pointer-events-none">
                        <span className="absolute top-0 left-0 w-2.5 h-2.5 border-t-2 border-l-2 border-amber-400" />
                        <span className="absolute top-0 right-0 w-2.5 h-2.5 border-t-2 border-r-2 border-amber-400" />
                        <span className="absolute bottom-0 left-0 w-2.5 h-2.5 border-b-2 border-l-2 border-amber-400" />
                        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 border-b-2 border-r-2 border-amber-400" />
                      </div>

                      <img 
                        src={MIMI_IMG} 
                        alt="Scan Sticker" 
                        className="w-16 h-auto object-contain drop-shadow-md select-none group-hover:scale-105 transition-transform"
                        draggable={false}
                      />
                    </div>

                    {/* Native Camera Pop-up Link */}
                    <div className="w-full py-1.5 px-3 rounded-full bg-amber-400 text-black text-[9px] font-extrabold flex items-center justify-between shadow-lg">
                      <div className="flex items-center gap-1.5 truncate">
                        <QrCode className="w-3 h-3 text-black shrink-0" />
                        <span className="truncate">tagtique.com/tag/TGT-716</span>
                      </div>
                      <ArrowRight className="w-3 h-3 text-black shrink-0" />
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-extrabold text-lg text-white tracking-tight">
                    {SETUP_STEPS[0].title}
                  </h4>
                  <p className="mt-2 text-xs sm:text-sm text-white/65 leading-relaxed">
                    {SETUP_STEPS[0].text}
                  </p>
                </div>
              </li>

              {/* Step 2: Choose Your Belonging */}
              <li className="rounded-[26px] bg-[#12131A] border border-white/10 p-5 sm:p-6 flex flex-col justify-between shadow-xl hover:shadow-[0_20px_40px_rgba(0,0,0,0.8)] hover:border-amber-400/40 transition-all duration-300 hover:-translate-y-1 group">
                <div>
                  <div className="flex items-center justify-between pb-3.5 mb-3.5 border-b border-white/10">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-white/10 border border-white/15 text-white text-[11px] font-mono font-extrabold flex items-center justify-center shadow-xs">
                        {SETUP_STEPS[1].n}
                      </span>
                      <span className="text-[11px] font-mono font-extrabold uppercase tracking-wider text-white/50 group-hover:text-white transition-colors">
                        STEP {SETUP_STEPS[1].n}
                      </span>
                    </div>
                    <span className="text-[10px] font-bold text-white/60 bg-white/[0.06] px-2 py-0.5 rounded-full">
                      {SETUP_STEPS[1].time}
                    </span>
                  </div>

                  {/* Visual: Device Selection Grid */}
                  <div className="h-[190px] rounded-2xl bg-gradient-to-b from-[#181920] to-[#0D0E12] border border-white/10 p-3 flex flex-col justify-between relative overflow-hidden shadow-inner group-hover:border-amber-500/30 transition-colors mb-5">
                    {/* Header */}
                    <div className="flex items-center justify-between text-[8px] font-mono text-white/50">
                      <span>SELECT DEVICE</span>
                      <span className="text-amber-400 font-bold">1-TAP</span>
                    </div>

                    {/* Interactive Device Grid */}
                    <div className="grid grid-cols-2 gap-1.5 my-auto">
                      <div className="p-2 rounded-xl bg-amber-400/15 border border-amber-400 text-amber-300 flex items-center gap-1.5 shadow-sm">
                        <Smartphone className="w-3.5 h-3.5" />
                        <span className="text-[8.5px] font-extrabold">Phone</span>
                      </div>
                      <div className="p-2 rounded-xl bg-white/[0.04] border border-white/10 text-white/70 flex items-center gap-1.5">
                        <Laptop className="w-3.5 h-3.5" />
                        <span className="text-[8.5px] font-bold">Laptop</span>
                      </div>
                      <div className="p-2 rounded-xl bg-white/[0.04] border border-white/10 text-white/70 flex items-center gap-1.5">
                        <Car className="w-3.5 h-3.5" />
                        <span className="text-[8.5px] font-bold">Vehicle</span>
                      </div>
                      <div className="p-2 rounded-xl bg-white/[0.04] border border-white/10 text-white/70 flex items-center gap-1.5">
                        <Key className="w-3.5 h-3.5" />
                        <span className="text-[8.5px] font-bold">Keys</span>
                      </div>
                    </div>

                    <div className="py-1 px-2.5 rounded-lg bg-black/40 border border-white/10 flex items-center justify-between">
                      <span className="text-[8px] text-white/70">Selected: <strong>Smartphone Tag</strong></span>
                      <span className="text-[8px] text-emerald-400 font-bold">✓ Ready</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-extrabold text-lg text-white tracking-tight">
                    {SETUP_STEPS[1].title}
                  </h4>
                  <p className="mt-2 text-xs sm:text-sm text-white/65 leading-relaxed">
                    {SETUP_STEPS[1].text}
                  </p>
                </div>
              </li>

              {/* Step 3: Enter Info & 5-Digit PIN */}
              <li className="rounded-[26px] bg-[#12131A] border border-white/10 p-5 sm:p-6 flex flex-col justify-between shadow-xl hover:shadow-[0_20px_40px_rgba(0,0,0,0.8)] hover:border-amber-400/40 transition-all duration-300 hover:-translate-y-1 group">
                <div>
                  <div className="flex items-center justify-between pb-3.5 mb-3.5 border-b border-white/10">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-white/10 border border-white/15 text-white text-[11px] font-mono font-extrabold flex items-center justify-center shadow-xs">
                        {SETUP_STEPS[2].n}
                      </span>
                      <span className="text-[11px] font-mono font-extrabold uppercase tracking-wider text-white/50 group-hover:text-white transition-colors">
                        STEP {SETUP_STEPS[2].n}
                      </span>
                    </div>
                    <span className="text-[10px] font-bold text-white/60 bg-white/[0.06] px-2 py-0.5 rounded-full">
                      {SETUP_STEPS[2].time}
                    </span>
                  </div>

                  {/* Visual: Clean Mobile Registration Form with 5-Digit PIN */}
                  <div className="h-[190px] rounded-2xl bg-[#161722] border border-white/10 p-3 flex flex-col justify-between relative overflow-hidden shadow-inner group-hover:border-amber-400/30 transition-colors mb-5">
                    {/* Browser Address Bar */}
                    <div className="h-5 rounded-lg bg-black/40 border border-white/10 px-2 flex items-center justify-between shadow-xs">
                      <div className="flex items-center gap-1 min-w-0">
                        <Lock className="w-2.5 h-2.5 text-amber-400 shrink-0" />
                        <span className="text-[7.5px] font-mono text-white/70 truncate">tagtique.com/scan</span>
                      </div>
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                    </div>

                    {/* Mobile Form Inputs */}
                    <div className="flex flex-col gap-1.5 my-auto">
                      <div className="bg-black/40 rounded-lg border border-white/10 px-2 py-1 shadow-xs">
                        <span className="text-[7px] uppercase font-bold text-white/40 block leading-tight">WhatsApp Contact</span>
                        <span className="text-[9px] font-extrabold text-white font-mono">+92 300 8472910</span>
                      </div>
                      <div className="bg-black/40 rounded-lg border border-white/10 px-2 py-1 shadow-xs flex items-center justify-between">
                        <div>
                          <span className="text-[7px] uppercase font-bold text-white/40 block leading-tight">5-Digit Passcode</span>
                          <span className="text-[9px] font-mono font-extrabold text-amber-400 tracking-widest">• • • • •</span>
                        </div>
                        <span className="text-[7.5px] font-bold text-amber-300 bg-amber-400/10 px-1.5 py-0.5 rounded border border-amber-400/25">Set</span>
                      </div>
                    </div>

                    {/* Submit Button */}
                    <div className="w-full py-1.5 rounded-lg bg-amber-400 text-black text-[9px] font-black text-center shadow-md">
                      Activate Tag & Go Live →
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-extrabold text-lg text-white tracking-tight">
                    {SETUP_STEPS[2].title}
                  </h4>
                  <p className="mt-2 text-xs sm:text-sm text-white/65 leading-relaxed">
                    {SETUP_STEPS[2].text}
                  </p>
                </div>
              </li>

              {/* Step 4: Tag is Ready & Active */}
              <li className="rounded-[26px] bg-[#12131A] border border-white/10 p-5 sm:p-6 flex flex-col justify-between shadow-xl hover:shadow-[0_20px_40px_rgba(0,0,0,0.8)] hover:border-emerald-400/40 transition-all duration-300 hover:-translate-y-1 group">
                <div>
                  <div className="flex items-center justify-between pb-3.5 mb-3.5 border-b border-white/10">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-emerald-500 text-white text-[11px] font-mono font-extrabold flex items-center justify-center shadow-xs">
                        ✓
                      </span>
                      <span className="text-[11px] font-mono font-extrabold uppercase tracking-wider text-white/50 group-hover:text-white transition-colors">
                        STEP {SETUP_STEPS[3].n}
                      </span>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                      {SETUP_STEPS[3].time}
                    </span>
                  </div>

                  {/* Visual: Physical Sticker Applied to Hardware Surface */}
                  <div className="h-[190px] rounded-2xl bg-gradient-to-b from-[#1F2027] via-[#16171E] to-[#0E0F14] border border-white/10 p-3 flex flex-col items-center justify-between relative overflow-hidden shadow-inner group-hover:border-emerald-500/30 transition-colors mb-5">
                    {/* Top Status */}
                    <div className="w-full flex items-center justify-between text-[9px] font-mono font-bold text-white/60 px-1">
                      <span>TAG ACTIVE</span>
                      <span className="text-emerald-400 font-extrabold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        ONLINE
                      </span>
                    </div>

                    {/* High-res Die-Cut Sticker with 3D drop shadow */}
                    <div className="relative py-1">
                      <img 
                        src={MIMI_IMG} 
                        alt="Tag Live" 
                        className="w-18 h-auto max-h-[85px] object-contain drop-shadow-[0_12px_24px_rgba(0,0,0,0.65)] select-none group-hover:scale-105 transition-transform"
                        draggable={false}
                      />
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-md">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                    </div>

                    {/* Verified Live Badge */}
                    <div className="w-full py-1 px-2.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 backdrop-blur-md flex items-center justify-between">
                      <span className="text-[9px] font-extrabold text-emerald-300">Protected & Live</span>
                      <span className="text-[8px] font-mono font-bold text-emerald-200/80">TGT-716</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-extrabold text-lg text-white tracking-tight">
                    {SETUP_STEPS[3].title}
                  </h4>
                  <p className="mt-2 text-xs sm:text-sm text-white/65 leading-relaxed">
                    {SETUP_STEPS[3].text}
                  </p>
                </div>
              </li>

            </ol>
          </div>

          {/* Reassurance Micro-Grid */}
          <div className="mt-12 pt-8 border-t border-white/10 grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-white/[0.06] text-white flex items-center justify-center shrink-0 border border-white/10">
                <Smartphone className="w-4 h-4 text-white" />
              </div>
              <div>
                <h5 className="font-extrabold text-sm text-white">Zero App Downloads</h5>
                <p className="text-xs text-white/60 mt-1 leading-relaxed">
                  Everything operates right inside your standard phone browser with zero app store installs.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-white/[0.06] text-white flex items-center justify-center shrink-0 border border-white/10">
                <Lock className="w-4 h-4 text-amber-400" />
              </div>
              <div>
                <h5 className="font-extrabold text-sm text-white">5-Digit Passcode Security</h5>
                <p className="text-xs text-white/60 mt-1 leading-relaxed">
                  Your private 5-digit passcode ensures only you can update your contact numbers or re-edit tag settings.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-white/[0.06] text-white flex items-center justify-center shrink-0 border border-white/10">
                <Shield className="w-4 h-4 text-white" />
              </div>
              <div>
                <h5 className="font-extrabold text-sm text-white">Reliable Direct Contact</h5>
                <p className="text-xs text-white/60 mt-1 leading-relaxed">
                  Both online WhatsApp/call cards and offline cellular dialer fallbacks ensure finders reach you immediately.
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
