import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, ShieldCheck, Zap, ChevronLeft, ChevronRight, Eye, CheckCircle2 } from 'lucide-react';

// The 11 collectible designs with product slugs matching editions.js
const OTHER_DESIGNS = [
  {
    id: 'panda',
    slug: 'cute-panda',
    name: 'Panda',
    line: 'Green · Calm · Cute',
    category: 'animals',
    tag: 'Bamboo Series',
    price: 999,
    src: '/assets/stickers/designed/Panda.png',
    bgGradient: 'from-emerald-500/10 via-teal-500/5 to-emerald-500/15',
    glowColor: 'rgba(16, 185, 129, 0.3)',
    accentBorder: 'hover:border-emerald-400/50',
    tagClass: 'bg-emerald-50 text-emerald-700 border-emerald-200'
  },
  {
    id: 'strawberry',
    slug: 'cute-berry',
    name: 'Berry',
    line: 'Rose · Sweet · Cute',
    category: 'chibi',
    tag: 'Sweet Berries',
    price: 999,
    src: '/assets/stickers/designed/Strawberry.png',
    bgGradient: 'from-rose-500/10 via-pink-500/5 to-red-500/15',
    glowColor: 'rgba(244, 63, 94, 0.3)',
    accentBorder: 'hover:border-rose-400/50',
    tagClass: 'bg-rose-50 text-rose-700 border-rose-200'
  },
  {
    id: 'frog',
    slug: 'cute-frog',
    name: 'Frog',
    line: 'Leaf · Happy · Cute',
    category: 'animals',
    tag: 'Rainforest Leap',
    price: 999,
    src: '/assets/stickers/designed/Frog.png',
    bgGradient: 'from-lime-500/10 via-emerald-500/5 to-green-500/15',
    glowColor: 'rgba(132, 204, 22, 0.3)',
    accentBorder: 'hover:border-lime-400/50',
    tagClass: 'bg-lime-50 text-lime-700 border-lime-200'
  },
  {
    id: 'witch-cat',
    slug: 'cute-whisk',
    name: 'Whisk',
    line: 'Violet · Night · Magic',
    category: 'chibi',
    tag: 'Midnight Mystic',
    price: 999,
    src: '/assets/stickers/designed/Witch_Cat.png',
    bgGradient: 'from-purple-500/10 via-violet-500/5 to-indigo-500/15',
    glowColor: 'rgba(168, 85, 247, 0.3)',
    accentBorder: 'hover:border-purple-400/50',
    tagClass: 'bg-purple-50 text-purple-700 border-purple-200'
  },
  {
    id: 'pink-cat',
    slug: 'cute-mimi',
    name: 'Mimi',
    line: 'Pink · Playful · Cute',
    category: 'animals',
    tag: 'Playful Paw',
    price: 999,
    src: '/assets/stickers/designed/Pink_Cat.png',
    bgGradient: 'from-pink-500/10 via-rose-500/5 to-purple-500/15',
    glowColor: 'rgba(236, 72, 153, 0.3)',
    accentBorder: 'hover:border-pink-400/50',
    tagClass: 'bg-pink-50 text-pink-700 border-pink-200'
  },
  {
    id: 'shiba',
    slug: 'cute-scout',
    name: 'Shiba',
    line: 'Amber · Loyal · Cheerful',
    category: 'animals',
    tag: 'Loyal Scout',
    price: 999,
    src: '/assets/stickers/designed/Shiba.png',
    bgGradient: 'from-amber-500/10 via-orange-500/5 to-yellow-500/15',
    glowColor: 'rgba(245, 158, 11, 0.3)',
    accentBorder: 'hover:border-amber-400/50',
    tagClass: 'bg-amber-50 text-amber-700 border-amber-200'
  },
  {
    id: 'bear',
    slug: 'cute-cub',
    name: 'Bear',
    line: 'Honey · Warm · Friendly',
    category: 'animals',
    tag: 'Honey Cub',
    price: 999,
    src: '/assets/stickers/designed/Bear.png',
    bgGradient: 'from-orange-500/10 via-amber-500/5 to-yellow-500/15',
    glowColor: 'rgba(251, 146, 60, 0.3)',
    accentBorder: 'hover:border-orange-400/50',
    tagClass: 'bg-orange-50 text-orange-700 border-orange-200'
  },
  {
    id: 'blue-headphones',
    slug: 'cute-beat',
    name: 'Beat',
    line: 'Cyan · Chill · Beats',
    category: 'chibi',
    tag: 'Lo-Fi Chill',
    price: 999,
    src: '/assets/stickers/designed/Blue_Headphones.png',
    bgGradient: 'from-cyan-500/10 via-sky-500/5 to-blue-500/15',
    glowColor: 'rgba(14, 165, 233, 0.3)',
    accentBorder: 'hover:border-sky-400/50',
    tagClass: 'bg-sky-50 text-sky-700 border-sky-200'
  },
  {
    id: 'purple-bunny',
    slug: 'cute-bun',
    name: 'Bunny',
    line: 'Lavender · Soft · Dreamy',
    category: 'animals',
    tag: 'Dreamy Bun',
    price: 999,
    src: '/assets/stickers/designed/Purple_Bunny.png',
    bgGradient: 'from-violet-500/10 via-purple-500/5 to-pink-500/15',
    glowColor: 'rgba(139, 92, 246, 0.3)',
    accentBorder: 'hover:border-violet-400/50',
    tagClass: 'bg-violet-50 text-violet-700 border-violet-200'
  },
  {
    id: 'teal-twintail',
    slug: 'cute-star',
    name: 'Miku',
    line: 'Aqua · Anime · Cyber Pop',
    category: 'chibi',
    tag: 'Cyber Diva',
    price: 999,
    src: '/assets/stickers/designed/Teal_Twintail.png',
    bgGradient: 'from-teal-500/10 via-cyan-500/5 to-emerald-500/15',
    glowColor: 'rgba(20, 184, 166, 0.3)',
    accentBorder: 'hover:border-teal-400/50',
    tagClass: 'bg-teal-50 text-teal-700 border-teal-200'
  },
  {
    id: 'red-helmet',
    slug: 'cute-dash',
    name: 'Rider',
    line: 'Ruby · Fast · Bold',
    category: 'chibi',
    tag: 'Neon Velocity',
    price: 999,
    src: '/assets/stickers/designed/Red_Helmet.png',
    bgGradient: 'from-red-500/10 via-rose-500/5 to-amber-500/15',
    glowColor: 'rgba(239, 68, 68, 0.3)',
    accentBorder: 'hover:border-red-400/50',
    tagClass: 'bg-red-50 text-red-700 border-red-200'
  }
];

export default function MascotSection({ mascotAnchorRef, isDocked = false }) {
  const containerRef = useRef(null);
  const sliderRef = useRef(null);

  // 3D Scroll progress tracking for Cool Boy mascot
  const [scrollProgress, setScrollProgress] = useState(0);

  // Mouse parallax tilt for mascot
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  // Filter category tab: 'all' | 'animals' | 'chibi'
  const [activeCategory, setActiveCategory] = useState('all');

  // Filtered designs
  const filteredDesigns = activeCategory === 'all'
    ? OTHER_DESIGNS
    : OTHER_DESIGNS.filter((d) => d.category === activeCategory);

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      const totalDist = windowHeight + rect.height;
      const currentPos = windowHeight - rect.top;
      const rawProgress = Math.min(Math.max(currentPos / (totalDist * 0.75), 0), 1);
      setScrollProgress(rawProgress);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Parallax tilt on mouse move over mascot container
  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: x * 15, y: -y * 15 });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

  // Slider controls for right-side white box
  const slide = (direction) => {
    if (!sliderRef.current) return;
    const scrollAmount = 280 * direction;
    sliderRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  };

  // 3D scroll physics for Cool Boy
  const translateY = ((1 - scrollProgress) * -50).toFixed(1);
  const rotateX = ((1 - scrollProgress) * 16 + tilt.y).toFixed(1);
  const rotateY = ((1 - scrollProgress) * -10 + tilt.x).toFixed(1);
  const mascotScale = (0.92 + scrollProgress * 0.08).toFixed(3);
  const mascotOpacity = Math.min(scrollProgress * 1.5, 1).toFixed(2);

  return (
    <section
      id="mascot-section"
      ref={containerRef}
      className="w-full bg-[#08080B] text-white py-14 sm:py-20 lg:py-24 relative overflow-hidden border-t border-b border-white/[0.08]"
    >
      {/* Studio Lighting - Soft Atmospheric Ambient Glows */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-40 left-1/4 w-[650px] h-[550px] bg-[radial-gradient(circle,rgba(139,92,246,0.14)_0%,transparent_70%)] blur-3xl" />
        <div className="absolute -bottom-40 right-1/4 w-[650px] h-[550px] bg-[radial-gradient(circle,rgba(245,178,31,0.09)_0%,transparent_70%)] blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.02)_0%,transparent_80%)]" />
      </div>



      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* ================= TOP LEFT: MASCOT EDITION HEADER ================= */}
        <div className="mb-8 sm:mb-10 text-left">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-extrabold uppercase tracking-widest mb-3 shadow-[0_0_15px_rgba(168,85,247,0.12)]">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>Featured Mascot Edition</span>
          </div>
          <h2 className="font-manrope font-extrabold text-3xl sm:text-4xl lg:text-5xl text-white tracking-tight uppercase leading-[0.95]">
            Mascot Edition.
          </h2>
          <p className="mt-2 text-sm sm:text-base text-white/60 max-w-xl leading-relaxed">
            Cyber Chibi design with shades and headphones. Connects finders instantly when scanned.
          </p>
        </div>

        {/* Main Grid: Left Mascot Showcase + Right White Box Gallery */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-stretch">
          
          {/* ================= LEFT SIDE: MASCOT CONTAINER (CLEAN & UNIQUE) ================= */}
          <div
            className="lg:col-span-5 rounded-[36px] bg-gradient-to-b from-[#131317] via-[#0E0E12] to-[#0A0A0C] border border-white/[0.08] p-6 sm:p-8 flex flex-col justify-between shadow-[inset_0_1px_1px_rgba(255,255,255,0.12),0_25px_60px_rgba(0,0,0,0.65)] relative overflow-hidden group backdrop-blur-2xl"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            {/* Subtle Texture Inside Black Pill: Fine Carbon/Matte Perforation */}
            <div
              className="absolute inset-0 pointer-events-none opacity-20"
              style={{
                backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.12) 1px, transparent 1px)',
                backgroundSize: '16px 16px'
              }}
            />

            {/* Subtle Studio Spotlight behind mascot */}
            <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-[radial-gradient(circle,rgba(168,85,247,0.18)_0%,transparent_70%)] blur-2xl pointer-events-none" />

            {/* Mascot Inner Header with Clean Badge */}
            <div className="relative z-10 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-purple-400 tracking-wider uppercase block">
                  Signature Series 01
                </span>
                <h3 className="font-manrope font-extrabold text-2xl sm:text-3xl text-white tracking-tight leading-tight mt-0.5">
                  Cool Boy QR.
                </h3>
              </div>
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.05] border border-white/10 text-[11px] font-medium text-white/70 backdrop-blur-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Ready to Scan</span>
              </div>
            </div>

            {/* 3D Floating Mascot Display */}
            <div
              ref={mascotAnchorRef}
              className="my-6 relative h-[280px] sm:h-[310px] flex items-center justify-center cursor-pointer z-10"
              style={{ perspective: '1000px' }}
            >
              {/* Soft Frosted Pedestal Shadow */}
              <div 
                className="absolute bottom-2 left-1/2 -translate-x-1/2 w-44 h-7 bg-[radial-gradient(ellipse,rgba(168,85,247,0.35)_0%,rgba(0,0,0,0.6)_50%,transparent_75%)] blur-md pointer-events-none transition-opacity duration-300" 
                style={{ opacity: isDocked ? 1 : 0.4 }}
              />

              {/* 3D Animated Mascot Image (renders docked here when isDocked is true) */}
              {isDocked && (
                <div
                  className="relative will-change-transform transition-transform duration-200 ease-out flex items-center justify-center"
                  style={{
                    transform: `translate3d(0, 0, 0) scale(1) rotateX(${tilt.y}deg) rotateY(${tilt.x}deg)`,
                    transformStyle: 'preserve-3d'
                  }}
                >
                  <img
                    src="/assets/stickers/designed/Gray_Sunglasses.png"
                    alt="Cool Boy QR Mascot"
                    className="w-[190px] sm:w-[220px] max-h-[270px] h-auto object-contain select-none pointer-events-none"
                    style={{
                      filter: `
                        drop-shadow(0 2px 3px rgba(255,255,255,0.75))
                        drop-shadow(0 18px 30px rgba(0,0,0,0.55))
                        drop-shadow(0 6px 18px rgba(139,92,246,0.3))
                      `
                    }}
                    draggable={false}
                  />

                  {/* Ambient Specular Light Sheen */}
                  <div className="absolute inset-0 pointer-events-none rounded-3xl opacity-20 bg-gradient-to-tr from-transparent via-white to-transparent" />
                </div>
              )}
            </div>

            {/* Mascot Specs & Direct Product Link */}
            <div className="flex flex-col gap-4 relative z-10">
              <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-white/75">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/[0.06] border border-white/10 backdrop-blur-md">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  UV & Weatherproof Vinyl
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/[0.06] border border-white/10 backdrop-blur-md">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  Instant Cellular Call
                </span>
              </div>

              <div className="flex items-center justify-between gap-3 pt-3 border-t border-white/10">
                <div>
                  <span className="text-[10px] text-white/50 uppercase tracking-widest block font-bold">Price</span>
                  <span className="font-manrope font-extrabold text-2xl text-white">PKR 999</span>
                </div>

                <Link
                  to="/product/cute-shade"
                  className="px-6 py-3 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-black font-extrabold text-sm flex items-center gap-2 shadow-[0_10px_25px_rgba(245,178,31,0.3)] transition-all hover:scale-105 active:scale-95 group/btn"
                >
                  <span>Order Cool Boy</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-0.5" />
                </Link>
              </div>
            </div>
          </div>

          {/* ================= RIGHT SIDE: REDESIGNED WHITE BOX VAULT ================= */}
          <div className="lg:col-span-7 rounded-[32px] bg-white text-black p-6 sm:p-8 flex flex-col justify-between shadow-[0_30px_70px_rgba(0,0,0,0.6)] border border-black/[0.08] relative overflow-hidden">
            
            {/* ================= TOP HEADER & CONTROLS ================= */}
            <div className="relative z-10 mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/5 text-black/75 text-xs font-bold uppercase tracking-wider mb-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    <span>{OTHER_DESIGNS.length} Collectible Designs</span>
                  </div>
                  <h3 className="font-manrope font-extrabold text-2xl sm:text-3xl text-black tracking-tight">
                    Collectible Sticker Vault
                  </h3>
                  <p className="mt-1 text-xs sm:text-sm text-black/60">
                    A unique character peeks over each emergency QR code. Click any sticker to view details.
                  </p>
                </div>

                {/* Slider Navigation Arrows */}
                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  <button
                    type="button"
                    onClick={() => slide(-1)}
                    className="w-10 h-10 rounded-full bg-black/5 hover:bg-black/10 active:scale-95 border border-black/10 flex items-center justify-center text-black transition-all cursor-pointer shadow-sm"
                    aria-label="Previous designs"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => slide(1)}
                    className="w-10 h-10 rounded-full bg-black/5 hover:bg-black/10 active:scale-95 border border-black/10 flex items-center justify-center text-black transition-all cursor-pointer shadow-sm"
                    aria-label="Next designs"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Category Filter Chips */}
              <div className="flex items-center gap-2 mt-4 pt-4 border-t border-black/5 overflow-x-auto [scrollbar-width:none]">
                <button
                  type="button"
                  onClick={() => setActiveCategory('all')}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-extrabold transition-all cursor-pointer ${
                    activeCategory === 'all'
                      ? 'bg-black text-white shadow-sm'
                      : 'bg-black/5 text-black/60 hover:bg-black/10'
                  }`}
                >
                  All Designs ({OTHER_DESIGNS.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveCategory('animals')}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-extrabold transition-all cursor-pointer ${
                    activeCategory === 'animals'
                      ? 'bg-black text-white shadow-sm'
                      : 'bg-black/5 text-black/60 hover:bg-black/10'
                  }`}
                >
                  🐾 Cute Animals (6)
                </button>
                <button
                  type="button"
                  onClick={() => setActiveCategory('chibi')}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-extrabold transition-all cursor-pointer ${
                    activeCategory === 'chibi'
                      ? 'bg-black text-white shadow-sm'
                      : 'bg-black/5 text-black/60 hover:bg-black/10'
                  }`}
                >
                  ⚡ Chibi & Fantasy (5)
                </button>
              </div>
            </div>

            {/* ================= REDESIGNED HORIZONTAL CARD CAROUSEL ================= */}
            <div
              ref={sliderRef}
              className="relative z-10 flex gap-4 overflow-x-auto pb-4 pt-1 snap-x snap-mandatory scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              {filteredDesigns.map((sticker) => (
                <Link
                  key={sticker.id}
                  to={`/product/${sticker.slug}`}
                  className={`snap-start shrink-0 w-[210px] sm:w-[235px] rounded-[24px] bg-white border border-black/10 p-4 flex flex-col justify-between hover:shadow-2xl transition-all duration-300 hover:-translate-y-1.5 group cursor-pointer relative overflow-hidden ${sticker.accentBorder}`}
                >
                  {/* Top Badge */}
                  <div className="flex items-center justify-between mb-2.5">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${sticker.tagClass}`}>
                      {sticker.tag}
                    </span>
                    <span className="font-mono text-[11px] font-bold text-black/40">
                      PKR {sticker.price}
                    </span>
                  </div>

                  {/* Sticker Graphic Container with Aurora Gradient */}
                  <div className={`w-full aspect-[230/280] rounded-2xl bg-gradient-to-b ${sticker.bgGradient} border border-black/5 flex items-center justify-center p-3.5 relative overflow-hidden`}>
                    {/* Ambient Glow */}
                    <div
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none blur-xl"
                      style={{ backgroundColor: sticker.glowColor }}
                    />

                    {/* Sticker Graphic with floating 3D lift */}
                    <img
                      src={sticker.src}
                      alt={sticker.name}
                      className="w-full h-full object-contain drop-shadow-[0_12px_22px_rgba(0,0,0,0.12)] select-none transition-transform duration-300 group-hover:scale-108 group-hover:-translate-y-1"
                      loading="lazy"
                    />
                  </div>

                  {/* Card Details */}
                  <div className="mt-3.5 flex flex-col">
                    <div className="flex items-center justify-between">
                      <h4 className="font-manrope font-extrabold text-base text-black tracking-tight group-hover:text-amber-600 transition-colors">
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

                    {/* Buy CTA Button (leads straight to product page) */}
                    <div className="mt-3 w-full py-2.5 rounded-xl bg-black group-hover:bg-amber-500 text-white group-hover:text-black font-extrabold text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm">
                      <span>Buy Sticker</span>
                      <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* ================= BOTTOM SPECS & CATALOG LINK ================= */}
            <div className="relative z-10 mt-4 pt-4 border-t border-black/10 flex items-center justify-between text-xs text-black/60 flex-wrap gap-2.5">
              <div className="flex items-center gap-3 flex-wrap">
                <span className="flex items-center gap-1 font-medium">
                  <span className="text-emerald-500 font-bold">✓</span> UV-Cured Acrylic Vinyl
                </span>
                <span className="flex items-center gap-1 font-medium">
                  <span className="text-emerald-500 font-bold">✓</span> Direct Emergency Call
                </span>
              </div>

              <Link
                to="/order"
                className="font-bold text-black hover:text-amber-600 underline underline-offset-4 flex items-center gap-1.5 ml-auto sm:ml-0"
              >
                <span>Browse Full Catalog</span>
                <Eye className="w-3.5 h-3.5" />
              </Link>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
