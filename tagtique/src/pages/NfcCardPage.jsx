import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { findNfcDesign, NFC_DESIGNS, NFC_CARD_PRICE_PKR } from '../data/nfcCards';
import { getPublicSiteOrigin } from '../utils/scanUrl';
import NfcCardArt from '../components/NfcCardArt';
import {
  ArrowRight,
  Sparkles,
  CreditCard,
  ShieldCheck,
  Zap,
  Radio,
  CheckCircle2,
  RotateCw,
  Smartphone,
  Wifi,
  ExternalLink,
  Layers,
  Lock,
  QrCode,
  Share2,
  Check,
  X
} from 'lucide-react';

const USES = [
  {
    title: 'Content Creators & Artists',
    icon: Share2,
    tag: 'Social Growth',
    text: 'Share your Instagram, TikTok, YouTube channel, and streaming links with one quick tap.'
  },
  {
    title: 'Executives & Founders',
    icon: CreditCard,
    tag: 'Networking',
    text: 'Exchange your LinkedIn, direct contact card (vCard), portfolio, and company profile effortlessly.'
  },
  {
    title: 'Retail & Brands',
    icon: Sparkles,
    tag: 'Business',
    text: 'Direct clients to your digital menu, Google review page, online storefront, or customer care WhatsApp.'
  },
  {
    title: 'Conferences & Events',
    icon: Zap,
    tag: 'Speed',
    text: 'Never run out of paper business cards. Tap a new colleague’s phone and let them save your contact in 2 seconds.'
  }
];

const HARDWARE_SPECS = [
  { label: 'Chipset', val: 'NXP NTAG216 Silicon' },
  { label: 'Operating Frequency', val: '13.56 MHz (High Frequency)' },
  { label: 'Memory Capacity', val: '888 Bytes Rewritable EEPROM' },
  { label: 'Standard Dimensions', val: 'CR80 ISO 7810 (85.6 × 53.98 mm)' },
  { label: 'Power Source', val: 'Passive Induction (Zero Battery)' },
  { label: 'Water & Weather Rating', val: 'IP68 Sealed Waterproof' },
  { label: 'Compatibility', val: 'iOS (iPhone XS+) & Android' },
  { label: 'Dual Fallback', val: 'Laser-Etched QR Code on Back' }
];

export default function NfcCardPage() {
  const { designId } = useParams();
  const design = findNfcDesign(designId);
  const [side, setSide] = useState('front');
  const [showSimulator, setShowSimulator] = useState(false);
  const [simStep, setSimStep] = useState('idle'); // 'idle' | 'tapping' | 'success'
  
  // Independent flip state for cards in the "Other Cards" section
  const [otherCardSides, setOtherCardSides] = useState({});

  const previewUrl = `${getPublicSiteOrigin()}/profile/unassigned`;

  if (!design) {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center">
        <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 mx-auto flex items-center justify-center mb-4">
          <CreditCard className="w-8 h-8" />
        </div>
        <h1 className="font-manrope font-extrabold text-3xl text-white">Card Not Found</h1>
        <p className="mt-2 text-white/60 text-sm">
          The requested NFC card design is not part of the active executive lineup.
        </p>
        <Link
          to="/#nfc"
          className="inline-flex items-center gap-2 mt-6 bg-white hover:bg-zinc-200 text-black rounded-full px-6 py-3 text-sm font-bold shadow-md transition-all cursor-pointer"
        >
          <span>Back to NFC Cards</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  const toggleOtherCardSide = (id) => {
    setOtherCardSides((prev) => ({
      ...prev,
      [id]: prev[id] === 'back' ? 'front' : 'back'
    }));
  };

  const runSimulation = () => {
    setShowSimulator(true);
    setSimStep('idle');
    setTimeout(() => {
      setSimStep('tapping');
      setTimeout(() => {
        setSimStep('success');
      }, 1200);
    }, 400);
  };

  return (
    <article className="bg-[#08090D] text-white pb-24 min-h-screen selection:bg-amber-400 selection:text-black">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6">
        
        {/* ================= BREADCRUMBS ================= */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs font-semibold text-white/50 mb-6">
          <Link to="/" className="hover:text-white transition-colors">Home</Link>
          <span>/</span>
          <Link to="/#nfc" className="hover:text-white transition-colors">NFC Smart Cards</Link>
          <span>/</span>
          <Link to="/catalog?filter=nfc" className="hover:text-white transition-colors">Executive Collection</Link>
          <span>/</span>
          <span className="text-white font-bold">{design.name}</span>
        </nav>

        {/* ================= HERO SHOWCASE GRID ================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT: 3D CARD DISPLAY & INTERACTIVE CONTROLS */}
          <div className="lg:col-span-6 flex flex-col">
            <div className="bg-[#12131A] rounded-[32px] p-6 sm:p-8 border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.6)] relative overflow-hidden group">
              
              {/* Top Bar inside Showcase */}
              <div className="flex items-center justify-between mb-4">
                <span 
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono font-extrabold uppercase tracking-wider"
                  style={{
                    backgroundColor: `${design.accent}25`,
                    color: design.accent === '#1A1A1A' ? '#FFFFFF' : design.accent
                  }}
                >
                  <Radio className="w-3.5 h-3.5" />
                  <span>NTAG216 Silicon</span>
                </span>

                <span className="text-xs font-mono font-bold text-white/50 uppercase tracking-wider">
                  Side: <strong className="text-white">{side.toUpperCase()}</strong>
                </span>
              </div>

              {/* 3D Card Stage */}
              <div className="relative w-full aspect-[856/540] my-2 transition-transform duration-500 group-hover:scale-[1.01]">
                <NfcCardArt design={design} side={side} qrValue={previewUrl} serial="TAG-PREVIEW" />
                
                {/* Metallic Sheen Overlay */}
                <div className="absolute inset-0 pointer-events-none rounded-[18px] bg-gradient-to-tr from-transparent via-white/10 to-transparent opacity-70" />
              </div>

              {/* View Controls: Front, Back, and Tap Simulation */}
              <div className="mt-6 flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-white/10">
                <div className="inline-flex p-1 rounded-full bg-white/5 border border-white/10">
                  <button
                    type="button"
                    onClick={() => setSide('front')}
                    className={`rounded-full px-5 py-2 text-xs font-extrabold transition-all cursor-pointer ${
                      side === 'front' ? 'bg-white text-black shadow-sm' : 'text-white/60 hover:text-white'
                    }`}
                  >
                    Front View
                  </button>
                  <button
                    type="button"
                    onClick={() => setSide('back')}
                    className={`rounded-full px-5 py-2 text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 ${
                      side === 'back' ? 'bg-white text-black shadow-sm' : 'text-white/60 hover:text-white'
                    }`}
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    <span>Back (QR Code)</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={runSimulation}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 text-xs font-extrabold transition-all cursor-pointer shadow-xs"
                >
                  <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Simulate Phone Tap</span>
                </button>
              </div>

              {/* Clarification footer note */}
              <p className="mt-4 text-[11px] text-white/50 leading-relaxed">
                * The back QR code is dynamically linked to your cloud profile. If a phone has NFC disabled, the camera instantly scans the printed code without any extra app.
              </p>
            </div>

            {/* Quick 4-Pillar Spec Banner */}
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {[
                { title: 'Zero Battery', desc: 'Induction powered' },
                { title: 'Universal Tap', desc: 'iOS & Android' },
                { title: 'IP68 Sealed', desc: '100% waterproof' },
                { title: 'No Subscription', desc: 'Lifetime free profile' }
              ].map((p, i) => (
                <div key={i} className="bg-[#12131A] rounded-2xl p-3 border border-white/10 text-center">
                  <p className="text-xs font-extrabold text-white">{p.title}</p>
                  <p className="text-[10px] text-white/50 mt-0.5">{p.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT: PRODUCT DETAILS & BUY / SETUP ACTIONS */}
          <div className="lg:col-span-6 bg-[#12131A] rounded-[32px] border border-white/10 p-6 sm:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.6)] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-[11px] font-extrabold uppercase tracking-widest text-white/50">
                  EXECUTIVE HARDWARE • LIMITED RUN
                </span>
                <span className="inline-flex items-center gap-1.5 text-xs font-extrabold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>In Stock</span>
                </span>
              </div>

              <h1 className="font-manrope font-extrabold text-3xl sm:text-4xl tracking-tight mt-2 text-white">
                {design.name}
              </h1>

              <div className="mt-4 flex items-baseline gap-3">
                <span className="font-manrope font-extrabold text-3xl text-white">
                  PKR {NFC_CARD_PRICE_PKR.toLocaleString('en-PK')}
                </span>
                <span className="text-xs font-bold text-white/40 line-through">
                  PKR 1,499
                </span>
                <span className="text-xs font-extrabold text-emerald-300 bg-emerald-500/20 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                  Free 24h Delivery
                </span>
              </div>

              <p className="mt-4 text-sm text-white/70 leading-relaxed font-normal">
                {design.line} Precision-crafted with embedded high-frequency NTAG216 silicon. A single tap instantly transfers your digital card, socials, contact info, and portfolio directly to any phone.
              </p>

              {/* Hardware Value Highlights */}
              <div className="mt-6 space-y-2.5 bg-white/[0.03] p-4 rounded-2xl border border-white/10">
                {[
                  'Tap with NFC or scan fallback QR — instant contact without downloading apps.',
                  'Update your phone number, Instagram, WhatsApp, or links anytime for free.',
                  'Durable acrylic core with scratch-resistant matte laminate.',
                  'Nationwide Cash on Delivery (COD) & Bank Transfer available.'
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs text-white/80">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* CTAs */}
            <div className="mt-8 pt-6 border-t border-white/10">
              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  to={`/order?nfc=${design.id}`}
                  className="flex-1 bg-white hover:bg-zinc-200 text-black rounded-full py-3.5 px-6 text-sm font-extrabold flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all cursor-pointer"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Order Now • PKR {NFC_CARD_PRICE_PKR}</span>
                </Link>

                <Link
                  to={`/nfc-card/${design.id}/setup`}
                  className="inline-flex bg-white/10 hover:bg-white/15 border border-white/15 text-white rounded-full py-3.5 px-6 text-sm font-extrabold items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>Preview & Setup Profile</span>
                </Link>
              </div>

              <div className="mt-4 flex items-center justify-center gap-6 text-[11px] text-white/50 font-medium">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-white/70" />
                  1-Year Chip Warranty
                </span>
                <span className="flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-white/70" />
                  Dispatches in 24 Hours
                </span>
                <span className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-white/70" />
                  Zero Monthly Fees
                </span>
              </div>
            </div>

          </div>
        </div>

        {/* ================= TECHNICAL HARDWARE SPECIFICATIONS ================= */}
        <section className="mt-16 sm:mt-20">
          <div className="bg-[#12131A] rounded-[32px] border border-white/10 p-6 sm:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.6)]">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
              <div>
                <span className="text-xs font-extrabold uppercase tracking-widest text-white/50">
                  Industrial Engineering
                </span>
                <h2 className="font-manrope font-extrabold text-2xl sm:text-3xl text-white tracking-tight mt-1">
                  Technical Hardware Specifications
                </h2>
              </div>
              <p className="text-xs font-semibold text-white/50">
                Manufactured to international ISO/IEC 14443 Type A NFC standards.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {HARDWARE_SPECS.map((spec, i) => (
                <div key={i} className="p-4 rounded-2xl bg-white/[0.03] border border-white/10">
                  <p className="text-[11px] font-mono font-bold uppercase tracking-wider text-white/50">
                    {spec.label}
                  </p>
                  <p className="font-manrope font-extrabold text-sm text-white mt-1">
                    {spec.val}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ================= HOW IT WORKS (3 STEPS) ================= */}
        <section className="mt-16 sm:mt-20">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-extrabold uppercase tracking-widest text-white/50">Seamless Frictionless Setup</span>
            <h2 className="font-manrope font-extrabold text-3xl sm:text-4xl text-white tracking-tight mt-1">
              How Tagtique NFC Works
            </h2>
            <p className="mt-2 text-sm text-white/60">
              Zero apps required for both you and anyone who taps your card.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              {
                step: '01',
                title: 'Set Up Your Profile',
                text: 'Choose which social profiles, WhatsApp contact, phone number, and links you want visible on your live digital card.'
              },
              {
                step: '02',
                title: 'Tap Any Smartphone',
                text: 'Simply tap your card against the upper back of an iPhone or the center back of an Android device.'
              },
              {
                step: '03',
                title: 'Instant Connection',
                text: 'Your digital profile opens instantly on their screen with 1-tap buttons to save your contact card or open socials.'
              }
            ].map((item) => (
              <div key={item.step} className="bg-[#12131A] rounded-[28px] p-6 sm:p-8 border border-white/10 shadow-sm relative overflow-hidden group hover:border-white/20 transition-all">
                <span className="font-mono text-xs font-extrabold text-white/60 px-3 py-1 rounded-full bg-white/10">
                  STEP {item.step}
                </span>
                <h3 className="font-manrope font-extrabold text-xl text-white mt-4">
                  {item.title}
                </h3>
                <p className="mt-2 text-xs sm:text-sm text-white/70 leading-relaxed">
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ================= USE CASES / AUDIENCES ================= */}
        <section className="mt-16 sm:mt-20">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-extrabold uppercase tracking-widest text-white/50">Versatile Utility</span>
            <h2 className="font-manrope font-extrabold text-3xl sm:text-4xl text-white tracking-tight mt-1">
              Engineered for Every Discipline
            </h2>
            <p className="mt-2 text-sm text-white/60">
              One smart card replaces thousands of outdated paper cards.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {USES.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="bg-[#12131A] rounded-[26px] p-6 border border-white/10 shadow-sm hover:border-white/25 hover:shadow-xl transition-all">
                  <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-white mb-4">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-white/60 bg-white/10 px-2 py-0.5 rounded-md">
                    {item.tag}
                  </span>
                  <h3 className="font-manrope font-extrabold text-base text-white mt-2">
                    {item.title}
                  </h3>
                  <p className="mt-1.5 text-xs text-white/70 leading-relaxed">
                    {item.text}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* ========================================================================= */}
        {/* ================= OTHER EXECUTIVE CARDS SECTION ========================= */}
        {/* ========================================================================= */}
        <section className="mt-20 sm:mt-24 pt-14 border-t border-white/10">
          
          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-10">
            <div>
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 text-white/80 text-xs font-mono font-bold uppercase tracking-wider mb-2.5">
                <Radio className="w-3.5 h-3.5 text-amber-400" />
                <span>Executive Hardware • 6 Bespoke Finishes</span>
              </div>
              <h2 className="font-manrope font-extrabold text-3xl sm:text-4xl text-white tracking-tight">
                Other Executive Cards
              </h2>
              <p className="mt-2 text-sm text-white/60 max-w-2xl leading-relaxed">
                Discover our full spectrum of laser-etched and papercraft NFC smart cards. Each card is embedded with genuine NTAG216 high-frequency silicon.
              </p>
            </div>

            <Link
              to="/catalog?filter=nfc"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white hover:bg-zinc-200 text-black text-xs font-extrabold tracking-wide shadow-sm hover:shadow-md transition-all self-start sm:self-auto shrink-0"
            >
              <span>Explore All 50 in Catalog</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Cards Grid: 3 columns on desktop, 2 on tablet, 1 on mobile */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {NFC_DESIGNS.filter((item) => item.id !== design.id).map((item) => {
              const currentSide = otherCardSides[item.id] || 'front';
              const isFlipped = currentSide === 'back';

              return (
                <div 
                  key={item.id} 
                  className="rounded-[30px] bg-[#12131A] border border-white/10 p-5 flex flex-col justify-between shadow-[0_8px_30px_rgba(0,0,0,0.4)] hover:shadow-[0_24px_50px_rgba(0,0,0,0.8)] hover:border-white/25 transition-all duration-300 group relative overflow-hidden"
                >
                  <div>
                    {/* Top Header: Badge, Price & Quick Flip Button */}
                    <div className="flex items-center justify-between mb-3.5">
                      <span 
                        className="text-[10px] font-mono font-bold uppercase tracking-wider px-3 py-1 rounded-full"
                        style={{
                          backgroundColor: `${item.accent}25`,
                          color: item.accent === '#1A1A1A' ? '#FFFFFF' : item.accent
                        }}
                      >
                        {item.name}
                      </span>

                      <div className="flex items-center gap-2">
                        <span className="font-manrope text-xs font-extrabold text-white/80">
                          PKR {NFC_CARD_PRICE_PKR}
                        </span>

                        {/* Interactive Flip Toggle Button */}
                        <button
                          type="button"
                          onClick={() => toggleOtherCardSide(item.id)}
                          className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/70 hover:text-white transition-colors cursor-pointer"
                          title={`Flip to view ${isFlipped ? 'front' : 'back QR'}`}
                          aria-label={`Flip ${item.name} card`}
                        >
                          <RotateCw className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Card Artwork Showcase with Specular Sheen */}
                    <div 
                      className="w-full aspect-[856/540] rounded-[20px] overflow-hidden shadow-md group-hover:shadow-2xl transition-all duration-300 group-hover:scale-[1.015] relative cursor-pointer"
                      style={{
                        boxShadow: `0 10px 25px ${item.accent}25`
                      }}
                      onClick={() => toggleOtherCardSide(item.id)}
                    >
                      <NfcCardArt 
                        design={item} 
                        side={currentSide} 
                        qrValue={previewUrl} 
                        serial={`TAG-${item.id.slice(0, 4).toUpperCase()}`} 
                      />

                      {/* Realistic Specular Glare Overlay */}
                      <div className="absolute inset-0 pointer-events-none rounded-[20px] bg-gradient-to-tr from-transparent via-white/12 to-transparent opacity-75 group-hover:opacity-100 transition-opacity" />

                      {/* Interactive Flip indicator pill */}
                      <div className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-white text-[9px] font-mono font-bold flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <RotateCw className="w-2.5 h-2.5" />
                        <span>Tap to flip</span>
                      </div>
                    </div>
                  </div>

                  {/* Card Details & Action Buttons */}
                  <div className="mt-5 flex flex-col">
                    <div className="flex items-center justify-between">
                      <h3 className="font-manrope font-extrabold text-base text-white group-hover:text-amber-400 transition-colors">
                        {item.name}
                      </h3>
                      <span className="text-[10px] font-extrabold text-emerald-400 flex items-center gap-1 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        In Stock
                      </span>
                    </div>

                    <p className="mt-1.5 text-xs text-white/60 line-clamp-1 leading-relaxed">
                      {item.line}
                    </p>

                    {/* Action Buttons Row */}
                    <div className="mt-4 grid grid-cols-2 gap-2">
                      <Link
                        to={`/nfc-card/${item.id}`}
                        className="py-2.5 px-3 rounded-xl bg-white hover:bg-zinc-200 text-black font-extrabold text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs"
                      >
                        <span>Inspect</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>

                      <Link
                        to={`/order?nfc=${item.id}`}
                        className="py-2.5 px-3 rounded-xl bg-white/10 hover:bg-white/15 text-white border border-white/15 font-extrabold text-xs flex items-center justify-center gap-1 transition-all"
                      >
                        <span>Buy Now</span>
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Luxury Bottom Guarantee Banner */}
          <div className="mt-14 bg-[#12131A] rounded-[28px] border border-white/10 p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white/10 text-white flex items-center justify-center shrink-0">
                <ShieldCheck className="w-6 h-6 text-amber-400" />
              </div>
              <div>
                <h4 className="font-manrope font-extrabold text-lg text-white">
                  Executive Hardware Guarantee
                </h4>
                <p className="text-xs sm:text-sm text-white/60 mt-0.5">
                  1-Year Chip Warranty • Free 24h Express Dispatch • Cash on Delivery Nationwide
                </p>
              </div>
            </div>

            <Link
              to="/catalog"
              className="px-6 py-3 rounded-full bg-white hover:bg-zinc-200 text-black text-xs font-extrabold tracking-wider uppercase transition-all shadow-md shrink-0 flex items-center gap-2"
            >
              <span>View Full 50-Item Catalog</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

        </section>

      </div>

      {/* ================= INTERACTIVE PHONE TAP SIMULATION MODAL ================= */}
      {showSimulator && (
        <div 
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setShowSimulator(false)}
        >
          <div 
            className="bg-[#12141A] text-white rounded-[36px] max-w-md w-full p-6 sm:p-8 border border-white/10 shadow-2xl relative flex flex-col items-center text-center overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setShowSimulator(false)}
              className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/70 hover:text-white transition-all cursor-pointer"
              aria-label="Close simulator"
            >
              <X className="w-4 h-4" />
            </button>

            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-emerald-400 mb-1">
              Virtual NFC Induction Field
            </span>
            <h3 className="font-manrope font-extrabold text-2xl text-white">
              Phone Tap Demonstration
            </h3>
            <p className="text-xs text-white/60 mt-1 max-w-xs">
              Simulating an NFC handshake between a smartphone and your {design.name} smart card.
            </p>

            {/* Simulated Smartphone */}
            <div className="my-8 relative w-56 aspect-[9/16] bg-black rounded-[36px] p-2.5 border-4 border-white/20 shadow-2xl flex flex-col items-center justify-between overflow-hidden">
              {/* Phone Speaker Notch */}
              <div className="w-20 h-4 bg-zinc-800 rounded-full mx-auto" />

              {/* Notification Banner when tapped */}
              <div className="w-full flex-1 flex flex-col items-center justify-center px-2">
                {simStep === 'idle' && (
                  <p className="text-xs text-zinc-400 font-mono animate-pulse">Approaching NFC Card...</p>
                )}
                {simStep === 'tapping' && (
                  <div className="flex flex-col items-center gap-2">
                    <Wifi className="w-8 h-8 text-cyan-400 animate-ping" />
                    <p className="text-xs text-cyan-300 font-bold">Reading NTAG216 Chip...</p>
                  </div>
                )}
                {simStep === 'success' && (
                  <div className="w-full bg-zinc-900/90 border border-white/20 rounded-2xl p-3 shadow-xl text-left animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="flex items-center gap-2 mb-1.5">
                      <div className="w-5 h-5 rounded-md bg-white text-black flex items-center justify-center text-[10px] font-extrabold">
                        T
                      </div>
                      <span className="text-[10px] font-mono text-zinc-400">TAGTIQUE NFC</span>
                    </div>
                    <p className="text-xs font-bold text-white leading-tight">
                      Open &quot;tagtique.com/profile&quot;
                    </p>
                    <p className="text-[10px] text-zinc-400 mt-0.5">
                      Tap to view contact card & socials
                    </p>
                  </div>
                )}
              </div>

              {/* Simulated Home Bar */}
              <div className="w-24 h-1 bg-white/40 rounded-full mb-1" />
            </div>

            <button
              type="button"
              onClick={runSimulation}
              className="px-6 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-extrabold flex items-center gap-2 transition-all cursor-pointer"
            >
              <RotateCw className="w-3.5 h-3.5" />
              <span>Tap Again</span>
            </button>
          </div>
        </div>
      )}

    </article>
  );
}
