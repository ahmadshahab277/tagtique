import React from 'react';
import { Link } from 'react-router-dom';
import { Check } from 'lucide-react';

export default function PricingSection() {
  return (
    <section id="pricing" className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-12">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="flex flex-col gap-2 max-w-xl">
            <span className="font-mono text-[11px] font-bold tracking-[1.6px] text-tag-brown-light uppercase">
              PRICING
            </span>
            <h2 className="font-baloo font-extrabold text-3xl sm:text-4xl lg:text-5xl text-tag-brown leading-tight">
              Buy the tag once. The card stays free.
            </h2>
          </div>
          <div className="inline-flex items-center bg-tag-pill border border-tag-border rounded-full px-4 py-2 font-mono text-[11px] font-bold tracking-wider text-tag-brown-light self-start sm:self-auto shadow-xs">
            <span>ONE-TIME · NO SUBSCRIPTION</span>
          </div>
        </div>

        {/* 3 Pricing Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 items-stretch">
          
          {/* 1. Single Tag */}
          <div className="bg-tag-card border-[1.5px] border-tag-border rounded-3xl p-6 sm:p-8 flex flex-col justify-between gap-6 transition-all duration-300 hover:-translate-y-2 hover:shadow-warm-lg">
            <div className="flex flex-col gap-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-baloo font-bold text-2xl text-tag-brown">Single tag</h3>
                  <span className="text-xs text-tag-brown-subtle font-medium">For your keys or bag</span>
                </div>
                <div className="w-5 h-5 rounded-full border border-tag-brown bg-[#FBF3E4]" />
              </div>

              <div className="flex items-baseline gap-2">
                <span className="font-mono text-base font-bold text-tag-brown-light">PKR</span>
                <span className="font-baloo font-extrabold text-4xl sm:text-5xl text-tag-brown">1,499</span>
                <span className="text-xs font-semibold text-tag-brown-subtle">one-time</span>
              </div>

              <div className="h-[1px] bg-tag-border" />

              <ul className="flex flex-col gap-3 text-sm text-tag-brown font-medium">
                <li className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-tag-pill text-tag-brown-light flex items-center justify-center flex-shrink-0 text-xs font-bold mt-0.5">
                    <Check className="w-3 h-3" />
                  </span>
                  <span>One cast acrylic tag, finish of your choice</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-tag-pill text-tag-brown-light flex items-center justify-center flex-shrink-0 text-xs font-bold mt-0.5">
                    <Check className="w-3 h-3" />
                  </span>
                  <span>Unlimited live edits to your profile card</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-tag-pill text-tag-brown-light flex items-center justify-center flex-shrink-0 text-xs font-bold mt-0.5">
                    <Check className="w-3 h-3" />
                  </span>
                  <span>Lost-and-found emergency mode included</span>
                </li>
              </ul>
            </div>

            <Link
              to="/order?finish=cream"
              className="w-full text-center border-2 border-tag-brown-deep bg-tag-bg hover:bg-tag-amber rounded-full py-3 text-sm font-extrabold text-tag-brown transition-all duration-150 shadow-xs active:scale-98 inline-block"
            >
              Choose single
            </Link>
          </div>

          {/* 2. Trio Pack (Featured) */}
          <div
            className="relative border-[2.5px] border-tag-brown-deep rounded-3xl p-6 sm:p-8 flex flex-col justify-between gap-6 shadow-warm-lg transition-all duration-300 hover:-translate-y-2 text-[#FDF7EC]"
            style={{
              background: 'linear-gradient(168deg, #3A2318 0%, #2E1B10 58%, #221208 100%)'
            }}
          >
            {/* Pill Badge */}
            <span className="absolute -top-3.5 left-6 bg-tag-amber text-tag-brown-deep border-2 border-tag-brown-deep rounded-full font-mono text-[10px] font-bold tracking-wider px-3.5 py-1 flex items-center gap-1 shadow-sm">
              MOST BOUGHT
            </span>

            <div className="flex flex-col gap-4">
              <div className="flex items-start justify-between pt-1">
                <div>
                  <h3 className="font-baloo font-bold text-2xl text-[#FDF7EC]">Trio pack</h3>
                  <span className="text-xs text-[#A88B64] font-medium">Bag, keys, jacket or laptop</span>
                </div>
                <div className="flex -space-x-1.5">
                  <span className="w-4 h-4 rounded-full border border-black bg-[#FBF3E4]" />
                  <span className="w-4 h-4 rounded-full border border-black bg-[#3A2318]" />
                  <span className="w-4 h-4 rounded-full border border-black bg-[#F5B21F]" />
                </div>
              </div>

              <div className="flex items-baseline gap-2.5 flex-wrap">
                <span className="font-mono text-base font-bold text-tag-amber">PKR</span>
                <span className="font-baloo font-extrabold text-4xl sm:text-5xl text-tag-amber">2,499</span>
                <span className="text-sm line-through text-[#A88B64]">PKR 3,499</span>
                <span className="text-xs font-bold text-tag-brown-deep bg-tag-amber px-2.5 py-0.5 rounded-full">
                  PKR 833 a tag
                </span>
              </div>

              <div className="h-[1px] bg-[#FDF7EC]/20" />

              <ul className="flex flex-col gap-3 text-sm text-[#E9D9C1] font-medium">
                <li className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-tag-amber/20 text-tag-amber flex items-center justify-center flex-shrink-0 text-xs font-bold mt-0.5">
                    <Check className="w-3 h-3" />
                  </span>
                  <span>Three acrylic tags in any mix of finishes</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-tag-amber/20 text-tag-amber flex items-center justify-center flex-shrink-0 text-xs font-bold mt-0.5">
                    <Check className="w-3 h-3" />
                  </span>
                  <span>All pointing to your single synced card</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-tag-amber/20 text-tag-amber flex items-center justify-center flex-shrink-0 text-xs font-bold mt-0.5">
                    <Check className="w-3 h-3" />
                  </span>
                  <span>Scan analytics and logs across all three</span>
                </li>
              </ul>
            </div>

            <Link
              to="/order?bundle=trio"
              className="amber-gradient-btn w-full py-3.5 rounded-full text-sm font-extrabold text-tag-brown transition-all shadow-md active:scale-98 text-center inline-block"
            >
              Choose trio
            </Link>
          </div>

          {/* 3. Engraved */}
          <div className="bg-tag-card border-[1.5px] border-tag-border rounded-3xl p-6 sm:p-8 flex flex-col justify-between gap-6 transition-all duration-300 hover:-translate-y-2 hover:shadow-warm-lg">
            <div className="flex flex-col gap-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-baloo font-bold text-2xl text-tag-brown">Custom Engraved</h3>
                  <span className="text-xs text-tag-brown-subtle font-medium">Laser-etched on back</span>
                </div>
                <span className="font-mono text-[10px] font-bold text-tag-brown-light border border-dashed border-tag-border px-2 py-0.5 rounded-md">
                  A–Z
                </span>
              </div>

              <div className="flex items-baseline gap-2">
                <span className="font-mono text-base font-bold text-tag-brown-light">PKR</span>
                <span className="font-baloo font-extrabold text-4xl sm:text-5xl text-tag-brown">2,999</span>
                <span className="text-xs font-semibold text-tag-brown-subtle">one-time</span>
              </div>

              <div className="h-[1px] bg-tag-border" />

              <ul className="flex flex-col gap-3 text-sm text-tag-brown font-medium">
                <li className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-tag-pill text-tag-brown-light flex items-center justify-center flex-shrink-0 text-xs font-bold mt-0.5">
                    <Check className="w-3 h-3" />
                  </span>
                  <span>Your custom name, handle or studio on reverse</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-tag-pill text-tag-brown-light flex items-center justify-center flex-shrink-0 text-xs font-bold mt-0.5">
                    <Check className="w-3 h-3" />
                  </span>
                  <span>Available on any of the four tag finishes</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-tag-pill text-tag-brown-light flex items-center justify-center flex-shrink-0 text-xs font-bold mt-0.5">
                    <Check className="w-3 h-3" />
                  </span>
                  <span>Ships within 2–3 business days</span>
                </li>
              </ul>
            </div>

            <Link
              to="/order?engraved=true"
              className="w-full text-center border-2 border-tag-brown-deep bg-tag-bg hover:bg-tag-amber rounded-full py-3 text-sm font-extrabold text-tag-brown transition-all duration-150 shadow-xs active:scale-98 inline-block"
            >
              Choose engraved
            </Link>
          </div>

        </div>

        {/* Guarantees banner */}
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 p-4 rounded-2xl border-[1.5px] border-dashed border-tag-border text-xs sm:text-sm font-semibold text-tag-brown-muted bg-tag-card/50">
          <span>Free digital card, forever</span>
          <span className="text-tag-border">·</span>
          <span>1-Year physical replacement warranty</span>
          <span className="text-tag-border">·</span>
          <span>Free Express courier delivery across Pakistan</span>
        </div>

      </div>
    </section>
  );
}
