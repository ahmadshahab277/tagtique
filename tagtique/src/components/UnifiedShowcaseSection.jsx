import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Flame, 
  Layers, 
  ArrowRight, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle2 
} from 'lucide-react';
import { SHOWCASE_EDITIONS } from '../data/showcaseEditions';

export default function UnifiedShowcaseSection({
  activeEdition = 'mascot',
  onEditionChange,
  activeCharacter,
  onSelectCharacter,
  mascotAnchorRef,
  isDocked = false
}) {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [activeCategory, setActiveCategory] = useState('all');
  const sliderRef = useRef(null);

  const currentEditionData = SHOWCASE_EDITIONS[activeEdition] || SHOWCASE_EDITIONS.mascot;

  // Reset category filter when switching editions
  useEffect(() => {
    setActiveCategory('all');
    if (sliderRef.current) {
      sliderRef.current.scrollTo({ left: 0, behavior: 'smooth' });
    }
  }, [activeEdition]);

  // Mouse tilt for the left spotlight pod
  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: x * 16, y: -y * 16 });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

  const slide = (direction) => {
    if (!sliderRef.current) return;
    const scrollAmount = 260 * direction;
    sliderRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  };

  // Filter vault characters based on active category
  const filteredCharacters = activeCategory === 'all'
    ? currentEditionData.characters
    : currentEditionData.characters.filter((c) => c.category === activeCategory);

  return (
    <section
      id="mascot-section"
      className="w-full bg-[#07070A] text-white py-5 sm:py-7 lg:py-8 relative overflow-hidden border-t border-b border-white/[0.08]"
    >
      {/* Top illuminated accent line transitioning with active character's accent color */}
      <div
        className="absolute top-0 left-0 right-0 h-[2px] transition-all duration-700 pointer-events-none"
        style={{
          background: `linear-gradient(90deg, transparent 0%, ${activeCharacter?.accentColor || '#8B5CF6'} 50%, transparent 100%)`
        }}
      />

      {/* Precision tactile print-bed matrix texture across entire section */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: `
            radial-gradient(rgba(255, 255, 255, 0.16) 1.2px, transparent 1.2px),
            linear-gradient(to right, rgba(255, 255, 255, 0.02) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.02) 1px, transparent 1px)
          `,
          backgroundSize: '24px 24px, 48px 48px, 48px 48px',
          maskImage: 'radial-gradient(circle at 50% 25%, black 45%, transparent 85%)',
          WebkitMaskImage: 'radial-gradient(circle at 50% 25%, black 45%, transparent 85%)'
        }}
      />

      {/* Dynamic Ambient Aura Lighting (transitions seamlessly based on active character's color) */}
      <div className="absolute inset-0 pointer-events-none transition-all duration-700">
        <div
          className="absolute -top-32 left-1/4 w-[750px] h-[600px] blur-3xl opacity-35 transition-colors duration-700"
          style={{ backgroundColor: activeCharacter?.accentColor || '#8B5CF6' }}
        />
        <div className="absolute -bottom-40 right-1/4 w-[700px] h-[600px] bg-[radial-gradient(circle,rgba(255,255,255,0.03)_0%,transparent_70%)] blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.02)_0%,transparent_80%)]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* ========================================================================= */}
        {/* TOP EDITION SWITCHER TABS & HEADER (COMPACT WHOLE-SCREEN FIT)             */}
        {/* ========================================================================= */}
        <div className="mb-4 sm:mb-5 flex flex-col md:flex-row md:items-center justify-between gap-3">
          
          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            {/* 3 Clickable Edition Tabs Container (Enhanced Texture, Physical Chassis & High Visibility) */}
            <div 
              className="relative inline-flex items-center p-1 sm:p-1.5 rounded-full transition-all duration-500 backdrop-blur-2xl shadow-xl shrink-0"
              style={{
                background: 'linear-gradient(180deg, #252533 0%, #171722 50%, #0E0E15 100%)',
                boxShadow: `0 8px 25px rgba(0, 0, 0, 0.8), 0 0 20px ${activeCharacter?.accentColor || '#8B5CF6'}35, inset 0 1px 1px rgba(255, 255, 255, 0.35), inset 0 -1px 2px rgba(0, 0, 0, 0.9)`,
                border: '1px solid rgba(255, 255, 255, 0.22)'
              }}
            >
              {/* Tactile Micro-Dot Matrix Texture */}
              <div 
                className="absolute inset-0 rounded-full pointer-events-none opacity-30"
                style={{
                  backgroundImage: 'radial-gradient(circle, rgba(255, 255, 255, 0.35) 1px, transparent 1px)',
                  backgroundSize: '6px 6px'
                }}
              />

              {/* Tactile Left Hardware Grip Notches */}
              <div className="hidden sm:flex items-center gap-[2.5px] pl-1.5 pr-1 pointer-events-none opacity-50">
                <div className="w-[2px] h-3 rounded-full bg-white/40 shadow-sm" />
                <div className="w-[2px] h-3 rounded-full bg-white/25 shadow-sm" />
                <div className="w-[2px] h-3 rounded-full bg-white/15 shadow-sm" />
              </div>

              {/* Mascot Edition Button */}
              <button
                type="button"
                onClick={() => onEditionChange('mascot')}
                className={`relative z-10 flex items-center px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-[11px] sm:text-xs font-black uppercase tracking-wider transition-all duration-300 cursor-pointer ${
                  activeEdition === 'mascot'
                    ? 'bg-gradient-to-r from-purple-600 via-purple-500 to-indigo-600 text-white shadow-[0_4px_18px_rgba(168,85,247,0.7),inset_0_1px_1px_rgba(255,255,255,0.45)] border border-purple-300/40 scale-102'
                    : 'text-white/80 hover:text-white hover:bg-white/[0.08]'
                }`}
              >
                <span>Mascot Edition</span>
              </button>

              {/* Tactile Division Notch */}
              <div className="w-px h-3.5 bg-white/15 mx-0.5 pointer-events-none" />

              {/* Anime Edition Button */}
              <button
                type="button"
                onClick={() => onEditionChange('anime')}
                className={`relative z-10 flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-[11px] sm:text-xs font-black uppercase tracking-wider transition-all duration-300 cursor-pointer ${
                  activeEdition === 'anime'
                    ? 'bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 text-black font-black shadow-[0_4px_18px_rgba(249,115,22,0.7),inset_0_1px_1px_rgba(255,255,255,0.5)] border border-amber-300/50 scale-102'
                    : 'text-white/80 hover:text-white hover:bg-white/[0.08]'
                }`}
              >
                <Flame className="w-3 h-3" />
                <span>Anime Edition</span>
              </button>

              {/* Tactile Division Notch */}
              <div className="w-px h-3.5 bg-white/15 mx-0.5 pointer-events-none" />

              {/* Collections Button */}
              <button
                type="button"
                onClick={() => onEditionChange('collections')}
                className={`relative z-10 flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-[11px] sm:text-xs font-black uppercase tracking-wider transition-all duration-300 cursor-pointer ${
                  activeEdition === 'collections'
                    ? 'bg-gradient-to-r from-cyan-400 via-teal-400 to-emerald-400 text-black font-black shadow-[0_4px_18px_rgba(6,182,212,0.7),inset_0_1px_1px_rgba(255,255,255,0.5)] border border-cyan-300/50 scale-102'
                    : 'text-white/80 hover:text-white hover:bg-white/[0.08]'
                }`}
              >
                <Layers className="w-3 h-3" />
                <span>Collections</span>
              </button>

              {/* Tactile Right Hardware Grip Notches */}
              <div className="hidden sm:flex items-center gap-[2.5px] pl-1 pr-1.5 pointer-events-none opacity-50">
                <div className="w-[2px] h-3 rounded-full bg-white/15 shadow-sm" />
                <div className="w-[2px] h-3 rounded-full bg-white/25 shadow-sm" />
                <div className="w-[2px] h-3 rounded-full bg-white/40 shadow-sm" />
              </div>
            </div>

            {/* Dynamic Edition Heading inline on tablet/desktop */}
            <div className="hidden md:flex items-baseline gap-2.5">
              <h2 className="font-manrope font-extrabold text-xl lg:text-2xl text-white tracking-tight uppercase leading-none">
                {currentEditionData.name}.
              </h2>
              <span className="hidden xl:inline text-xs text-white/50 truncate max-w-xs">
                {currentEditionData.tagline}
              </span>
            </div>
          </div>

          {/* Quick Active Character Badge */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#14141A] border border-white/15 backdrop-blur-md shadow-md shrink-0">
            <div className="text-left">
              <span className="text-[9px] text-white/40 uppercase font-mono block leading-none">Active Spotlight</span>
              <span className="text-xs font-extrabold text-white leading-tight">{activeCharacter?.name}</span>
            </div>
          </div>

        </div>

        {/* ========================================================================= */}
        {/* MAIN 2-COLUMN SHOWCASE (LEFT SPOTLIGHT + RIGHT VAULT)                     */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6 items-stretch">

          {/* ================= LEFT COLUMN: 3D SPOTLIGHT POD ================= */}
          <div
            className="lg:col-span-5 rounded-[26px] bg-gradient-to-b from-[#181820] via-[#101015] to-[#0A0A0E] border border-white/[0.15] p-4 sm:p-5 flex flex-col justify-between shadow-[inset_0_1px_1px_rgba(255,255,255,0.18),0_20px_50px_rgba(0,0,0,0.8)] relative overflow-hidden group backdrop-blur-2xl transition-all duration-500"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            {/* Tactile Pod Matrix Texture */}
            <div 
              className="absolute inset-0 pointer-events-none opacity-20 rounded-[26px]"
              style={{
                backgroundImage: 'radial-gradient(circle, rgba(255, 255, 255, 0.2) 1px, transparent 1px)',
                backgroundSize: '12px 12px'
              }}
            />
            {/* Ambient Character Spotlight Glow */}
            <div
              className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full blur-3xl opacity-25 transition-all duration-700 pointer-events-none"
              style={{ backgroundColor: activeCharacter?.accentColor || '#8B5CF6' }}
            />

            {/* Top Identity Header */}
            <div className="relative z-10 flex items-center justify-between">
              <div>
                <span 
                  className="text-[10px] font-bold tracking-wider uppercase block transition-colors duration-300"
                  style={{ color: activeCharacter?.accentColor || '#8B5CF6' }}
                >
                  {activeCharacter?.series}
                </span>
                <h3 className="font-manrope font-extrabold text-lg sm:text-xl text-white tracking-tight leading-tight mt-0.5">
                  {activeCharacter?.name}
                </h3>
              </div>
              <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border transition-all duration-300 ${activeCharacter?.tagClass || 'bg-white/10 text-white border-white/20'}`}>
                {activeCharacter?.title}
              </span>
            </div>

            {/* 3D Floating Mascot Display & Pedestal */}
            <div
              ref={mascotAnchorRef}
              className="my-2 sm:my-3 relative h-[180px] sm:h-[195px] flex items-center justify-center cursor-pointer z-10"
              style={{ perspective: '1000px' }}
            >
              {/* Pedestal Shadow glowing with character's color */}
              <div
                className="absolute bottom-2 left-1/2 -translate-x-1/2 w-36 h-6 rounded-full blur-md opacity-40 pointer-events-none transition-colors duration-500"
                style={{ backgroundColor: activeCharacter?.accentColor || '#8B5CF6' }}
              />

              {/* In-Flow Docked Mascot Image (rendered when isDocked is true) */}
              {isDocked && (
                <div
                  className="relative will-change-transform transition-transform duration-200 ease-out flex items-center justify-center"
                  style={{
                    transform: `rotateX(${tilt.y}deg) rotateY(${tilt.x}deg) scale(1.02)`,
                    transformStyle: 'preserve-3d'
                  }}
                >
                  <img
                    src={activeCharacter?.src}
                    alt={activeCharacter?.name}
                    className="w-[140px] sm:w-[160px] max-h-[175px] h-auto object-contain select-none pointer-events-none"
                    style={{
                      filter: `
                        drop-shadow(0 2px 4px rgba(255,255,255,0.75))
                        drop-shadow(0 16px 28px rgba(0,0,0,0.6))
                        drop-shadow(0 6px 16px ${activeCharacter?.accentColor}40)
                      `
                    }}
                    draggable={false}
                  />

                  {/* Ambient Specular Light Sheen */}
                  <div className="absolute inset-0 pointer-events-none rounded-3xl opacity-20 bg-gradient-to-tr from-transparent via-white to-transparent" />
                </div>
              )}
            </div>

            {/* Specs & Buy Link */}
            <div className="flex flex-col gap-2.5 relative z-10">
              <div className="flex items-center justify-between gap-3 pt-2.5 border-t border-white/10">
                <div>
                  <span className="text-[9px] text-white/50 uppercase tracking-widest block font-bold leading-none">Price</span>
                  <span className="font-manrope font-extrabold text-xl text-white">PKR {activeCharacter?.price || 999}</span>
                </div>

                <Link
                  to={`/product/${activeCharacter?.slug}`}
                  className="px-5 py-2 rounded-full text-black font-extrabold text-xs flex items-center gap-1.5 shadow-lg transition-all duration-300 hover:scale-105 active:scale-95 group/btn"
                  style={{
                    backgroundColor: activeCharacter?.accentColor || '#F59E0B',
                    boxShadow: `0 8px 18px ${activeCharacter?.accentColor}40`
                  }}
                >
                  <span>Order {activeCharacter?.name.split(' ')[0]}</span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover/btn:translate-x-0.5" />
                </Link>
              </div>
            </div>
          </div>

          {/* ================= RIGHT COLUMN: COLLECTIBLE VAULT ================= */}
          <div className="lg:col-span-7 rounded-[26px] bg-white text-black p-4 sm:p-5 flex flex-col justify-between shadow-[0_20px_50px_rgba(0,0,0,0.6)] border border-black/[0.08] relative overflow-hidden">
            
            {/* Vault Header with Category Pills & Arrows */}
            <div className="relative z-10 mb-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <div className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-black/5 text-black/75 text-[10px] font-bold uppercase tracking-wider mb-0.5">
                  <span>{currentEditionData.characters.length} Collectible Designs</span>
                </div>
                <h3 className="font-manrope font-extrabold text-lg sm:text-xl text-black tracking-tight leading-tight">
                  Collectible Sticker Vault
                </h3>
                <p className="text-[11px] text-black/60">
                  Click any sticker to load it into the spotlight box and sync with hero section.
                </p>
              </div>

              {/* Slider Arrows */}
              <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                <button
                  type="button"
                  onClick={() => slide(-1)}
                  className="w-8 h-8 rounded-full bg-black/5 hover:bg-black/10 active:scale-95 border border-black/10 flex items-center justify-center text-black transition-all cursor-pointer shadow-xs"
                  aria-label="Previous stickers"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => slide(1)}
                  className="w-8 h-8 rounded-full bg-black/5 hover:bg-black/10 active:scale-95 border border-black/10 flex items-center justify-center text-black transition-all cursor-pointer shadow-xs"
                  aria-label="Next stickers"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Optional Category Pills */}
            {currentEditionData.categories && currentEditionData.categories.length > 1 && (
              <div className="flex items-center gap-1.5 mb-2.5 overflow-x-auto pb-0.5 [scrollbar-width:none]">
                {currentEditionData.categories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setActiveCategory(cat.id)}
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold transition-all cursor-pointer shrink-0 ${
                      activeCategory === cat.id
                        ? 'bg-black text-white shadow-xs'
                        : 'bg-black/5 text-black/60 hover:bg-black/10'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            )}

            {/* Horizontal Carousel of Characters in this Edition */}
            <div
              ref={sliderRef}
              className="relative z-10 flex gap-2.5 sm:gap-3 overflow-x-auto pb-1.5 pt-0.5 snap-x snap-mandatory scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              {filteredCharacters.map((character) => {
                const isSelected = character.id === activeCharacter?.id;
                return (
                  <div
                    key={character.id}
                    onClick={() => onSelectCharacter(activeEdition, character)}
                    className={`snap-start shrink-0 w-[145px] sm:w-[155px] rounded-[18px] bg-white border p-2 sm:p-2.5 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 group cursor-pointer relative overflow-hidden ${
                      isSelected
                        ? 'border-2 shadow-lg ring-1'
                        : 'border-black/10 hover:shadow-md'
                    }`}
                    style={{
                      borderColor: isSelected ? character.accentColor : undefined,
                      ringColor: isSelected ? `${character.accentColor}30` : undefined
                    }}
                  >
                    {/* Top Pill */}
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-black/50 truncate max-w-[75px]">
                        {character.series}
                      </span>
                      <span className="font-mono text-[10px] font-bold text-black/60">
                        PKR {character.price}
                      </span>
                    </div>

                    {/* Graphic Container with Character Aurora Background */}
                    <div
                      className="w-full h-[95px] sm:h-[105px] rounded-xl flex items-center justify-center p-1.5 relative overflow-hidden transition-transform duration-300 group-hover:scale-105"
                      style={{
                        background: `linear-gradient(180deg, ${character.accentColor}18 0%, ${character.accentColor}06 100%)`
                      }}
                    >
                      <img
                        src={character.src}
                        alt={character.name}
                        className="w-full h-full object-contain drop-shadow-[0_6px_12px_rgba(0,0,0,0.12)] select-none"
                        loading="lazy"
                      />
                    </div>

                    {/* Card Details */}
                    <div className="mt-1.5 flex flex-col">
                      <div className="flex items-center justify-between gap-1">
                        <h4 
                          className="font-manrope font-extrabold text-[11px] text-black transition-colors truncate"
                          style={{
                            color: isSelected ? character.accentColor : undefined
                          }}
                        >
                          {character.name.toUpperCase()}
                        </h4>
                        <span className="text-[8px] font-bold text-emerald-600 flex items-center gap-0.5 shrink-0">
                          <CheckCircle2 className="w-2.5 h-2.5" />
                          Stock
                        </span>
                      </div>

                      {/* Direct Buy Link to Product Page */}
                      <Link
                        to={`/product/${character.slug}`}
                        onClick={(e) => e.stopPropagation()}
                        className="mt-1.5 w-full py-1.5 rounded-lg bg-black text-white font-extrabold text-[9px] flex items-center justify-center gap-1 transition-all shadow-xs group-hover:text-black"
                        style={{
                          backgroundColor: isSelected ? character.accentColor : undefined,
                          color: isSelected ? '#000000' : undefined
                        }}
                      >
                        <span>Buy Sticker</span>
                        <ArrowRight className="w-2.5 h-2.5 transition-transform group-hover:translate-x-0.5" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom Specs Strip */}
            <div className="relative z-10 mt-2 pt-2 border-t border-black/10 flex items-center justify-between text-[10px] text-black/60 flex-wrap gap-2">
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="flex items-center gap-1 font-medium">
                  <span className="text-emerald-500 font-bold">✓</span> UV Vinyl
                </span>
                <span className="flex items-center gap-1 font-medium">
                  <span className="text-emerald-500 font-bold">✓</span> Direct Routing
                </span>
              </div>

              <Link
                to={`/catalog?filter=${activeEdition}`}
                className="font-bold text-black underline underline-offset-4 flex items-center gap-1 ml-auto sm:ml-0 hover:opacity-75 transition-opacity"
              >
                <span>Browse Full Catalog →</span>
              </Link>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
