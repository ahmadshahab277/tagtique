import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, ShieldCheck, Zap, ChevronLeft, ChevronRight, CheckCircle2, Flame } from 'lucide-react';

const ANIME_STICKERS = [
  {
    id: 'goku',
    slug: 'anime-goku',
    name: 'Goku',
    series: 'Dragon Ball Z',
    title: 'Super Saiyan',
    line: 'Saiyan Pride · High-Density QR',
    price: 999,
    src: '/assets/stickers/anime/goku.png',
    accentColor: '#F97316',
    auraGradient: 'from-amber-500/20 via-orange-500/10 to-transparent',
    tagClass: 'bg-orange-500/10 text-orange-400 border-orange-500/30'
  },
  {
    id: 'naruto',
    slug: 'anime-naruto',
    name: 'Naruto',
    series: 'Naruto Shippuden',
    title: 'Nine-Tails Sage',
    line: 'Hidden Leaf · Will of Fire',
    price: 999,
    src: '/assets/stickers/anime/naruto_uzumaki.png',
    accentColor: '#EA580C',
    auraGradient: 'from-orange-600/20 via-amber-500/10 to-transparent',
    tagClass: 'bg-amber-500/10 text-amber-400 border-amber-500/30'
  },
  {
    id: 'luffy',
    slug: 'anime-luffy',
    name: 'Luffy',
    series: 'One Piece',
    title: 'Straw Hat Captain',
    line: 'Gear 5 · King of Pirates',
    price: 999,
    src: '/assets/stickers/anime/monkey_d_luffy.png',
    accentColor: '#EF4444',
    auraGradient: 'from-red-600/20 via-rose-500/10 to-transparent',
    tagClass: 'bg-red-500/10 text-red-400 border-red-500/30'
  },
  {
    id: 'zoro',
    slug: 'anime-zoro',
    name: 'Zoro',
    series: 'One Piece',
    title: 'Three Sword Style',
    line: 'King of Hell · Wano Blade',
    price: 999,
    src: '/assets/stickers/anime/roronoa_zoro.png',
    accentColor: '#10B981',
    auraGradient: 'from-emerald-600/20 via-teal-500/10 to-transparent',
    tagClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
  },
  {
    id: 'gojo',
    slug: 'anime-gojo',
    name: 'Gojo',
    series: 'Jujutsu Kaisen',
    title: 'Limitless Void',
    line: 'Six Eyes · The Strongest',
    price: 999,
    src: '/assets/stickers/anime/gojo_satoru.png',
    accentColor: '#3B82F6',
    auraGradient: 'from-blue-600/20 via-cyan-500/10 to-transparent',
    tagClass: 'bg-blue-500/10 text-blue-400 border-blue-500/30'
  },
  {
    id: 'eren',
    slug: 'anime-eren',
    name: 'Eren',
    series: 'Attack on Titan',
    title: 'Attack Titan',
    line: 'Founding Titan · Freedom',
    price: 999,
    src: '/assets/stickers/anime/eren_yeager.png',
    accentColor: '#A8A29E',
    auraGradient: 'from-stone-500/20 via-zinc-500/10 to-transparent',
    tagClass: 'bg-stone-500/10 text-stone-300 border-stone-500/30'
  },
  {
    id: 'levi',
    slug: 'anime-levi',
    name: 'Levi',
    series: 'Attack on Titan',
    title: 'Captain Levi',
    line: 'Humanity\'s Strongest Soldier',
    price: 999,
    src: '/assets/stickers/anime/levi_ackerman.png',
    accentColor: '#059669',
    auraGradient: 'from-emerald-700/20 via-teal-600/10 to-transparent',
    tagClass: 'bg-teal-500/10 text-teal-300 border-teal-500/30'
  },
  {
    id: 'mikasa',
    slug: 'anime-mikasa',
    name: 'Mikasa',
    series: 'Attack on Titan',
    title: 'Mikasa Ackerman',
    line: 'Red Scarf · Scout Elite',
    price: 999,
    src: '/assets/stickers/anime/mikasa_ackerman.png',
    accentColor: '#DC2626',
    auraGradient: 'from-rose-700/20 via-red-600/10 to-transparent',
    tagClass: 'bg-rose-500/10 text-rose-300 border-rose-500/30'
  },
  {
    id: 'ichigo',
    slug: 'anime-ichigo',
    name: 'Ichigo',
    series: 'Bleach',
    title: 'Substitute Shinigami',
    line: 'Bankai · Soul Reaper',
    price: 999,
    src: '/assets/stickers/anime/ichigo_kurosaki.png',
    accentColor: '#F59E0B',
    auraGradient: 'from-amber-600/20 via-orange-500/10 to-transparent',
    tagClass: 'bg-amber-500/10 text-amber-400 border-amber-500/30'
  },
  {
    id: 'hinata',
    slug: 'anime-hinata',
    name: 'Hinata',
    series: 'Naruto Shippuden',
    title: 'Gentle Fist',
    line: 'Byakugan Princess · Hyuga',
    price: 999,
    src: '/assets/stickers/anime/hinata_hyuga.png',
    accentColor: '#8B5CF6',
    auraGradient: 'from-purple-600/20 via-violet-500/10 to-transparent',
    tagClass: 'bg-purple-500/10 text-purple-400 border-purple-500/30'
  },
  {
    id: 'robin',
    slug: 'anime-robin',
    name: 'Robin',
    series: 'One Piece',
    title: 'Devil Child',
    line: 'Hana Hana · Poneglyph Reader',
    price: 999,
    src: '/assets/stickers/anime/nico_robin.png',
    accentColor: '#6366F1',
    auraGradient: 'from-indigo-600/20 via-purple-500/10 to-transparent',
    tagClass: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30'
  },
  {
    id: 'yor',
    slug: 'anime-yor',
    name: 'Yor',
    series: 'Spy x Family',
    title: 'Thorn Princess',
    line: 'Garden Assassin · Forger Clan',
    price: 999,
    src: '/assets/stickers/anime/yor_forger.png',
    accentColor: '#BE123C',
    auraGradient: 'from-pink-700/20 via-rose-600/10 to-transparent',
    tagClass: 'bg-pink-500/10 text-pink-300 border-pink-500/30'
  }
];

export default function AnimeEditionSection() {
  const [selectedId, setSelectedId] = useState('goku');
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const sliderRef = useRef(null);

  const activeSticker = ANIME_STICKERS.find((s) => s.id === selectedId) || ANIME_STICKERS[0];

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

  return (
    <section
      id="anime-edition"
      className="w-full bg-[#07070A] text-white py-14 sm:py-20 lg:py-24 relative overflow-hidden border-b border-white/[0.08]"
    >
      {/* Dynamic Ambient Energy Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute -top-32 left-10 w-[700px] h-[600px] blur-3xl opacity-20 transition-colors duration-700"
          style={{ backgroundColor: activeSticker.accentColor }}
        />
        <div className="absolute bottom-0 right-10 w-[600px] h-[500px] bg-[radial-gradient(circle,rgba(239,68,68,0.1)_0%,transparent_70%)] blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.02)_0%,transparent_80%)]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* ================= SECTION HEADER ================= */}
        <div className="mb-8 sm:mb-10 text-left">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-300 text-xs font-extrabold uppercase tracking-widest mb-3 shadow-[0_0_15px_rgba(249,115,22,0.15)]">
            <Flame className="w-3.5 h-3.5 text-orange-400" />
            <span>Official Shonen & Anime Edition</span>
          </div>
          <h2 className="font-manrope font-extrabold text-3xl sm:text-4xl lg:text-5xl text-white tracking-tight uppercase leading-[0.95]">
            Anime Edition.
          </h2>
          <p className="mt-2 text-sm sm:text-base text-white/60 max-w-xl leading-relaxed">
            Legendary anime warriors equipped with high-density emergency QR codes. Weatherproof die-cut vinyl for helmets, laptops, and rides.
          </p>
        </div>

        {/* ================= 2-COLUMN MAIN SHOWCASE ================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-stretch">
          
          {/* ================= LEFT: 3D SPOTLIGHT POD ================= */}
          <div
            className="lg:col-span-5 rounded-[36px] bg-gradient-to-b from-[#141419] via-[#0E0E12] to-[#0A0A0D] border border-white/[0.08] p-6 sm:p-8 flex flex-col justify-between shadow-[inset_0_1px_1px_rgba(255,255,255,0.12),0_25px_60px_rgba(0,0,0,0.7)] relative overflow-hidden group backdrop-blur-2xl"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            {/* Ambient Energy Spotlight */}
            <div
              className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full blur-3xl opacity-25 transition-all duration-500 pointer-events-none"
              style={{ backgroundColor: activeSticker.accentColor }}
            />

            {/* Top Identity Header */}
            <div className="relative z-10 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold tracking-wider uppercase block" style={{ color: activeSticker.accentColor }}>
                  {activeSticker.series}
                </span>
                <h3 className="font-manrope font-extrabold text-2xl sm:text-3xl text-white tracking-tight leading-tight mt-0.5">
                  {activeSticker.name} QR
                </h3>
              </div>
              <span className={`text-[11px] font-extrabold px-3 py-1 rounded-full border ${activeSticker.tagClass}`}>
                {activeSticker.title}
              </span>
            </div>

            {/* 3D Floating Mascot Display */}
            <div
              className="my-6 relative h-[280px] sm:h-[310px] flex items-center justify-center cursor-pointer z-10"
              style={{ perspective: '1000px' }}
            >
              {/* Pedestal Shadow */}
              <div
                className="absolute bottom-2 left-1/2 -translate-x-1/2 w-48 h-8 rounded-full blur-md opacity-40 pointer-events-none transition-colors duration-500"
                style={{ backgroundColor: activeSticker.accentColor }}
              />

              {/* 3D Animated Mascot Image */}
              <div
                className="relative will-change-transform transition-transform duration-200 ease-out flex items-center justify-center"
                style={{
                  transform: `rotateX(${tilt.y}deg) rotateY(${tilt.x}deg) scale(1.02)`,
                  transformStyle: 'preserve-3d'
                }}
              >
                <img
                  src={activeSticker.src}
                  alt={`${activeSticker.name} Anime QR Sticker`}
                  className="w-[190px] sm:w-[230px] max-h-[280px] h-auto object-contain select-none pointer-events-none"
                  style={{
                    filter: `
                      drop-shadow(0 2px 4px rgba(255,255,255,0.75))
                      drop-shadow(0 20px 35px rgba(0,0,0,0.6))
                    `
                  }}
                  draggable={false}
                />
              </div>
            </div>

            {/* Specs & Buy Link */}
            <div className="flex flex-col gap-4 relative z-10">
              <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-white/75">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/[0.06] border border-white/10 backdrop-blur-md">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  Heavy-Duty Acrylic Vinyl
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/[0.06] border border-white/10 backdrop-blur-md">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  Instant Cellular Call
                </span>
              </div>

              <div className="flex items-center justify-between gap-3 pt-3 border-t border-white/10">
                <div>
                  <span className="text-[10px] text-white/50 uppercase tracking-widest block font-bold">Official Price</span>
                  <span className="font-manrope font-extrabold text-2xl text-white">PKR {activeSticker.price}</span>
                </div>

                <Link
                  to={`/product/${activeSticker.slug}`}
                  className="px-6 py-3 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-black font-extrabold text-sm flex items-center gap-2 shadow-[0_10px_25px_rgba(249,115,22,0.3)] transition-all hover:scale-105 active:scale-95 group/btn"
                >
                  <span>Order {activeSticker.name}</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-0.5" />
                </Link>
              </div>
            </div>
          </div>

          {/* ================= RIGHT: 12-CHARACTER COLLECTIBLE VAULT ================= */}
          <div className="lg:col-span-7 rounded-[36px] bg-white text-black p-6 sm:p-8 flex flex-col justify-between shadow-[0_30px_70px_rgba(0,0,0,0.6)] border border-black/[0.08] relative overflow-hidden">
            
            {/* Header with Slider Controls */}
            <div className="relative z-10 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/5 text-black/75 text-xs font-bold uppercase tracking-wider mb-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                  <span>{ANIME_STICKERS.length} Legendary Fighters</span>
                </div>
                <h3 className="font-manrope font-extrabold text-2xl sm:text-3xl text-black tracking-tight">
                  Anime Hero Vault
                </h3>
                <p className="mt-1 text-xs sm:text-sm text-black/60">
                  Click any warrior to inspect details and view on product page.
                </p>
              </div>

              {/* Slider Arrows */}
              <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                <button
                  type="button"
                  onClick={() => slide(-1)}
                  className="w-10 h-10 rounded-full bg-black/5 hover:bg-black/10 active:scale-95 border border-black/10 flex items-center justify-center text-black transition-all cursor-pointer shadow-sm"
                  aria-label="Previous anime stickers"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={() => slide(1)}
                  className="w-10 h-10 rounded-full bg-black/5 hover:bg-black/10 active:scale-95 border border-black/10 flex items-center justify-center text-black transition-all cursor-pointer shadow-sm"
                  aria-label="Next anime stickers"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Horizontal Carousel of All 12 Anime Stickers */}
            <div
              ref={sliderRef}
              className="relative z-10 flex gap-4 overflow-x-auto pb-4 pt-1 snap-x snap-mandatory scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              {ANIME_STICKERS.map((sticker) => {
                const isSelected = sticker.id === selectedId;
                return (
                  <div
                    key={sticker.id}
                    onClick={() => setSelectedId(sticker.id)}
                    className={`snap-start shrink-0 w-[210px] sm:w-[235px] rounded-[24px] bg-white border p-4 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1.5 group cursor-pointer relative overflow-hidden ${
                      isSelected
                        ? 'border-orange-500 shadow-xl ring-2 ring-orange-500/20'
                        : 'border-black/10 hover:shadow-lg'
                    }`}
                  >
                    {/* Top Series Pill */}
                    <div className="flex items-center justify-between mb-2.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-black/50">
                        {sticker.series}
                      </span>
                      <span className="font-mono text-[11px] font-bold text-black/40">
                        PKR {sticker.price}
                      </span>
                    </div>

                    {/* Sticker Graphic Container */}
                    <div
                      className="w-full aspect-[230/280] rounded-2xl flex items-center justify-center p-3.5 relative overflow-hidden transition-transform duration-300 group-hover:scale-105"
                      style={{
                        background: `linear-gradient(180deg, ${sticker.accentColor}15 0%, ${sticker.accentColor}06 100%)`
                      }}
                    >
                      <img
                        src={sticker.src}
                        alt={sticker.name}
                        className="w-full h-full object-contain drop-shadow-[0_12px_22px_rgba(0,0,0,0.12)] select-none"
                        loading="lazy"
                      />
                    </div>

                    {/* Card Details */}
                    <div className="mt-3.5 flex flex-col">
                      <div className="flex items-center justify-between">
                        <h4 className="font-manrope font-extrabold text-base text-black group-hover:text-orange-600 transition-colors">
                          {sticker.name.toUpperCase()}
                        </h4>
                        <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          In Stock
                        </span>
                      </div>

                      <p className="text-[11px] text-black/50 mt-0.5 line-clamp-1 font-medium">
                        {sticker.line}
                      </p>

                      {/* Direct Buy Link to Product Page */}
                      <Link
                        to={`/product/${sticker.slug}`}
                        onClick={(e) => e.stopPropagation()}
                        className="mt-3 w-full py-2.5 rounded-xl bg-black group-hover:bg-orange-500 text-white group-hover:text-black font-extrabold text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm"
                      >
                        <span>Buy Sticker</span>
                        <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom Specs Strip */}
            <div className="relative z-10 mt-4 pt-4 border-t border-black/10 flex items-center justify-between text-xs text-black/60 flex-wrap gap-2.5">
              <div className="flex items-center gap-3 flex-wrap">
                <span className="flex items-center gap-1 font-medium">
                  <span className="text-emerald-500 font-bold">✓</span> UV-Cured Acrylic Vinyl
                </span>
                <span className="flex items-center gap-1 font-medium">
                  <span className="text-emerald-500 font-bold">✓</span> Instant Offline Dialing
                </span>
              </div>

              <Link
                to="/order"
                className="font-bold text-black hover:text-orange-600 underline underline-offset-4 flex items-center gap-1.5 ml-auto sm:ml-0"
              >
                <span>View All 12 Anime Stickers →</span>
              </Link>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
