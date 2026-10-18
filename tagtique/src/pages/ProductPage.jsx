import React, { useEffect, useState, useRef } from 'react';
import { Link, useParams } from 'react-router-dom';
import { findProduct, allProducts } from '../data/editions';
import { SETUP_STEPS, SETUP_SUMMARY } from '../data/setupGuide';
import StickerArt from '../components/StickerArt';
import {
  Sparkles,
  ShieldCheck,
  Zap,
  Truck,
  Smartphone,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  X,
  Star,
  ArrowRight,
  HelpCircle,
  Layers,
  ChevronDown,
  ExternalLink
} from 'lucide-react';

const USES = [
  { title: 'Laptops & MacBooks', text: 'Sticks smooth and flat on aluminium or plastic lids, keeping your contact scannable everywhere.' },
  { title: 'Motorcycle & Bike Helmets', text: 'Curved and weatherproof. Vital for emergency identification on the road.' },
  { title: 'Backpacks & Handbags', text: 'Luggage tags, gear cases, and bags so finders can reach you before your item is lost.' },
  { title: 'Cars & Motorbikes', text: 'Exterior panels or rear glass. Withstands intense sun, rain, and pressure car washes.' },
  { title: 'Headphones & Consoles', text: 'AirPods cases, gaming gear, and tech accessories that get misplaced in cafes or gyms.' },
  { title: 'Bottles & Belongings', text: 'Waterproof acrylic layer ensures zero peeling or fading from moisture or washing.' }
];

const USE_STEPS = [
  { n: '01', title: 'Finder Scans With Phone', text: 'Anyone who discovers your item scans the sticker with their standard phone camera — no app needed.' },
  { n: '02', title: 'Instant Online Page', text: 'If they have cellular data or Wi-Fi, your private contact card opens with 1-tap Call and WhatsApp.' },
  { n: '03', title: 'Offline Fallback Call', text: 'Without internet, the phone dialer launches automatically with your saved number so you never lose contact.' }
];

const PRODUCT_FAQS = [
  {
    q: 'How does the emergency contact QR work?',
    a: 'When someone scans the QR code with their mobile camera, it instantly routes to your private Tagtique profile. From there, the finder can tap to call you directly or message you on WhatsApp. If they have no internet connection, it automatically dials your saved phone number offline.'
  },
  {
    q: 'Is the sticker truly weatherproof and waterproof?',
    a: 'Yes. Every Tagtique sticker is manufactured using heavy-duty UV-cured acrylic vinyl with an industrial scratch-resistant laminate. It withstands direct Pakistani summer sunlight, heavy monsoon rain, and high-pressure vehicle washing without peeling or fading.'
  },
  {
    q: 'Can I change my phone number after buying?',
    a: 'Yes! The QR code points to your unique Tagtique identity. You can update your contact phone number, emergency message, and WhatsApp preferences anytime without having to replace the physical sticker.'
  },
  {
    q: 'Does Tagtique track my GPS location?',
    a: 'No. Tagtique is strictly a smart privacy identification tag, not a battery-draining GPS tracker. It protects your privacy by keeping your phone number masked until someone physically scans the code.'
  },
  {
    q: 'How easy is the initial activation?',
    a: 'It takes under 60 seconds. Simply scan the sticker with your phone, enter your phone number on the setup screen, tap Assign, and your tag is permanently activated.'
  }
];

function packageForQuantity(quantity) {
  if (quantity <= 1) return 'single';
  if (quantity === 2) return 'pack2';
  return 'pack3';
}

function priceForQuantity(quantity) {
  if (quantity <= 1) return 999;
  if (quantity === 2) return 1499;
  return 1999;
}

export default function ProductPage() {
  const { slug } = useParams();
  const product = findProduct(slug);

  const [quantity, setQuantity] = useState(1);
  const [zoom, setZoom] = useState(false);
  const [activeFaq, setActiveFaq] = useState(null);

  // Parallax tilt on main showcase card
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  // Related products carousel ref
  const carouselRef = useRef(null);

  // All other related stickers for the bottom carousel
  const relatedProducts = allProducts().filter((p) => p.slug !== slug);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [slug]);

  useEffect(() => {
    if (!zoom) return undefined;
    const onKey = (event) => {
      if (event.key === 'Escape') setZoom(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [zoom]);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: x * 14, y: -y * 14 });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

  const scrollCarousel = (direction) => {
    if (!carouselRef.current) return;
    const scrollAmount = 300 * direction;
    carouselRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  };

  if (!product) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 py-20 text-center bg-[#0B0B0E] text-white">
        <h1 className="font-manrope font-extrabold text-3xl">Sticker Not Found</h1>
        <p className="mt-3 text-white/60">The requested sticker design could not be found.</p>
        <Link
          to="/#shop"
          className="mt-6 px-6 py-3 rounded-full bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-sm transition-all"
        >
          Return to Shop
        </Link>
      </div>
    );
  }

  const orderHref = `/order?edition=${product.editionId}&style=${product.id}&package=${packageForQuantity(quantity)}`;
  const currentPrice = priceForQuantity(quantity);

  return (
    <article className="min-h-screen bg-[#08090D] text-white pb-24 selection:bg-amber-400 selection:text-black">
      {/* Top Ambient Glow Banner */}
      <div className="w-full bg-gradient-to-r from-amber-500/10 via-purple-500/10 to-amber-500/10 border-b border-white/10 py-2.5 px-4 text-center">
        <p className="text-xs font-bold text-white/80 tracking-wide flex items-center justify-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
          <span>Free Nationwide Delivery & Cash on Delivery across Pakistan</span>
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
        
        {/* ================= BREADCRUMBS ================= */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs font-semibold text-white/50 mb-6 flex-wrap">
          <Link to="/" className="hover:text-white transition-colors">Home</Link>
          <span>/</span>
          <Link to="/#shop" className="hover:text-white transition-colors">Stickers</Link>
          <span>/</span>
          <span className="capitalize">{product.editionName} Edition</span>
          <span>/</span>
          <span className="text-white font-bold">{product.name}</span>
        </nav>

        {/* ================= HERO PRODUCT SECTION (2-COL) ================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* ================= LEFT: 3D INTERACTIVE STICKER SHOWCASE ================= */}
          <div className="lg:col-span-6 flex flex-col items-center">
            
            {/* Main Stage Card */}
            <div
              className="w-full max-w-[500px] aspect-[4/5] rounded-[36px] bg-gradient-to-b from-[#181822] via-[#12131A] to-[#0A0B0E] border border-white/15 p-6 sm:p-10 flex flex-col items-center justify-center relative shadow-[0_20px_50px_rgba(0,0,0,0.6)] overflow-hidden group cursor-pointer"
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              onClick={() => setZoom(true)}
              style={{ perspective: '1000px' }}
            >
              {/* Dynamic Aura Glow matching character palette */}
              <div
                className="absolute inset-0 opacity-20 group-hover:opacity-35 transition-opacity duration-500 blur-3xl pointer-events-none"
                style={{ backgroundColor: product.swatch || '#F59E0B' }}
              />

              {/* Background Subtle Tech Rings */}
              <div className="absolute w-[360px] h-[360px] rounded-full border border-white/[0.04] pointer-events-none" />
              <div className="absolute w-[240px] h-[240px] rounded-full border border-dashed border-white/[0.06] pointer-events-none animate-[spin_80s_linear_infinite]" />

              {/* Top Floating Badge */}
              <div className="absolute top-5 left-5 z-20 flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#13141D]/90 backdrop-blur-md border border-white/15 shadow-md text-[11px] font-bold text-white uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Original Collectible</span>
              </div>

              {/* Top Right Zoom Hint Button */}
              <div className="absolute top-5 right-5 z-20 w-9 h-9 rounded-full bg-[#13141D]/90 backdrop-blur-md border border-white/15 shadow-md flex items-center justify-center text-white/70 group-hover:text-white group-hover:scale-110 transition-all">
                <ZoomIn className="w-4 h-4" />
              </div>

              {/* 3D Floating Sticker Image */}
              <div
                className="relative z-10 w-full h-full max-h-[380px] flex items-center justify-center transition-transform duration-200 ease-out"
                style={{
                  transform: `rotateX(${tilt.y}deg) rotateY(${tilt.x}deg) scale(1.02)`,
                  transformStyle: 'preserve-3d'
                }}
              >
                {product.image ? (
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-contain drop-shadow-[0_20px_35px_rgba(0,0,0,0.5)] select-none transition-transform duration-300 group-hover:scale-105"
                    draggable={false}
                  />
                ) : (
                  <div className="w-[240px] aspect-[230/341]">
                    <StickerArt product={product} />
                  </div>
                )}
              </div>

              {/* Ground Pedestal Shadow */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-48 h-6 bg-[radial-gradient(ellipse,rgba(0,0,0,0.8)_0%,transparent_70%)] blur-md pointer-events-none" />

              {/* Bottom Inspect Hint */}
              <div className="absolute bottom-4 z-20 text-[11px] font-semibold text-white/40 tracking-wide flex items-center gap-1">
                <span>Click image to view in high definition</span>
              </div>
            </div>

            {/* Feature Pills under the sticker */}
            <div className="w-full max-w-[500px] grid grid-cols-3 gap-2.5 mt-4">
              <div className="p-3 rounded-2xl bg-[#12131A] border border-white/10 shadow-sm text-center">
                <ShieldCheck className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
                <span className="text-[11px] font-bold text-white/90 block">UV & Rainproof</span>
                <span className="text-[10px] text-white/50">Multi-Year Outdoor</span>
              </div>
              <div className="p-3 rounded-2xl bg-[#12131A] border border-white/10 shadow-sm text-center">
                <Zap className="w-4 h-4 text-amber-400 mx-auto mb-1" />
                <span className="text-[11px] font-bold text-white/90 block">Direct Dial Call</span>
                <span className="text-[10px] text-white/50">Works Without Data</span>
              </div>
              <div className="p-3 rounded-2xl bg-[#12131A] border border-white/10 shadow-sm text-center">
                <Smartphone className="w-4 h-4 text-purple-400 mx-auto mb-1" />
                <span className="text-[11px] font-bold text-white/90 block">Universal Scan</span>
                <span className="text-[10px] text-white/50">iPhone & Android</span>
              </div>
            </div>
          </div>

          {/* ================= RIGHT: PRODUCT DETAILS & PURCHASING ================= */}
          <div className="lg:col-span-6 flex flex-col">
            <div className="bg-[#12131A] rounded-[36px] border border-white/10 p-6 sm:p-9 shadow-2xl">
              
              {/* Category & Status Row */}
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-xs font-extrabold uppercase tracking-widest text-white/80">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: product.swatch || '#F59E0B' }} />
                  <span>{product.editionName} Collection</span>
                </span>
                
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 bg-emerald-500/15 px-3 py-1 rounded-full border border-emerald-500/30">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>In Stock · Ships in 24h</span>
                </span>
              </div>

              {/* Main Title & Rating */}
              <h1 className="font-manrope font-extrabold text-3xl sm:text-4xl lg:text-5xl tracking-tight text-white mt-3">
                {product.name} QR Sticker
              </h1>

              <div className="flex items-center gap-3 mt-2.5">
                <div className="flex items-center text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <span className="text-xs font-bold text-white/90">4.9/5</span>
                <span className="text-xs text-white/40">·</span>
                <span className="text-xs font-medium text-white/60">180+ verified Pakistan orders</span>
              </div>

              {/* Tagline */}
              <p className="mt-3 text-sm sm:text-base font-semibold text-white/80">
                {product.line}
              </p>

              {/* Short Value Description */}
              <p className="mt-2 text-xs sm:text-sm text-white/60 leading-relaxed">
                Premium die-cut vinyl emergency identity sticker. When scanned, it instantly launches your private contact card or direct phone dialer so lost items find their way back to you.
              </p>

              {/* Price Block */}
              <div className="mt-6 pt-5 border-t border-white/10 flex items-baseline justify-between">
                <div>
                  <span className="text-[11px] font-bold text-white/40 uppercase tracking-widest block">Official Price</span>
                  <div className="flex items-baseline gap-2 mt-0.5">
                    <span className="font-manrope font-extrabold text-3xl sm:text-4xl text-white">
                      PKR {currentPrice.toLocaleString('en-PK')}
                    </span>
                    {quantity > 1 && (
                      <span className="text-xs font-bold text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-md">
                        {quantity === 2 ? 'Save PKR 499' : 'Save PKR 998'}
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-bold text-white/70">Free Shipping</span>
                  <span className="text-[10px] text-white/40 block">Cash on Delivery</span>
                </div>
              </div>

              {/* ================= BUNDLE PACKAGE SELECTOR TILES ================= */}
              <div className="mt-6">
                <span className="text-xs font-extrabold text-white/80 uppercase tracking-wider block mb-2.5">
                  Select Quantity & Save:
                </span>

                <div className="grid grid-cols-3 gap-2.5">
                  {/* Single Tile */}
                  <button
                    type="button"
                    onClick={() => setQuantity(1)}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer relative ${
                      quantity === 1
                        ? 'border-amber-400 bg-amber-400 text-black shadow-lg font-bold'
                        : 'border-white/10 bg-[#161822] hover:border-white/30 text-white'
                    }`}
                  >
                    <span className={`text-[11px] font-bold block ${quantity === 1 ? 'text-black/70' : 'text-white/60'}`}>Single Tag</span>
                    <span className="font-extrabold text-sm block mt-0.5">1 Sticker</span>
                    <span className="text-xs font-bold block mt-1">PKR 999</span>
                  </button>

                  {/* 2-Pack Tile */}
                  <button
                    type="button"
                    onClick={() => setQuantity(2)}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer relative ${
                      quantity === 2
                        ? 'border-amber-400 bg-amber-400 text-black shadow-lg font-bold'
                        : 'border-white/10 bg-[#161822] hover:border-white/30 text-white'
                    }`}
                  >
                    <span className="absolute -top-2 right-2 px-1.5 py-0.5 rounded-full bg-amber-500 text-black text-[9px] font-extrabold uppercase">
                      Popular
                    </span>
                    <span className={`text-[11px] font-bold block ${quantity === 2 ? 'text-black/70' : 'text-white/60'}`}>2-Pack</span>
                    <span className="font-extrabold text-sm block mt-0.5">2 Stickers</span>
                    <span className="text-xs font-bold block mt-1">PKR 1,499</span>
                  </button>

                  {/* 3-Pack Tile */}
                  <button
                    type="button"
                    onClick={() => setQuantity(3)}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer relative ${
                      quantity === 3
                        ? 'border-amber-400 bg-amber-400 text-black shadow-lg font-bold'
                        : 'border-white/10 bg-[#161822] hover:border-white/30 text-white'
                    }`}
                  >
                    <span className="absolute -top-2 right-2 px-1.5 py-0.5 rounded-full bg-emerald-400 text-black text-[9px] font-extrabold uppercase">
                      Best Value
                    </span>
                    <span className={`text-[11px] font-bold block ${quantity === 3 ? 'text-black/70' : 'text-white/60'}`}>3-Pack</span>
                    <span className="font-extrabold text-sm block mt-0.5">3 Stickers</span>
                    <span className="text-xs font-bold block mt-1">PKR 1,999</span>
                  </button>
                </div>
              </div>

              {/* ================= PRIMARY ACTION BUTTONS ================= */}
              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <Link
                  to={orderHref}
                  className="flex-1 py-4 px-6 rounded-2xl bg-white hover:bg-zinc-100 active:scale-[0.99] text-black font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg transition-all group/btn"
                >
                  <span>Proceed to Order ({quantity})</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                </Link>

                <a
                  href={`https://wa.me/923292082080?text=Hi%20Tagtique!%20I%20want%20to%20order%20the%20${product.name}%20QR%20sticker.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-4 px-5 rounded-2xl bg-[#25D366]/15 hover:bg-[#25D366]/25 border border-[#25D366]/40 text-[#25D366] font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
                >
                  <span>WhatsApp Order</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>

              {/* Guarantees List */}
              <div className="mt-6 pt-5 border-t border-white/10 flex flex-col gap-2.5 text-xs text-white/70">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span><strong className="text-white">Zero monthly fees:</strong> One-time purchase, free lifetime routing.</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span><strong className="text-white">High-density scannability:</strong> Readable by any standard smartphone camera.</span>
                </div>
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-amber-400 shrink-0" />
                  <span><strong className="text-white">Cash on Delivery:</strong> Pay at your doorstep anywhere in Pakistan.</span>
                </div>
              </div>

            </div>
          </div>

        </div>

        {/* ========================================================================= */}
        {/* ================= BENEATH: ATTRACTIVE CAROUSEL OF OTHER PRODUCTS ======= */}
        {/* ========================================================================= */}
        <section className="mt-16 sm:mt-20">
          <div className="bg-[#12131A] rounded-[36px] border border-white/10 p-6 sm:p-10 shadow-2xl relative overflow-hidden">
            
            {/* Header with Slider Navigation Controls */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-extrabold uppercase tracking-wider mb-2">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Complete Your Collection</span>
                </div>
                <h2 className="font-manrope font-extrabold text-2xl sm:text-3xl text-white tracking-tight">
                  Explore Other Collectibles
                </h2>
                <p className="mt-1 text-xs sm:text-sm text-white/60 max-w-lg">
                  Every character features a custom emergency QR code. Collect them for all your helmets, bags, and devices.
                </p>
              </div>

              {/* Carousel Stepper Buttons */}
              <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                <button
                  type="button"
                  onClick={() => scrollCarousel(-1)}
                  className="w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 border border-white/15 flex items-center justify-center text-white transition-all cursor-pointer shadow-md"
                  aria-label="Previous stickers"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={() => scrollCarousel(1)}
                  className="w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 border border-white/15 flex items-center justify-center text-white transition-all cursor-pointer shadow-md"
                  aria-label="Next stickers"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Horizontal Track of Collectible Cards */}
            <div
              ref={carouselRef}
              className="flex gap-5 overflow-x-auto pb-4 pt-1 snap-x snap-mandatory scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              {relatedProducts.map((other) => (
                <Link
                  key={other.slug}
                  to={`/product/${other.slug}`}
                  className="snap-start shrink-0 w-[210px] sm:w-[240px] rounded-[26px] bg-[#161722] border border-white/10 p-4 flex flex-col justify-between hover:shadow-2xl hover:border-white/25 transition-all duration-300 hover:-translate-y-1.5 group cursor-pointer relative overflow-hidden"
                >
                  {/* Subtle Top Swatch Tag */}
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-white/50">
                      {other.editionName}
                    </span>
                    <span className="font-mono text-[11px] font-bold text-white/60">
                      PKR {other.pricePkr}
                    </span>
                  </div>

                  {/* Character Artwork Stage with Dynamic Glow */}
                  <div
                    className="w-full aspect-[230/280] rounded-2xl flex items-center justify-center p-3 relative overflow-hidden transition-transform duration-300 group-hover:scale-105"
                    style={{
                      background: `linear-gradient(180deg, ${other.swatch}20 0%, ${other.swatch}08 100%)`
                    }}
                  >
                    {/* Ambient Glow */}
                    <div
                      className="absolute inset-0 opacity-0 group-hover:opacity-40 transition-opacity duration-300 pointer-events-none blur-xl"
                      style={{ backgroundColor: other.swatch || '#F59E0B' }}
                    />

                    {other.image ? (
                      <img
                        src={other.image}
                        alt={other.name}
                        className="w-full h-full object-contain drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)] select-none"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <StickerArt product={other} />
                      </div>
                    )}
                  </div>

                  {/* Card Bottom Meta */}
                  <div className="mt-3.5 flex flex-col">
                    <h3 className="font-manrope font-extrabold text-base text-white group-hover:text-amber-400 transition-colors">
                      {other.name.toUpperCase()}
                    </h3>
                    <p className="text-[11px] text-white/50 mt-0.5 line-clamp-1">
                      {other.line}
                    </p>

                    {/* View Sticker Button */}
                    <div className="mt-3 w-full py-2.5 rounded-xl bg-white hover:bg-zinc-100 text-black font-extrabold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md group-hover:bg-amber-400 group-hover:text-black">
                      <span>View Design</span>
                      <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>

          </div>
        </section>

        {/* ================= USE CASES SECTION ================= */}
        <section className="mt-16 sm:mt-20">
          <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-12">
            <span className="text-xs font-extrabold uppercase tracking-widest text-white/45">Versatile Placement</span>
            <h2 className="font-manrope font-extrabold text-3xl sm:text-4xl text-white tracking-tight mt-1">
              Where can you stick it?
            </h2>
            <p className="mt-2 text-sm text-white/60">
              Manufactured with high-adhesion 3M-grade acrylic backings designed for smooth surfaces.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {USES.map((item, idx) => (
              <div
                key={item.title}
                className="bg-[#12131A] rounded-[24px] border border-white/10 p-6 shadow-md hover:border-white/25 transition-all"
              >
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-extrabold text-white/80 mb-3">
                  0{idx + 1}
                </div>
                <h3 className="font-manrope font-extrabold text-lg text-white">{item.title}</h3>
                <p className="mt-1.5 text-xs sm:text-sm text-white/60 leading-relaxed">{item.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ================= HOW IT WORKS SECTION ================= */}
        <section className="mt-16 sm:mt-20">
          <div className="bg-[#101014] text-white rounded-[36px] p-8 sm:p-12 relative overflow-hidden border border-white/10 shadow-2xl">
            {/* Ambient Background Glow */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 max-w-2xl mb-10">
              <span className="text-xs font-extrabold uppercase tracking-widest text-purple-400">Emergency Protocol</span>
              <h2 className="font-manrope font-extrabold text-3xl sm:text-4xl text-white tracking-tight mt-1">
                How scanning helps return your item
              </h2>
              <p className="mt-2 text-sm text-white/60">
                A simple 3-step contact bridge that protects your privacy while keeping you reachable 24/7.
              </p>
            </div>

            <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-6">
              {USE_STEPS.map((step) => (
                <div key={step.n} className="p-6 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-md">
                  <span className="font-mono text-xs font-bold text-purple-400">{step.n}</span>
                  <h3 className="font-manrope font-extrabold text-xl text-white mt-2">{step.title}</h3>
                  <p className="mt-2 text-xs sm:text-sm text-white/60 leading-relaxed">{step.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ================= FREQUENTLY ASKED QUESTIONS ================= */}
        <section className="mt-16 sm:mt-20 max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <span className="text-xs font-extrabold uppercase tracking-widest text-white/45">Got Questions?</span>
            <h2 className="font-manrope font-extrabold text-3xl sm:text-4xl text-white tracking-tight mt-1">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-3">
            {PRODUCT_FAQS.map((faq, idx) => {
              const isOpen = activeFaq === idx;
              return (
                <div
                  key={faq.q}
                  className="bg-[#12131A] rounded-2xl border border-white/10 overflow-hidden transition-all shadow-md"
                >
                  <button
                    type="button"
                    onClick={() => setActiveFaq(isOpen ? null : idx)}
                    className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-sm sm:text-base text-white cursor-pointer hover:bg-white/[0.04]"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown className={`w-4 h-4 text-white/40 transition-transform ${isOpen ? 'rotate-180 text-amber-400' : ''}`} />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 text-xs sm:text-sm text-white/65 leading-relaxed border-t border-white/10 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

      </div>

      {/* ================= ENLARGE LIGHTBOX MODAL ================= */}
      {zoom && (
        <div
          className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6"
          onClick={() => setZoom(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label={`${product.name} High Definition Preview`}
            className="bg-[#12131A] border border-white/15 text-white rounded-[32px] max-w-lg w-full p-6 sm:p-8 flex flex-col items-center relative shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setZoom(false)}
              className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/70 hover:text-white transition-all cursor-pointer"
              aria-label="Close dialog"
            >
              <X className="w-5 h-5" />
            </button>

            <span className="text-xs font-bold uppercase tracking-wider text-white/45 mb-1">
              {product.editionName} Edition
            </span>
            <h3 className="font-manrope font-extrabold text-2xl text-white">
              {product.name}
            </h3>

            <div className="my-6 w-full aspect-[4/5] max-h-[420px] flex items-center justify-center">
              {product.image ? (
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-contain drop-shadow-[0_20px_35px_rgba(0,0,0,0.5)]"
                />
              ) : (
                <StickerArt product={product} />
              )}
            </div>

            <div className="w-full flex items-center justify-between pt-4 border-t border-white/10">
              <span className="font-manrope font-extrabold text-xl text-white">
                PKR {currentPrice}
              </span>
              <Link
                to={orderHref}
                className="px-6 py-2.5 rounded-full bg-white hover:bg-zinc-100 text-black font-extrabold text-sm flex items-center gap-2"
                onClick={() => setZoom(false)}
              >
                <span>Buy This Design</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </article>
  );
}
