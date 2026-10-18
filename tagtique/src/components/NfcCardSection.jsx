import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { 
  NFC_DESIGNS, 
  NFC_CARD_PRICE_PKR 
} from '../data/nfcCards';
import { getPublicSiteOrigin } from '../utils/scanUrl';
import NfcCardArt from './NfcCardArt';
import {
  ChevronUp,
  ChevronDown,
  RotateCw,
  Sparkles,
  Smartphone,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  CreditCard,
  ExternalLink,
  Zap,
  Radio,
  Check
} from 'lucide-react';

export default function NfcCardSection() {
  const [activeIdx, setActiveIdx] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isInView, setIsInView] = useState(true);

  const dragStartY = useRef(0);
  const wheelCooldown = useRef(false);
  const previewUrl = `${getPublicSiteOrigin()}/profile/unassigned`;

  const totalCards = NFC_DESIGNS.length;
  const activeDesign = NFC_DESIGNS[activeIdx];

  // Pause auto-rotation when section is scrolled out of viewport
  useEffect(() => {
    const handleScroll = () => {
      const el = document.getElementById('nfc');
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const visible = rect.top < window.innerHeight && rect.bottom > 0;
      setIsInView(visible);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Step rotation: upward (-1) or downward (+1)
  const stepCard = useCallback((direction) => {
    setIsFlipped(false);
    setActiveIdx((prev) => {
      if (direction === 'down') {
        return (prev + 1) % totalCards;
      } else {
        return (prev - 1 + totalCards) % totalCards;
      }
    });
  }, [totalCards]);

  // Auto-rotation every 3.5 seconds
  useEffect(() => {
    if (isHovered || isDragging || !isInView) return;

    const timer = setInterval(() => {
      stepCard('down');
    }, 3500);

    return () => clearInterval(timer);
  }, [isHovered, isDragging, isInView, stepCard]);

  // Mouse wheel scroll navigation through cards
  const handleWheel = (e) => {
    // Prevent hyper-fast multiple scrolls
    if (wheelCooldown.current) return;
    
    // Only intercept when user is scrolling with reasonable intention over carousel
    if (Math.abs(e.deltaY) > 18) {
      wheelCooldown.current = true;
      if (e.deltaY > 0) {
        stepCard('down');
      } else {
        stepCard('up');
      }
      setTimeout(() => {
        wheelCooldown.current = false;
      }, 320);
    }
  };

  // Touch and pointer vertical drag handlers
  const handlePointerDown = (e) => {
    setIsDragging(true);
    dragStartY.current = e.clientY || (e.touches && e.touches[0].clientY) || 0;
  };

  const handlePointerUp = (e) => {
    if (!isDragging) return;
    setIsDragging(false);
    const endY = e.clientY || (e.changedTouches && e.changedTouches[0].clientY) || 0;
    const diff = dragStartY.current - endY;
    if (Math.abs(diff) > 35) {
      if (diff > 0) {
        stepCard('down');
      } else {
        stepCard('up');
      }
    }
  };

  return (
    <section 
      id="nfc" 
      className="bg-[#08090D] text-white py-8 sm:py-12 lg:py-14 relative overflow-hidden border-t border-b border-white/[0.08] select-none"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setIsDragging(false);
      }}
    >
      {/* Dynamic Ambient Holographic Aura matching active card's accent */}
      <div className="absolute inset-0 pointer-events-none transition-all duration-700">
        <div 
          className="absolute top-1/4 left-1/3 w-[550px] h-[450px] blur-[110px] opacity-20 transition-all duration-700"
          style={{ backgroundColor: activeDesign.accent }}
        />
        <div className="absolute bottom-6 right-1/4 w-[400px] h-[350px] bg-[radial-gradient(circle,rgba(255,255,255,0.03)_0%,transparent_70%)] blur-2xl" />
        
        {/* Subtle executive micro-grid texture */}
        <div 
          className="absolute inset-0 opacity-15"
          style={{
            backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.2) 1px, transparent 1px)',
            backgroundSize: '24px 24px',
            maskImage: 'radial-gradient(circle at 50% 40%, black 45%, transparent 85%)',
            WebkitMaskImage: 'radial-gradient(circle at 50% 40%, black 45%, transparent 85%)'
          }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-5 sm:mb-7">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/[0.06] border border-white/10 text-white/80 text-[11px] font-bold uppercase tracking-wider mb-2 backdrop-blur-md">
              <Radio 
                className="w-3 h-3 transition-colors duration-500" 
                style={{ color: activeDesign.accent }}
              />
              <span>Executive Hardware • NTAG216 Chipset</span>
            </div>
            <h2 className="font-manrope font-extrabold text-2xl sm:text-3xl lg:text-4xl text-white tracking-tight uppercase leading-[0.98]">
              NFC Metal Cards.
            </h2>
            <p className="mt-1.5 text-xs sm:text-sm text-white/60 leading-relaxed">
              Aerospace-grade digital business cards. Tap against any smartphone to instantly exchange contact info, portfolios, and emergency profiles without installing an app.
            </p>
          </div>

          {/* Quick Hardware Pill Badges */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/10 text-[11px] font-semibold text-white/80 flex items-center gap-1.5 backdrop-blur-sm">
              <Zap className="w-3 h-3 text-amber-400" />
              Never Needs Charging
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/10 text-[11px] font-semibold text-white/80 flex items-center gap-1.5 backdrop-blur-sm">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              100% Waterproof
            </span>
          </div>
        </div>

        {/* Main Interactive Stage: Left 3D Vertical Carousel + Right Live Interactive Phone Simulation */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-8 items-center">

          {/* ================= LEFT: 3D VERTICAL CAROUSEL (UPWARD TO DOWNWARD) ================= */}
          <div className="lg:col-span-7 flex flex-col items-center">
            
            {/* Carousel Control Bar & Scrubber */}
            <div className="w-full flex items-center justify-between mb-2 px-1">
              <div className="flex items-center gap-2 text-xs font-mono text-white/50">
                <span className="font-bold text-white text-sm">0{activeIdx + 1}</span>
                <span>/</span>
                <span>0{totalCards}</span>
                <span className="ml-2 text-white/40 hidden sm:inline">• Scroll or swipe vertically</span>
              </div>

              {/* Up & Down Stepper Buttons */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => stepCard('up')}
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/[0.08] hover:bg-white/[0.15] border border-white/15 text-white flex items-center justify-center transition-all cursor-pointer shadow-sm active:scale-95"
                  aria-label="Previous NFC Card"
                >
                  <ChevronUp className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => stepCard('down')}
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/[0.08] hover:bg-white/[0.15] border border-white/15 text-white flex items-center justify-center transition-all cursor-pointer shadow-sm active:scale-95"
                  aria-label="Next NFC Card"
                >
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* 3D Vertical Stage Container */}
            <div
              className="relative w-full max-w-[440px] h-[260px] sm:h-[290px] md:h-[310px] flex items-center justify-center cursor-grab active:cursor-grabbing"
              style={{ perspective: '1200px' }}
              onWheel={handleWheel}
              onPointerDown={handlePointerDown}
              onPointerUp={handlePointerUp}
            >
              {/* Vertical 3D Rolodex Stack */}
              {NFC_DESIGNS.map((design, idx) => {
                // Calculate cyclic vertical distance from activeIdx
                const rawOffset = (idx - activeIdx) % totalCards;
                let offset = rawOffset;
                if (offset > totalCards / 2) offset -= totalCards;
                if (offset < -totalCards / 2) offset += totalCards;

                const isCurrent = offset === 0;
                const isAdjacent = Math.abs(offset) === 1;
                const isSecondary = Math.abs(offset) === 2;
                const isVisible = Math.abs(offset) <= 2;

                if (!isVisible) return null;

                // 3D positioning along vertical cylinder
                const translateY = offset * (isAdjacent ? 65 : 125);
                const translateZ = isCurrent ? 35 : isAdjacent ? -55 : -130;
                const rotateX = offset * -20; // Tilted backwards above and below
                const scale = isCurrent ? 1.02 : isAdjacent ? 0.88 : 0.74;
                const opacity = isCurrent ? 1 : isAdjacent ? 0.55 : 0.22;
                const zIndex = isCurrent ? 30 : isAdjacent ? 20 : 10;
                const blur = isCurrent ? 0 : isAdjacent ? 1.2 : 2.5;

                return (
                  <div
                    key={design.id}
                    onClick={() => {
                      if (!isCurrent) {
                        setIsFlipped(false);
                        setActiveIdx(idx);
                      }
                    }}
                    className={`absolute w-[240px] sm:w-[290px] md:w-[330px] aspect-[856/540] will-change-transform ${
                      isDragging ? 'transition-none' : 'transition-all duration-700 ease-out'
                    }`}
                    style={{
                      transform: `translate3d(0, ${translateY}px, ${translateZ}px) scale(${scale}) rotateX(${rotateX}deg)`,
                      zIndex,
                      opacity,
                      filter: `blur(${blur}px)`,
                      transformStyle: 'preserve-3d',
                      cursor: isCurrent ? 'pointer' : 'pointer'
                    }}
                  >
                    {/* The 3D Flippable Card Frame */}
                    <div 
                      className="relative w-full h-full transition-transform duration-700 ease-out"
                      style={{
                        transform: isCurrent && isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                        transformStyle: 'preserve-3d'
                      }}
                    >
                      {/* FRONT OF CARD */}
                      <div 
                        className="absolute inset-0 rounded-[18px] overflow-hidden shadow-[0_15px_35px_rgba(0,0,0,0.8)] border border-white/20 backface-hidden"
                        style={{ backfaceVisibility: 'hidden' }}
                      >
                        <NfcCardArt design={design} side="front" />

                        {/* Metallic Edge Sheen Highlight */}
                        <div className="absolute inset-0 pointer-events-none rounded-[18px] bg-gradient-to-tr from-transparent via-white/10 to-transparent opacity-60" />

                        {/* Interactive Tap Radar Marker when active */}
                        {isCurrent && (
                          <div 
                            className="absolute top-3 right-3 px-2 py-0.5 rounded-full text-[8px] font-mono font-bold tracking-wider flex items-center gap-1 shadow-lg border"
                            style={{
                              backgroundColor: `${design.accent}25`,
                              borderColor: `${design.accent}60`,
                              color: design.accent
                            }}
                          >
                            <span 
                              className="w-1.5 h-1.5 rounded-full animate-ping" 
                              style={{ backgroundColor: design.accent }} 
                            />
                            <span>TAP READY</span>
                          </div>
                        )}
                      </div>

                      {/* BACK OF CARD (QR Fallback & Laser Serial) */}
                      <div 
                        className="absolute inset-0 rounded-[18px] overflow-hidden shadow-[0_15px_35px_rgba(0,0,0,0.8)] border border-white/20 backface-hidden"
                        style={{ 
                          backfaceVisibility: 'hidden',
                          transform: 'rotateY(180deg)'
                        }}
                      >
                        <NfcCardArt 
                          design={design} 
                          side="back" 
                          qrValue={previewUrl} 
                          serial={`TG-NFC-${(idx + 1).toString().padStart(4, '0')}`} 
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Interactive Flip & Selection Ribbon */}
            <div className="mt-3 sm:mt-4 flex flex-wrap items-center justify-center gap-2.5 relative z-20">
              <button
                type="button"
                onClick={() => setIsFlipped((prev) => !prev)}
                className="px-3 py-1.5 rounded-full bg-white/[0.08] hover:bg-white/[0.15] border border-white/20 text-[11px] font-bold text-white flex items-center gap-1.5 transition-all cursor-pointer shadow-sm hover:scale-105 active:scale-95"
              >
                <RotateCw className="w-3 h-3" />
                <span>{isFlipped ? 'Show Front' : 'Flip to Back (QR)'}</span>
              </button>

              {/* 6 Design Selector Mini Chips */}
              <div className="flex items-center gap-1 bg-black/50 p-1 rounded-full border border-white/10 backdrop-blur-md">
                {NFC_DESIGNS.map((d, i) => (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => {
                      setIsFlipped(false);
                      setActiveIdx(i);
                    }}
                    className={`w-5 h-5 rounded-full transition-all cursor-pointer flex items-center justify-center text-[9px] font-bold ${
                      i === activeIdx
                        ? 'ring-2 ring-white scale-110 shadow-sm font-extrabold'
                        : 'opacity-50 hover:opacity-100'
                    }`}
                    style={{ backgroundColor: d.accent }}
                    title={d.name}
                  >
                    {i === activeIdx ? '✓' : ''}
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* ================= RIGHT: INTERACTIVE PHONE SIMULATOR & SPECS ================= */}
          <div className="lg:col-span-5 flex flex-col justify-between">
            <div className="rounded-[24px] bg-gradient-to-b from-[#181822] via-[#121218] to-[#0A0A0F] border border-white/[0.15] p-4 sm:p-5 lg:p-6 shadow-[inset_0_1px_1px_rgba(255,255,255,0.18),0_20px_50px_rgba(0,0,0,0.8)] relative overflow-hidden backdrop-blur-xl">
              
              {/* Dynamic Aura behind pod */}
              <div 
                className="absolute -top-16 -right-16 w-44 h-44 rounded-full blur-3xl opacity-25 transition-colors duration-500 pointer-events-none"
                style={{ backgroundColor: activeDesign.accent }}
              />

              {/* Card Meta Header */}
              <div className="relative z-10 flex items-start justify-between gap-3 mb-3">
                <div>
                  <span 
                    className="text-[10px] font-mono font-bold tracking-wider uppercase block"
                    style={{ color: activeDesign.accent }}
                  >
                    EXECUTIVE SERIES 0{activeIdx + 1}
                  </span>
                  <h3 className="font-manrope font-extrabold text-xl sm:text-2xl text-white tracking-tight mt-0.5">
                    {activeDesign.name}
                  </h3>
                  <p className="text-xs text-white/60 mt-0.5 line-clamp-1">
                    {activeDesign.line}
                  </p>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-[9px] font-mono text-white/40 uppercase block">Price</span>
                  <span className="font-manrope font-extrabold text-lg sm:text-xl text-white">
                    PKR {NFC_CARD_PRICE_PKR}
                  </span>
                </div>
              </div>

              {/* Interactive Phone Simulation Viewport */}
              <div className="relative z-10 my-2.5 rounded-xl bg-black/60 border border-white/10 p-2.5 sm:p-3 shadow-inner">
                <div className="flex items-center justify-between text-[10px] font-mono text-white/50 mb-2 pb-1.5 border-b border-white/10">
                  <span className="flex items-center gap-1.5 text-white/80">
                    <Smartphone className="w-3 h-3" />
                    Live Tap Preview
                  </span>
                  <span className="text-emerald-400 font-bold flex items-center gap-1 text-[9px]">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    NFC Connected
                  </span>
                </div>

                {/* Simulated Incoming Contact Card Notification */}
                <div className="rounded-lg bg-white/10 backdrop-blur-md border border-white/15 p-2 flex items-center gap-2.5 shadow-sm transition-all">
                  <div 
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-black font-extrabold text-xs shrink-0 shadow-sm"
                    style={{ backgroundColor: activeDesign.accent }}
                  >
                    {activeDesign.name.substring(0, 2).toUpperCase()}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1">
                      <p className="text-xs font-extrabold text-white truncate">Alex Miller</p>
                      <CheckCircle2 className="w-3 h-3 text-blue-400 fill-blue-400 text-black shrink-0" />
                    </div>
                    <p className="text-[10px] text-white/60 truncate">Product Designer • Tagtique</p>
                  </div>

                  <a
                    href={previewUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-2 py-0.5 rounded-md bg-white text-black font-extrabold text-[10px] shrink-0 hover:bg-white/90 transition-colors"
                  >
                    View
                  </a>
                </div>

                {/* Quick 1-tap Actions Preview */}
                <div className="mt-2 grid grid-cols-2 gap-1.5 text-center text-[9px] font-bold">
                  <div className="py-1 rounded-md bg-white/[0.06] border border-white/10 text-white/80">
                    📞 1-Tap Save VCF
                  </div>
                  <div className="py-1 rounded-md bg-white/[0.06] border border-white/10 text-white/80">
                    💬 WhatsApp Chat
                  </div>
                </div>
              </div>

              {/* Hardware Spec List */}
              <div className="relative z-10 my-2.5 space-y-1 text-[11px] text-white/70">
                <div className="flex items-center justify-between py-0.5 border-b border-white/[0.06]">
                  <span className="text-white/40">Chipset</span>
                  <span className="font-mono font-bold text-white">NXP NTAG216 (888 Bytes)</span>
                </div>
                <div className="flex items-center justify-between py-0.5 border-b border-white/[0.06]">
                  <span className="text-white/40">OS Compatibility</span>
                  <span className="font-bold text-white">Apple iOS & Google Android</span>
                </div>
                <div className="flex items-center justify-between py-0.5">
                  <span className="text-white/40">Profile Dashboard</span>
                  <span className="font-bold text-emerald-400">Included Free (No Subs)</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="relative z-10 mt-3.5 flex flex-col sm:flex-row gap-2">
                <Link
                  to={`/nfc-card/${activeDesign.id}`}
                  className="flex-1 py-2.5 px-4 rounded-full text-black font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-md transition-all duration-300 hover:scale-102 active:scale-95 group/btn"
                  style={{
                    backgroundColor: activeDesign.accent,
                    boxShadow: `0 8px 20px ${activeDesign.accent}40`
                  }}
                >
                  <span>Order {activeDesign.name}</span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover/btn:translate-x-0.5" />
                </Link>

                <Link
                  to="/catalog?filter=nfc"
                  className="py-2.5 px-4 rounded-full bg-white/[0.08] hover:bg-white/[0.15] border border-white/15 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 transition-all text-center"
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>All 6 Cards</span>
                </Link>
              </div>

            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
