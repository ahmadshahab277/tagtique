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
  Shield,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { SETUP_STEPS } from '../data/setupGuide';

// High-res Mimi sticker asset
const MIMI_IMG = '/assets/stickers/designed/Pink_Cat.png';

/**
 * Ultra-sleek Titanium Phone Mockup (Steady, Elegant, No Blinking)
 */
function PhoneShell({ children, className = '' }) {
  return (
    <div className={`w-[180px] sm:w-[188px] shrink-0 rounded-[34px] bg-gradient-to-b from-[#282830] via-[#1A1A22] to-[#121218] p-2.5 shadow-[0_22px_45px_rgba(0,0,0,0.14),inset_0_1px_1px_rgba(255,255,255,0.3)] border border-black/15 transition-transform duration-300 group-hover:scale-[1.03] ${className}`}>
      {/* Glossy OLED Screen */}
      <div className="rounded-[26px] bg-[#F8F9FD] overflow-hidden h-[225px] flex flex-col relative border border-black/5 shadow-inner">
        {/* Dynamic Island Header */}
        <div className="h-6 flex items-center justify-between px-3 shrink-0 pt-1">
          <span className="text-[8px] font-bold text-black/60 font-mono">9:41</span>
          <div className="h-2.5 w-11 rounded-full bg-black flex items-center justify-end px-1.5 shadow-sm">
            <span className="w-1 h-1 rounded-full bg-emerald-500 shadow-[0_0_4px_rgba(16,185,129,0.8)]" />
          </div>
          <div className="flex items-center gap-0.5 text-black/60">
            <span className="text-[7px] font-bold font-mono">5G</span>
          </div>
        </div>
        {/* Screen Content */}
        <div className="flex-1 flex flex-col justify-between p-3 overflow-hidden">
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
      className="w-full bg-[#08090D] text-white py-16 sm:py-24 relative overflow-hidden border-t border-b border-white/[0.08]"
    >
      {/* Ambient Radial Lighting & Subtle Dot Grid */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-12 left-1/3 w-[650px] h-[550px] bg-[radial-gradient(circle,rgba(139,92,246,0.08)_0%,transparent_70%)] blur-3xl" />
        <div className="absolute bottom-16 right-1/4 w-[600px] h-[500px] bg-[radial-gradient(circle,rgba(16,185,129,0.08)_0%,transparent_70%)] blur-3xl" />
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
            <h2 className="font-manrope font-extrabold text-3xl sm:text-4xl lg:text-5xl text-white tracking-tight leading-[1.05]">
              How the sticker helps.
            </h2>
            <p className="mt-3 text-base sm:text-lg text-white/65 leading-relaxed">
              Stick it on something you do not want to lose. A finder can reach you when the phone is online, and can still place a direct call when it is not.
            </p>
          </div>

          {/* 3 Interactive Feature Showcase Cards */}
          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-stretch">
            
            {/* Card 1: Physical Belongings */}
            <article className="rounded-[32px] bg-gradient-to-b from-[#14151D] via-[#101117] to-[#0A0B0F] border border-white/10 p-6 sm:p-8 flex flex-col justify-between shadow-[0_20px_50px_rgba(0,0,0,0.6)] hover:shadow-[0_25px_60px_rgba(0,0,0,0.8)] hover:border-purple-400/40 transition-all duration-300 hover:-translate-y-1.5 group relative overflow-hidden">
              {/* Top Pill */}
              <div className="flex items-center justify-between mb-5">
                <span className="text-[10px] font-black tracking-wider uppercase px-3 py-1 rounded-full bg-purple-500/15 text-purple-300 border border-purple-500/30 shadow-sm flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-400 shadow-[0_0_4px_rgba(192,132,252,0.8)]" />
                  Physical Belongings
                </span>
                <span className="text-xs font-mono font-extrabold text-white/30">01</span>
              </div>

              {/* Graphic Mockup: Premium Device Surface with High-Res Mimi Sticker */}
              <div className="h-[240px] rounded-2xl bg-gradient-to-b from-[#24242C] via-[#1A1A22] to-[#121218] border border-white/10 flex flex-col items-center justify-center relative overflow-hidden p-4 shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)] group-hover:border-purple-300/50 transition-colors">
                {/* Subtle metallic sheen */}
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.04] to-transparent pointer-events-none" />
                <div className="absolute -top-10 -left-10 w-40 h-40 rounded-full bg-purple-500/15 blur-2xl pointer-events-none" />

                {/* Sticker on Laptop/Helmet Surface */}
                <div className="relative flex flex-col items-center">
                  <div className="relative">
                    <img 
                      src={MIMI_IMG} 
                      alt="Mimi Smart QR Sticker" 
                      className="w-28 sm:w-32 h-auto object-contain select-none drop-shadow-[0_16px_28px_rgba(0,0,0,0.5)] transition-transform duration-300 group-hover:scale-105"
                      draggable={false}
                    />
                    <div className="absolute -bottom-2 right-0 px-2 py-0.5 rounded-md bg-black/85 backdrop-blur-md text-[9px] font-mono font-bold text-white shadow-md flex items-center gap-1 border border-white/20">
                      <QrCode className="w-2.5 h-2.5 text-pink-400" />
                      <span>HIGH-DENSITY</span>
                    </div>
                  </div>
                </div>

                {/* Placement Pills Tag Bar */}
                <div className="mt-3.5 flex items-center gap-1.5 z-10">
                  <span className="px-2 py-0.5 rounded-md bg-white/10 text-white/80 text-[9px] font-bold backdrop-blur-sm">Laptop</span>
                  <span className="px-2 py-0.5 rounded-md bg-white/10 text-white/80 text-[9px] font-bold backdrop-blur-sm">Helmet</span>
                  <span className="px-2 py-0.5 rounded-md bg-white/10 text-white/80 text-[9px] font-bold backdrop-blur-sm">Bag</span>
                  <span className="px-2 py-0.5 rounded-md bg-white/10 text-white/80 text-[9px] font-bold backdrop-blur-sm">Car</span>
                </div>
              </div>

              {/* Text & Icon Details */}
              <div className="mt-6 flex flex-col">
                <div className="w-11 h-11 rounded-2xl bg-white/10 text-white flex items-center justify-center shadow-md mb-3.5 group-hover:bg-purple-600 transition-colors">
                  <Laptop className="w-5 h-5" aria-hidden="true" />
                </div>
                <h3 className="font-manrope font-extrabold text-xl text-white tracking-tight">
                  Easier to get an item home
                </h3>
                <p className="mt-2 text-sm text-white/65 leading-relaxed">
                  A laptop, bag, helmet, or vehicle carries a QR instead of a number written on the outside.
                </p>
              </div>
            </article>

            {/* Card 2: Online Mode (Verified Owner Profile) */}
            <article className="rounded-[32px] bg-gradient-to-b from-[#14151D] via-[#101117] to-[#0A0B0F] border border-white/10 p-6 sm:p-8 flex flex-col justify-between shadow-[0_20px_50px_rgba(0,0,0,0.6)] hover:shadow-[0_25px_60px_rgba(0,0,0,0.8)] hover:border-emerald-400/40 transition-all duration-300 hover:-translate-y-1.5 group relative overflow-hidden">
              {/* Top Pill */}
              <div className="flex items-center justify-between mb-5">
                <span className="text-[10px] font-black tracking-wider uppercase px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shadow-sm flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_4px_rgba(52,211,153,0.8)]" />
                  Online Portal
                </span>
                <span className="text-xs font-mono font-extrabold text-white/30">02</span>
              </div>

              {/* Phone Shell: Web Contact Card */}
              <div className="h-[240px] flex items-center justify-center">
                <PhoneShell>
                  {/* Web Profile Header */}
                  <div className="text-left">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-extrabold tracking-tight text-black flex items-center gap-1">
                        Tagtique
                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 fill-blue-500 text-white" />
                      </span>
                      <span className="text-[8px] font-extrabold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                        VERIFIED
                      </span>
                    </div>
                    <p className="text-[9px] font-medium text-black/50 mt-0.5">Contact the owner</p>
                  </div>

                  {/* Owner Action Buttons */}
                  <div className="flex flex-col gap-2 my-auto">
                    {/* Call Button */}
                    <div className="w-full py-2 px-3 rounded-xl bg-black text-white text-[11px] font-extrabold flex items-center justify-center gap-1.5 shadow-sm">
                      <Phone className="w-3 h-3" />
                      <span>Call Owner</span>
                    </div>
                    {/* WhatsApp Button */}
                    <div className="w-full py-2 px-3 rounded-xl bg-[#25D366] text-white text-[11px] font-extrabold flex items-center justify-center gap-1.5 shadow-sm">
                      <span>WhatsApp</span>
                    </div>
                  </div>

                  {/* Footer note */}
                  <div className="flex items-center justify-center gap-1 pt-1 border-t border-black/5">
                    <Lock className="w-2.5 h-2.5 text-black/40" />
                    <span className="text-[8px] text-center text-black/50 font-bold">
                      Privacy Masked Connection
                    </span>
                  </div>
                </PhoneShell>
              </div>

              {/* Text & Icon Details */}
              <div className="mt-6 flex flex-col">
                <div className="w-11 h-11 rounded-2xl bg-white/10 text-white flex items-center justify-center shadow-md mb-3.5 group-hover:bg-emerald-600 transition-colors">
                  <Wifi className="w-5 h-5" aria-hidden="true" />
                </div>
                <h3 className="font-manrope font-extrabold text-xl text-white tracking-tight">
                  Online
                </h3>
                <p className="mt-2 text-sm text-white/65 leading-relaxed">
                  The scan opens the sticker page. They can call or message you on WhatsApp.
                </p>
              </div>
            </article>

            {/* Card 3: Offline Mode (Direct Cell Network Dialer) */}
            <article className="rounded-[32px] bg-gradient-to-b from-[#14151D] via-[#101117] to-[#0A0B0F] border border-white/10 p-6 sm:p-8 flex flex-col justify-between shadow-[0_20px_50px_rgba(0,0,0,0.6)] hover:shadow-[0_25px_60px_rgba(0,0,0,0.8)] hover:border-amber-400/40 transition-all duration-300 hover:-translate-y-1.5 group relative overflow-hidden">
              {/* Top Pill */}
              <div className="flex items-center justify-between mb-5">
                <span className="text-[10px] font-black tracking-wider uppercase px-3 py-1 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 shadow-sm flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_4px_rgba(251,191,36,0.8)]" />
                  Zero Internet Required
                </span>
                <span className="text-xs font-mono font-extrabold text-white/30">03</span>
              </div>

              {/* Phone Shell: Native Dialer Screen (Steady, No Bouncing/Pinging) */}
              <div className="h-[240px] flex items-center justify-center">
                <PhoneShell>
                  <div className="flex-1 flex flex-col items-center justify-center text-center">
                    {/* Steady Call Avatar with Concentric Rings (No Pinging) */}
                    <div className="relative mb-2.5">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-amber-600 to-amber-500 text-white flex items-center justify-center shadow-md relative z-10">
                        <Phone className="w-5 h-5 text-white" />
                      </div>
                      <div className="absolute -inset-1.5 rounded-full border border-amber-500/30 pointer-events-none" />
                      <div className="absolute -inset-3 rounded-full border border-amber-500/15 pointer-events-none" />
                    </div>

                    <span className="text-[11px] font-extrabold text-black leading-tight">Tagtique Emergency</span>
                    <span className="text-[9px] text-black/50 font-mono mt-0.5">Calling primary phone...</span>
                    
                    <div className="mt-3 flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100/80 text-amber-900 text-[8px] font-extrabold border border-amber-200/60 shadow-sm">
                      <WifiOff className="w-2.5 h-2.5 text-amber-700" />
                      <span>Offline Dialer Mode</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-center gap-1 pt-1 border-t border-black/5">
                    <Radio className="w-2.5 h-2.5 text-amber-600" />
                    <span className="text-[8px] text-center text-black/50 font-bold">
                      Direct Cellular Voice Fallback
                    </span>
                  </div>
                </PhoneShell>
              </div>

              {/* Text & Icon Details */}
              <div className="mt-6 flex flex-col">
                <div className="w-11 h-11 rounded-2xl bg-white/10 text-white flex items-center justify-center shadow-md mb-3.5 group-hover:bg-amber-600 transition-colors">
                  <WifiOff className="w-5 h-5" aria-hidden="true" />
                </div>
                <h3 className="font-manrope font-extrabold text-xl text-white tracking-tight">
                  Offline
                </h3>
                <p className="mt-2 text-sm text-white/65 leading-relaxed">
                  No internet opens the phone dialer. The sticker does not track the item.
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
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.06] border border-white/10 text-white/80 text-xs font-semibold tracking-wide mb-3.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>Zero App Downloads • Browser Based</span>
              </div>
              <h3 className="font-manrope font-extrabold text-3xl sm:text-4xl text-white tracking-tight leading-[1.1]">
                After your sticker arrives.
              </h3>
              <p className="mt-3 text-base text-white/65 leading-relaxed">
                No app store downloads, accounts, or subscriptions. Just 4 simple steps to connect your phone number directly through your mobile browser.
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
                60-Second Setup
              </span>
            </div>
          </div>

          {/* 4 Connected Setup Cards */}
          <div className="relative">
            <ol className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch relative z-10">
              
              {/* Step 1: Connect Phone */}
              <li className="rounded-[26px] bg-[#12131A] border border-white/10 p-5 sm:p-6 flex flex-col justify-between shadow-xl hover:shadow-[0_20px_40px_rgba(0,0,0,0.8)] hover:border-white/25 transition-all duration-300 hover:-translate-y-1 group">
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

                  {/* Visual: Realistic Connectivity Card */}
                  <div className="h-[190px] rounded-2xl bg-gradient-to-b from-[#1E2028] via-[#15161D] to-[#0E0F14] border border-white/10 p-3.5 flex flex-col justify-between relative overflow-hidden shadow-inner group-hover:border-emerald-500/30 transition-colors mb-5">
                    {/* Real Phone Status Bar */}
                    <div className="flex items-center justify-between text-white/70 text-[9px] font-mono font-bold px-1">
                      <span>9:41</span>
                      <div className="flex items-center gap-1.5 text-emerald-400">
                        <Wifi className="w-3 h-3" />
                        <span className="text-[8px] font-sans font-extrabold text-white">5G</span>
                      </div>
                    </div>

                    {/* System Network Toast */}
                    <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-xl p-2.5 shadow-sm">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                          <Wifi className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[11px] font-extrabold text-white leading-tight">Internet Connected</p>
                          <p className="text-[9px] text-white/60">Wi-Fi & Cellular Online</p>
                        </div>
                      </div>
                    </div>

                    {/* Ready Handshake Banner */}
                    <div className="py-1.5 px-2.5 rounded-lg bg-black/40 border border-white/10 flex items-center justify-between">
                      <span className="text-[9px] font-medium text-white/75">Ready to link sticker</span>
                      <span className="text-[8px] font-extrabold text-emerald-400 bg-emerald-500/15 px-1.5 py-0.5 rounded">READY</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-manrope font-extrabold text-lg text-white tracking-tight">
                    {SETUP_STEPS[0].title}
                  </h4>
                  <p className="mt-2 text-xs sm:text-sm text-white/65 leading-relaxed">
                    {SETUP_STEPS[0].text}
                  </p>
                </div>
              </li>

              {/* Step 2: Native Camera Viewfinder */}
              <li className="rounded-[26px] bg-[#12131A] border border-white/10 p-5 sm:p-6 flex flex-col justify-between shadow-xl hover:shadow-[0_20px_40px_rgba(0,0,0,0.8)] hover:border-white/25 transition-all duration-300 hover:-translate-y-1 group">
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

                  {/* Visual: Authentic Native Camera Viewfinder */}
                  <div className="h-[190px] rounded-2xl bg-gradient-to-b from-[#181920] to-[#0D0E12] border border-white/10 p-3 flex flex-col justify-between relative overflow-hidden shadow-inner group-hover:border-amber-500/30 transition-colors mb-5">
                    {/* Camera Top HUD */}
                    <div className="flex items-center justify-between text-white/60 text-[9px] px-1 font-mono">
                      <span>PHOTO</span>
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

                    {/* Native Camera Pop-up Link (Recognizable iOS & Android UX) */}
                    <div className="w-full py-1.5 px-3 rounded-full bg-[#F59E0B] text-black text-[9px] font-extrabold flex items-center justify-between shadow-lg">
                      <div className="flex items-center gap-1.5 truncate">
                        <QrCode className="w-3 h-3 text-black shrink-0" />
                        <span className="truncate">tagtique.com/activate</span>
                      </div>
                      <ArrowRight className="w-3 h-3 text-black shrink-0" />
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-manrope font-extrabold text-lg text-white tracking-tight">
                    {SETUP_STEPS[1].title}
                  </h4>
                  <p className="mt-2 text-xs sm:text-sm text-white/65 leading-relaxed">
                    {SETUP_STEPS[1].text}
                  </p>
                </div>
              </li>

              {/* Step 3: Browser Form */}
              <li className="rounded-[26px] bg-[#12131A] border border-white/10 p-5 sm:p-6 flex flex-col justify-between shadow-xl hover:shadow-[0_20px_40px_rgba(0,0,0,0.8)] hover:border-white/25 transition-all duration-300 hover:-translate-y-1 group">
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

                  {/* Visual: Clean Mobile Browser Form */}
                  <div className="h-[190px] rounded-2xl bg-[#161722] border border-white/10 p-3 flex flex-col justify-between relative overflow-hidden shadow-inner group-hover:border-blue-400/30 transition-colors mb-5">
                    {/* Browser Address Bar */}
                    <div className="h-6 rounded-lg bg-black/40 border border-white/10 px-2 flex items-center justify-between shadow-xs">
                      <div className="flex items-center gap-1 min-w-0">
                        <Lock className="w-2.5 h-2.5 text-white/40 shrink-0" />
                        <span className="text-[8px] font-mono text-white/70 truncate">tagtique.com/setup</span>
                      </div>
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                    </div>

                    {/* Mobile Form Inputs */}
                    <div className="flex flex-col gap-1.5 my-auto">
                      <div className="bg-black/40 rounded-lg border border-white/10 px-2 py-1 shadow-xs">
                        <span className="text-[7px] uppercase font-bold text-white/40 block leading-tight">Phone Number</span>
                        <span className="text-[9px] font-extrabold text-white font-mono">+92 300 8472910</span>
                      </div>
                      <div className="bg-black/40 rounded-lg border border-white/10 px-2 py-1 shadow-xs flex items-center justify-between">
                        <div>
                          <span className="text-[7px] uppercase font-bold text-white/40 block leading-tight">WhatsApp Contact</span>
                          <span className="text-[8px] font-bold text-emerald-400">Active</span>
                        </div>
                        <div className="w-3.5 h-3.5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[8px] font-extrabold">✓</div>
                      </div>
                    </div>

                    {/* Submit Button */}
                    <div className="w-full py-1.5 rounded-lg bg-white text-black text-[9px] font-black text-center shadow-md">
                      Save & Activate Sticker
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-manrope font-extrabold text-lg text-white tracking-tight">
                    {SETUP_STEPS[2].title}
                  </h4>
                  <p className="mt-2 text-xs sm:text-sm text-white/65 leading-relaxed">
                    {SETUP_STEPS[2].text}
                  </p>
                </div>
              </li>

              {/* Step 4: Tag is Ready & Active */}
              <li className="rounded-[26px] bg-[#12131A] border border-white/10 p-5 sm:p-6 flex flex-col justify-between shadow-xl hover:shadow-[0_20px_40px_rgba(0,0,0,0.8)] hover:border-white/25 transition-all duration-300 hover:-translate-y-1 group">
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
                      <span className="text-emerald-400 font-extrabold">ONLINE</span>
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
                      <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.9)]" />
                        <span className="text-[9px] font-extrabold text-emerald-300">Protected & Live</span>
                      </div>
                      <span className="text-[8px] font-mono font-bold text-emerald-200/80">TG-849</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-manrope font-extrabold text-lg text-white tracking-tight">
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
                <h5 className="font-manrope font-extrabold text-sm text-white">Zero App Downloads</h5>
                <p className="text-xs text-white/60 mt-1 leading-relaxed">
                  Everything operates right inside your standard phone browser with zero app store installs.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-white/[0.06] text-white flex items-center justify-center shrink-0 border border-white/10">
                <ExternalLink className="w-4 h-4 text-white" />
              </div>
              <div>
                <h5 className="font-manrope font-extrabold text-sm text-white">Update Info Anytime</h5>
                <p className="text-xs text-white/60 mt-1 leading-relaxed">
                  Changed phone numbers or travel plans? Simply scan your sticker again to edit your info for free.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-white/[0.06] text-white flex items-center justify-center shrink-0 border border-white/10">
                <Shield className="w-4 h-4 text-white" />
              </div>
              <div>
                <h5 className="font-manrope font-extrabold text-sm text-white">Reliable Direct Contact</h5>
                <p className="text-xs text-white/60 mt-1 leading-relaxed">
                  Both online web profiles and offline cellular dialer fallbacks ensure finders reach you immediately.
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
