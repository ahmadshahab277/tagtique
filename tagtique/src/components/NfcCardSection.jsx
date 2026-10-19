import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  NFC_DESIGNS, 
  NFC_CATEGORIES,
  NFC_CARD_PRICE_PKR 
} from '../data/nfcCards';
import { getPublicSiteOrigin } from '../utils/scanUrl';
import NfcCardArt from './NfcCardArt';
import {
  ChevronUp,
  ChevronDown,
  RotateCw,
  ArrowRight,
  CreditCard,
  ExternalLink,
  Radio,
  Check,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

export default function NfcCardSection() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [activeIdx, setActiveIdx] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isInView, setIsInView] = useState(true);

  const dragStartY = useRef(0);
  const wheelCooldown = useRef(false);
  const scrollStripRef = useRef(null);
  const previewUrl = `${getPublicSiteOrigin()}/profile/unassigned`;

  // Filtered designs based on selected category
  const filteredDesigns = useMemo(() => {
    if (selectedCategory === 'All') return NFC_DESIGNS;
    return NFC_DESIGNS.filter((d) => d.category === selectedCategory);
  }, [selectedCategory]);

  const totalCards = filteredDesigns.length;
  // Ensure activeIdx is within range
  const safeIdx = activeIdx >= totalCards ? 0 : activeIdx;
  const activeDesign = filteredDesigns[safeIdx] || NFC_DESIGNS[0];

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
    if (isHovered || isDragging || !isInView || totalCards <= 1) return;

    const timer = setInterval(() => {
      stepCard('down');
    }, 3500);

    return () => clearInterval(timer);
  }, [isHovered, isDragging, isInView, stepCard, totalCards]);

  // Keep thumbnail strip scrolled into view for active card
  useEffect(() => {
    if (scrollStripRef.current) {
      const activeBtn = scrollStripRef.current.children[safeIdx];
      if (activeBtn) {
        activeBtn.scrollIntoView({
          behavior: 'smooth',
          inline: 'center',
          block: 'nearest'
        });
      }
    }
  }, [safeIdx]);

  // Mouse wheel scroll navigation through cards
  const handleWheel = (e) => {
    if (wheelCooldown.current || totalCards <= 1) return;
    
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
      className="bg-[#08090D] text-white py-12 sm:py-16 lg:py-20 relative overflow-hidden border-t border-b border-white/[0.08] select-none"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setIsDragging(false);
      }}
    >
      {/* Dynamic Ambient Aura matching active card's accent */}
      <div className="absolute inset-0 pointer-events-none transition-all duration-700">
        <div 
          className="absolute top-1/4 left-1/3 w-[600px] h-[450px] blur-[120px] opacity-25 transition-all duration-700"
          style={{ backgroundColor: activeDesign.accent }}
        />
        <div className="absolute bottom-6 right-1/4 w-[450px] h-[350px] bg-[radial-gradient(circle,rgba(255,255,255,0.03)_0%,transparent_70%)] blur-2xl" />
        
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
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 sm:mb-10">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.06] border border-white/10 text-white/80 text-xs font-bold uppercase tracking-wider mb-3 backdrop-blur-md">
              <Radio 
                className="w-3.5 h-3.5 transition-colors duration-500 animate-pulse" 
                style={{ color: activeDesign.accent }}
              />
              <span>Executive NFC Collection (30 Bespoke Editions)</span>
            </div>
            <h2 className="font-manrope font-extrabold text-3xl sm:text-4xl lg:text-5xl text-white tracking-tight leading-tight">
              Smart NFC Metal Cards.
            </h2>
            <p className="mt-2 text-sm sm:text-base text-white/60 leading-relaxed">
              Precision-crafted double-sided smart cards with embedded NXP NTAG216 silicon. Tap against any smartphone to instantly exchange contact info, portfolios, social handles, and emergency links.
            </p>
          </div>
        </div>

        {/* ================= CATEGORY FILTER TABS ================= */}
        <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-8 scrollbar-none">
          <span className="text-xs font-bold text-white/40 uppercase tracking-wider mr-1 flex items-center gap-1.5 shrink-0">
            <SlidersHorizontal className="w-3.5 h-3.5 text-amber-400" />
            <span>Styles:</span>
          </span>
          {NFC_CATEGORIES.map((cat) => {
            const isCatActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => {
                  setSelectedCategory(cat);
                  setActiveIdx(0);
                  setIsFlipped(false);
                }}
                className={`px-3.5 py-1.5 rounded-full text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                  isCatActive
                    ? 'bg-white text-black shadow-md scale-102 font-black'
                    : 'bg-[#12131A] text-white/60 hover:text-white hover:bg-white/10 border border-white/10'
                }`}
              >
                {cat}
                {cat === 'All' && ` (${NFC_DESIGNS.length})`}
              </button>
            );
          })}
        </div>

        {/* Main Interactive Stage: Left 3D Vertical Carousel + Right Live Interactive Phone Simulation */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">

          {/* ================= LEFT: 3D VERTICAL CAROUSEL (UPWARD TO DOWNWARD) ================= */}
          <div className="lg:col-span-7 flex flex-col items-center">
            
            {/* Carousel Control Bar & Scrubber */}
            <div className="w-full flex items-center justify-between mb-3 px-2">
              <div className="flex items-center gap-2 text-xs font-mono text-white/60">
                <span className="px-2 py-0.5 rounded bg-white/10 text-white font-bold">{activeDesign.code}</span>
                <span className="font-bold text-white text-sm">{(safeIdx + 1).toString().padStart(2, '0')}</span>
                <span>/</span>
                <span>{totalCards.toString().padStart(2, '0')}</span>
              </div>

              {/* Up & Down Stepper Buttons */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => stepCard('up')}
                  className="w-8 h-8 rounded-full bg-white/[0.08] hover:bg-white/[0.2] border border-white/15 text-white flex items-center justify-center transition-all cursor-pointer shadow-sm active:scale-95"
                  aria-label="Previous NFC Card"
                  title="Previous Card"
                >
                  <ChevronUp className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => stepCard('down')}
                  className="w-8 h-8 rounded-full bg-white/[0.08] hover:bg-white/[0.2] border border-white/15 text-white flex items-center justify-center transition-all cursor-pointer shadow-sm active:scale-95"
                  aria-label="Next NFC Card"
                  title="Next Card"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* 3D Vertical Stage Container */}
            <div
              className="relative w-full max-w-[480px] h-[300px] sm:h-[340px] md:h-[370px] flex items-center justify-center cursor-grab active:cursor-grabbing"
              style={{ perspective: '1200px' }}
              onWheel={handleWheel}
              onPointerDown={handlePointerDown}
              onPointerUp={handlePointerUp}
            >
              {/* Vertical 3D Stack */}
              {filteredDesigns.map((design, idx) => {
                const rawOffset = (idx - safeIdx) % totalCards;
                let offset = rawOffset;
                if (offset > totalCards / 2) offset -= totalCards;
                if (offset < -totalCards / 2) offset += totalCards;

                const isCurrent = offset === 0;
                const isAdjacent = Math.abs(offset) === 1;
                const isSecondary = Math.abs(offset) === 2;
                const isVisible = Math.abs(offset) <= 2;

                if (!isVisible) return null;

                // 3D positioning along vertical cylinder
                const translateY = offset * (isAdjacent ? 75 : 140);
                const translateZ = isCurrent ? 45 : isAdjacent ? -60 : -140;
                const rotateX = offset * -20;
                const scale = isCurrent ? 1.03 : isAdjacent ? 0.88 : 0.72;
                const opacity = isCurrent ? 1 : isAdjacent ? 0.55 : 0.2;
                const zIndex = isCurrent ? 30 : isAdjacent ? 20 : 10;
                const blur = isCurrent ? 0 : isAdjacent ? 1 : 2.5;

                return (
                  <div
                    key={design.id}
                    onClick={() => {
                      if (!isCurrent) {
                        setIsFlipped(false);
                        setActiveIdx(idx);
                      } else {
                        // Clicking current card flips between front and back!
                        setIsFlipped((prev) => !prev);
                      }
                    }}
                    className={`absolute w-[260px] sm:w-[320px] md:w-[360px] aspect-[856/540] will-change-transform ${
                      isDragging ? 'transition-none' : 'transition-all duration-700 ease-out'
                    }`}
                    style={{
                      transform: `translate3d(0, ${translateY}px, ${translateZ}px) scale(${scale}) rotateX(${rotateX}deg)`,
                      zIndex,
                      opacity,
                      filter: `blur(${blur}px)`,
                      transformStyle: 'preserve-3d',
                      cursor: 'pointer'
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
                        className="absolute inset-0 rounded-[18px] overflow-hidden shadow-[0_20px_45px_rgba(0,0,0,0.85)] border border-white/20 backface-hidden"
                        style={{ backfaceVisibility: 'hidden' }}
                      >
                        <NfcCardArt design={design} side="front" />
                      </div>

                      {/* BACK OF CARD (QR Fallback & Laser Serial) */}
                      <div 
                        className="absolute inset-0 rounded-[18px] overflow-hidden shadow-[0_20px_45px_rgba(0,0,0,0.85)] border border-white/20 backface-hidden"
                        style={{ 
                          backfaceVisibility: 'hidden',
                          transform: 'rotateY(180deg)'
                        }}
                      >
                        <NfcCardArt 
                          design={design} 
                          side="back" 
                          qrValue={previewUrl} 
                          serial={`TAG-${design.code}-${safeIdx + 1}`} 
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Front / Back Side View Switcher */}
            <div className="mt-5 flex items-center justify-center relative z-20">
              <div className="inline-flex p-1 rounded-full bg-[#12131A] border border-white/10 shadow-lg">
                <button
                  type="button"
                  onClick={() => setIsFlipped(false)}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    !isFlipped
                      ? 'bg-white text-black shadow-sm font-extrabold'
                      : 'text-white/60 hover:text-white'
                  }`}
                >
                  Front Artwork
                </button>
                <button
                  type="button"
                  onClick={() => setIsFlipped(true)}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    isFlipped
                      ? 'bg-white text-black shadow-sm font-extrabold'
                      : 'text-white/60 hover:text-white'
                  }`}
                >
                  Back View
                </button>
              </div>
            </div>

            {/* Horizontal Filmstrip of all filtered cards for 1-click preview */}
            <div className="w-full mt-6 relative">
              <div 
                ref={scrollStripRef}
                className="flex items-center gap-2.5 overflow-x-auto py-2 px-1 scrollbar-none"
              >
                {filteredDesigns.map((d, i) => {
                  const isThumbActive = i === safeIdx;
                  return (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => {
                        setIsFlipped(false);
                        setActiveIdx(i);
                      }}
                      className={`group/thumb relative rounded-xl overflow-hidden aspect-[856/540] w-20 sm:w-24 shrink-0 transition-all cursor-pointer border ${
                        isThumbActive
                          ? 'ring-2 ring-amber-400 border-white scale-105 shadow-[0_4px_15px_rgba(245,178,31,0.4)]'
                          : 'border-white/10 opacity-60 hover:opacity-100 hover:border-white/30'
                      }`}
                    >
                      <img 
                        src={d.frontImage} 
                        alt={d.name} 
                        className="w-full h-full object-cover"
                        loading="lazy" 
                      />
                      <span className="absolute bottom-1 left-1 px-1 rounded bg-black/75 text-[9px] font-mono font-bold text-white">
                        {d.code}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

          </div>

          {/* ================= RIGHT: CARD DETAILS & INTERACTIVE PHONE SIMULATOR ================= */}
          <div className="lg:col-span-5 flex flex-col justify-between">
            <div className="rounded-[28px] bg-gradient-to-b from-[#161722] via-[#12131A] to-[#0A0B10] border border-white/[0.12] p-5 sm:p-7 shadow-[inset_0_1px_1px_rgba(255,255,255,0.15),0_25px_60px_rgba(0,0,0,0.8)] relative overflow-hidden backdrop-blur-xl">
              
              {/* Dynamic Aura behind pod */}
              <div 
                className="absolute -top-16 -right-16 w-48 h-48 rounded-full blur-3xl opacity-25 transition-colors duration-500 pointer-events-none"
                style={{ backgroundColor: activeDesign.accent }}
              />

              {/* Card Meta Header */}
              <div className="relative z-10 flex items-start justify-between gap-3 mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span 
                      className="text-[10px] font-mono font-extrabold tracking-wider uppercase px-2 py-0.5 rounded-md"
                      style={{ 
                        backgroundColor: `${activeDesign.accent}25`,
                        color: activeDesign.accent 
                      }}
                    >
                      EDITION #{activeDesign.code}
                    </span>
                    <span className="text-[11px] font-mono text-white/50 uppercase">
                      {activeDesign.category}
                    </span>
                  </div>

                  <h3 className="font-manrope font-extrabold text-2xl sm:text-3xl text-white tracking-tight">
                    {activeDesign.name}
                  </h3>
                  <p className="text-xs sm:text-sm text-white/70 mt-1 leading-relaxed">
                    {activeDesign.line}
                  </p>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-[9px] font-mono text-white/40 uppercase block">Price</span>
                  <span className="font-manrope font-extrabold text-xl sm:text-2xl text-white">
                    PKR {NFC_CARD_PRICE_PKR}
                  </span>
                  <span className="text-[10px] font-bold text-emerald-400 block mt-0.5">
                    Free 24h Delivery
                  </span>
                </div>
              </div>

              {/* Product Specifications & Capabilities */}
              <div className="relative z-10 my-4 p-4 sm:p-5 rounded-2xl bg-white/[0.03] border border-white/[0.08]">
                <h4 className="text-[11px] font-mono font-extrabold uppercase tracking-widest text-white/50 mb-3">
                  Hardware Specifications
                </h4>
                <div className="grid grid-cols-2 gap-2.5 text-xs">
                  <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                    <span className="text-[10px] font-mono text-white/40 uppercase block">Chipset</span>
                    <span className="font-bold text-white mt-0.5 block">NXP NTAG216 (888B)</span>
                  </div>
                  <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                    <span className="text-[10px] font-mono text-white/40 uppercase block">Frequency</span>
                    <span className="font-bold text-white mt-0.5 block">13.56 MHz HF</span>
                  </div>
                  <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                    <span className="text-[10px] font-mono text-white/40 uppercase block">Dimensions</span>
                    <span className="font-bold text-white mt-0.5 block">CR80 (85.6 × 54 mm)</span>
                  </div>
                  <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                    <span className="text-[10px] font-mono text-white/40 uppercase block">Power</span>
                    <span className="font-bold text-emerald-400 mt-0.5 block">Zero Battery Required</span>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-white/[0.06] space-y-2 text-xs text-white/70">
                  <div className="flex items-center justify-between">
                    <span className="text-white/40">Compatibility</span>
                    <span className="font-medium text-white">Apple iOS (iPhone XS+) & Android NFC</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white/40">Dual Fallback</span>
                    <span className="font-medium text-white">Laser-etched dynamic QR on reverse</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white/40">Digital Profile</span>
                    <span className="font-medium text-emerald-400">Included free, no app or monthly fee</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="relative z-10 mt-5 flex flex-col sm:flex-row gap-2.5">
                <Link
                  to={`/order?nfc=${activeDesign.id}`}
                  className="flex-1 py-3 px-5 rounded-full text-black font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg transition-all duration-300 hover:scale-102 active:scale-95 group/btn"
                  style={{
                    backgroundColor: activeDesign.accent,
                    boxShadow: `0 8px 24px ${activeDesign.accent}45`
                  }}
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Order {activeDesign.name}</span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover/btn:translate-x-0.5" />
                </Link>

                <Link
                  to={`/nfc-card/${activeDesign.id}`}
                  className="py-3 px-5 rounded-full bg-white/[0.08] hover:bg-white/[0.15] border border-white/15 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 transition-all text-center"
                >
                  <span>Inspect Card</span>
                  <ExternalLink className="w-3.5 h-3.5 text-white/60" />
                </Link>
              </div>

              <div className="mt-4 pt-3 border-t border-white/10 text-center">
                <Link
                  to="/catalog?filter=nfc"
                  className="text-xs font-bold text-white/60 hover:text-white transition-colors inline-flex items-center gap-1.5"
                >
                  <span>Browse all 30 custom NFC card editions in catalog</span>
                  <ArrowRight className="w-3 h-3 text-amber-400" />
                </Link>
              </div>

            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
