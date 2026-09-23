import React from 'react';
import { Link } from 'react-router-dom';
import Tag3D from './Tag3D';
import { ArrowRight, ShieldCheck, Truck } from 'lucide-react';

export default function HeroSection() {
  const selectedFinish = 'cream';

  return (
    <section className="relative overflow-hidden pt-6 sm:pt-10 pb-16 sm:pb-24">
      {/* Background ambient lighting */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-radial-gradient from-tag-amber/10 via-tag-amber/5 to-transparent rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          
          {/* Left Hero Column */}
          <div className="lg:col-span-6 flex flex-col gap-6 max-w-xl">
            {/* Kicker badge */}
            <div className="self-start">
              <span className="inline-flex items-center font-mono text-[11px] font-bold tracking-[1.6px] text-tag-brown-light bg-tag-pill px-3.5 py-1.5 rounded-full border border-tag-border shadow-xs">
                QR TAGS FOR PEOPLE, NOT PARCELS
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="font-baloo font-extrabold text-4xl sm:text-5xl lg:text-[62px] leading-[1.04] tracking-[-1px] text-tag-brown">
              A tag worth showing off — and one scan does the talking.
            </h1>

            {/* Subhead */}
            <p className="text-base sm:text-lg text-tag-brown-muted leading-relaxed font-medium">
              Clip it to a bag, a jacket, a laptop or your keys. Anyone who scans it gets your name, number and socials — and you can change what they see whenever you like.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-3.5 pt-1">
              <Link
                to={`/order?finish=${selectedFinish}`}
                className="amber-gradient-btn px-7 py-3.5 rounded-full text-base font-extrabold text-tag-brown flex items-center gap-2.5 group"
              >
                <span>Shop tags</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <a
                href="#pricing"
                className="px-6 py-3.5 rounded-full text-base font-bold text-tag-brown-muted border-2 border-tag-border hover:border-tag-amber hover:text-tag-brown transition-all bg-tag-card/60 backdrop-blur-sm"
              >
                View pricing
              </a>
            </div>

            {/* Value bullets */}
            <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm font-semibold text-tag-brown-muted pt-2 border-t border-tag-border/60">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-tag-amber" />
                No app to install
              </span>
              <span className="text-tag-border">·</span>
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Waterproof & scratch-proof
              </span>
              <span className="text-tag-border">·</span>
              <span className="flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-tag-brown-light" />
                Free delivery across Pakistan
              </span>
            </div>
          </div>

          {/* Right Column: 3D Interactive Tag Showcase */}
          <div className="lg:col-span-6 flex flex-col items-center gap-5">
            {/* 3D Canvas Box */}
            <div className="relative w-full max-w-[520px] aspect-square rounded-[36px] bg-radial-gradient from-[#FFF8EC] via-[#F4E7CE] to-[#EAD8B5] border-[1.5px] border-tag-border shadow-warm-lg overflow-hidden group">
              {/* Subtle top glare highlight */}
              <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-white/30 to-transparent pointer-events-none" />

              {/* Three.js Tag Engine */}
              <div className="absolute inset-0">
                <Tag3D variant={selectedFinish} interactive={true} autoSpin={true} />
              </div>

              {/* Drag indicator label */}
              <div className="absolute left-5 bottom-4 flex items-center gap-2 font-mono text-[10.5px] tracking-[1.4px] text-tag-brown-light pointer-events-none select-none">
                <span className="w-4 h-[1.5px] bg-tag-brown-subtle" />
                <span>DRAG TO SPIN IT</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
