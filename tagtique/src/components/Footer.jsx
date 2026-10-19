import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Zap,
  ShieldCheck,
  CreditCard,
  Radio,
  Phone,
  Mail,
  MapPin,
  MessageCircle,
  ArrowRight,
  Send,
  Lock,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubscribed(true);
    setEmail('');
  };

  return (
    <footer id="contact" className="bg-[#050608] text-white relative overflow-hidden border-t border-white/[0.08] select-none">
      
      {/* Top Ambient Glow & Radial Spotlight */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-[radial-gradient(ellipse_at_top,rgba(245,178,31,0.06)_0%,rgba(61,220,255,0.03)_40%,transparent_70%)] pointer-events-none" />
      
      {/* Subtle Micro-dot Background Matrix */}
      <div 
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.25) 1px, transparent 1px)',
          backgroundSize: '24px 24px'
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pt-16 sm:pt-20 pb-12">

        {/* ================= 4-PILLAR HARDWARE ASSURANCE BAR ================= */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-16 pb-12 border-b border-white/[0.08]">
          {[
            {
              icon: Zap,
              color: 'text-amber-400',
              title: 'Zero Battery Required',
              desc: 'Passive NXP NTAG216 induction'
            },
            {
              icon: ShieldCheck,
              color: 'text-emerald-400',
              title: '1-Year Chip Warranty',
              desc: 'Instant replacement coverage'
            },
            {
              icon: CreditCard,
              color: 'text-cyan-400',
              title: 'Nationwide COD',
              desc: 'Cash on delivery across Pakistan'
            },
            {
              icon: Lock,
              color: 'text-purple-400',
              title: '100% Private & App-Free',
              desc: 'Zero apps required for taps'
            }
          ].map((item, i) => {
            const Icon = item.icon;
            return (
              <div 
                key={i} 
                className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.07] backdrop-blur-md flex flex-col sm:flex-row items-start sm:items-center gap-3.5 hover:border-white/20 transition-all group"
              >
                <div className="w-10 h-10 rounded-xl bg-white/[0.06] border border-white/10 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <Icon className={`w-5 h-5 ${item.color}`} />
                </div>
                <div>
                  <h4 className="font-manrope font-extrabold text-xs sm:text-sm text-white tracking-tight">
                    {item.title}
                  </h4>
                  <p className="text-[11px] text-white/50 mt-0.5">
                    {item.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* ================= VIP NEWSLETTER CONTAINER ================= */}
        <div className="mb-16 p-6 sm:p-8 lg:p-10 rounded-[32px] bg-gradient-to-r from-[#12131C] via-[#0E0F16] to-[#0A0B10] border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.6)] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-amber-400/10 via-cyan-400/5 to-transparent rounded-full blur-3xl pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            <div className="lg:col-span-7">
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-amber-400/10 text-amber-300 text-xs font-mono font-bold uppercase tracking-wider mb-3 border border-amber-400/20">
                <span>Executive Drops & Early Access</span>
              </span>
              <h3 className="font-manrope font-extrabold text-2xl sm:text-3xl lg:text-4xl text-white tracking-tight">
                Join the Tagtique Inner Circle
              </h3>
              <p className="mt-2 text-sm text-white/60 max-w-xl leading-relaxed">
                Receive private notices when limited hardware editions and bespoke NFC smart cards drop, plus member-only promotional codes inside Pakistan.
              </p>
            </div>

            <div className="lg:col-span-5">
              <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2.5">
                <div className="relative flex-1">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    className="w-full px-4 py-3.5 rounded-full bg-white/[0.05] border border-white/15 text-white placeholder-white/30 text-xs font-medium focus:outline-none focus:border-amber-400 transition-colors"
                  />
                </div>
                <button
                  type="submit"
                  className="px-6 py-3.5 rounded-full bg-white hover:bg-zinc-200 text-black font-extrabold text-xs tracking-wider uppercase transition-all shadow-lg hover:shadow-xl shrink-0 flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                >
                  <span>Subscribe</span>
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>

              {subscribed ? (
                <p className="mt-2.5 text-xs text-emerald-400 flex items-center gap-1.5 font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Welcome to the private list. You will receive first notification.</span>
                </p>
              ) : (
                <p className="mt-2 text-[10px] text-white/40">
                  Zero spam. One-click unsubscribe at any time. Your data stays private.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* ================= 4-COLUMN MAIN NAVIGATION GRID ================= */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8 pb-16">
          
          {/* Column 1: Brand & Philosophy */}
          <div className="lg:col-span-4 flex flex-col justify-between">
            <div>
              <Link to="/" className="inline-block mb-4 group">
                <img
                  src="/assets/tagtique-dark-logo.png"
                  alt="Tagtique"
                  className="h-10 w-auto object-contain transition-transform group-hover:scale-102"
                />
              </Link>

              <p className="text-xs sm:text-sm text-white/60 leading-relaxed max-w-sm mt-1">
                Pioneering luxury physical-to-digital hardware. Next-generation smart NFC business cards and aerospace-grade collectibles crafted for modern executives, creators, and tastemakers.
              </p>
            </div>
          </div>

          {/* Column 2: Smart NFC Hardware */}
          <div className="lg:col-span-3 flex flex-col gap-3.5">
            <h4 className="font-mono text-xs font-bold uppercase tracking-widest text-amber-400">
              Smart NFC Hardware
            </h4>
            <nav className="flex flex-col gap-2.5 text-xs text-white/70">
              <Link to="/#nfc" className="hover:text-white hover:translate-x-0.5 transition-all flex items-center gap-1.5">
                <span>3D Interactive Card Stage</span>
              </Link>
              <Link to="/catalog?filter=nfc" className="hover:text-white hover:translate-x-0.5 transition-all flex items-center gap-1.5">
                <span>All 30 Custom Card Editions</span>
                <span className="text-[9px] font-mono bg-white/10 px-1.5 py-0.5 rounded text-white/80 font-bold">30</span>
              </Link>
              <Link to="/nfc-card/1a-bauhaus-blocks" className="hover:text-white hover:translate-x-0.5 transition-all">
                Hardware Specifications
              </Link>
              <Link to="/nfc-card/1a-bauhaus-blocks/setup" className="hover:text-white hover:translate-x-0.5 transition-all">
                Preview & Setup Digital Profile
              </Link>
              <Link to="/#nfc" className="hover:text-white hover:translate-x-0.5 transition-all">
                Virtual Phone Tap Simulator
              </Link>
            </nav>
          </div>

          {/* Column 3: Sticker Collectibles */}
          <div className="lg:col-span-2 flex flex-col gap-3.5">
            <h4 className="font-mono text-xs font-bold uppercase tracking-widest text-cyan-400">
              Collectibles
            </h4>
            <nav className="flex flex-col gap-2.5 text-xs text-white/70">
              <Link to="/catalog" className="hover:text-white hover:translate-x-0.5 transition-all flex items-center gap-1.5 font-bold text-white">
                <span>Explore Full Catalog</span>
                <ArrowRight className="w-3 h-3 text-amber-400" />
              </Link>
              <Link to="/#mascot" className="hover:text-white hover:translate-x-0.5 transition-all">
                Mascot Signature Series
              </Link>
              <Link to="/#anime" className="hover:text-white hover:translate-x-0.5 transition-all">
                Anime Special Edition
              </Link>
              <Link to="/#mature" className="hover:text-white hover:translate-x-0.5 transition-all">
                Modern Mature Series
              </Link>
              <Link to="/order" className="hover:text-white hover:translate-x-0.5 transition-all">
                Build Custom Smart Sticker
              </Link>
              <Link to="/checkout" className="hover:text-white hover:translate-x-0.5 transition-all">
                Review Bag & Checkout
              </Link>
            </nav>
          </div>

          {/* Column 4: Customer Care & Concierge */}
          <div className="lg:col-span-3 flex flex-col gap-3.5">
            <h4 className="font-mono text-xs font-bold uppercase tracking-widest text-emerald-400">
              VIP Support & Concierge
            </h4>
            
            {/* WhatsApp Direct Action Button */}
            <a
              href="https://wa.me/923292082080"
              target="_blank"
              rel="noreferrer"
              className="p-3 rounded-2xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/25 flex items-center gap-3 transition-all cursor-pointer group"
            >
              <div className="w-9 h-9 rounded-xl bg-emerald-500 text-black flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform font-bold">
                <MessageCircle className="w-4 h-4 fill-black text-emerald-500" />
              </div>
              <div>
                <p className="text-[11px] font-bold text-emerald-400 uppercase tracking-wide">
                  Live WhatsApp Care
                </p>
                <p className="text-xs font-mono font-extrabold text-white">
                  0329-2082080
                </p>
              </div>
            </a>

            <div className="space-y-2 text-xs text-white/60 mt-1">
              <div className="flex items-start gap-2">
                <Mail className="w-3.5 h-3.5 text-white/40 shrink-0 mt-0.5" />
                <a href="mailto:ataitsolution09@gmail.com" className="hover:text-white transition-colors truncate">
                  ataitsolution09@gmail.com
                </a>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-white/40 shrink-0 mt-0.5" />
                <span>208 Chak Road, West Canal Road, Faisalabad, Pakistan</span>
              </div>
            </div>

            <p className="text-[10px] text-white/40 font-mono mt-1">
              Concierge Hours: Mon – Sat, 9:00 AM – 9:00 PM PKT
            </p>
          </div>

        </div>

        {/* ================= MONUMENTAL WATERMARK ================= */}
        <div className="relative border-t border-white/[0.08] pt-10 pb-6 text-center overflow-hidden">
          <p className="font-manrope font-black tracking-[-0.04em] text-[15vw] sm:text-[11vw] leading-none text-transparent bg-clip-text bg-gradient-to-b from-white/[0.12] to-white/[0.01] select-none pointer-events-none">
            TAGTIQUE
          </p>
        </div>

        {/* ================= BOTTOM LEGAL & COPYRIGHT BAR ================= */}
        <div className="pt-6 border-t border-white/[0.08] flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-white/50">
          <div className="flex items-center gap-3">
            <img 
              src="/assets/tagtique-dark-logo.png" 
              alt="Tagtique Emblem" 
              className="h-5 w-auto object-contain opacity-75"
            />
            <span>© {new Date().getFullYear()} Tagtique Technologies Ltd. All rights reserved.</span>
          </div>

          <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-white/60 text-[11px]">
            <Link to="/#faq" className="hover:text-white transition-colors">Frequently Asked Questions</Link>
            <Link to="/order" className="hover:text-white transition-colors">Terms of Hardware</Link>
            <span className="text-white/40">Faisalabad, Pakistan</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
