import React, { useState } from 'react';
import { Camera, ExternalLink, UserCheck, CheckCircle2 } from 'lucide-react';

const STEPS = [
  {
    n: '1',
    title: 'Pick your tag',
    body: 'Choose your finish, loop metal and optional custom laser engraving on the back.'
  },
  {
    n: '2',
    title: 'Claim your link',
    body: 'Set your name, phone, email and socials — and turn any detail on or off at any moment.'
  },
  {
    n: '3',
    title: 'Clip and go',
    body: 'Hang it on your keys, bag or jacket. Anyone with a phone camera scans it straight into contacts.'
  }
];

const SWATCHES = [
  { id: 'cream', label: 'Cream', fill: '#FBF3E4', accent: '#F5B21F', name: 'The Classic', trait: 'Warm ivory acrylic' },
  { id: 'espresso', label: 'Espresso', fill: '#3A2318', accent: '#F5B21F', name: 'The Espresso', trait: 'Matte dark chocolate' },
  { id: 'amber', label: 'Amber', fill: '#F5B21F', accent: '#3A2318', name: 'The Amber', trait: 'Translucent honey' },
  { id: 'glow', label: 'Nightlight', fill: 'linear-gradient(150deg, #8BF7C8, #49E2D2, #B394F2)', accent: '#2E1B10', name: 'The Nightlight', trait: 'Glows in darkness' }
];

export default function HowItWorksSection() {
  const [activeStep, setActiveStep] = useState(0);
  const [selectedSwatch, setSelectedSwatch] = useState(SWATCHES[0]);

  return (
    <section
      id="how"
      className="py-16 sm:py-24 text-[#FDF7EC] relative overflow-hidden"
      style={{
        background: 'linear-gradient(155deg, #4A2A18 0%, #2E1B10 60%, #221208 100%)'
      }}
    >
      {/* Background glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-radial-gradient from-tag-amber/15 to-transparent blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-12">
        {/* Header */}
        <div className="flex flex-col gap-3 max-w-2xl">
          <span className="font-mono text-[11px] font-bold tracking-[1.8px] text-tag-amber">
            HOW IT WORKS
          </span>
          <h2 className="font-baloo font-extrabold text-3xl sm:text-4xl lg:text-5xl leading-tight">
            Three steps, then you never hand out a number again.
          </h2>
        </div>

        {/* 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* Left Column: Interactive Step Buttons */}
          <div className="lg:col-span-6 flex flex-col gap-3.5">
            {STEPS.map((s, idx) => {
              const isActive = activeStep === idx;
              return (
                <button
                  key={s.n}
                  type="button"
                  onClick={() => setActiveStep(idx)}
                  className={`text-left p-5 sm:p-6 rounded-2xl transition-all duration-300 flex items-start gap-5 border ${
                    isActive
                      ? 'bg-[#FDF7EC]/12 border-tag-amber/70 shadow-lg translate-x-2'
                      : 'bg-[#FDF7EC]/[0.04] border-[#FDF7EC]/10 hover:bg-[#FDF7EC]/[0.08]'
                  }`}
                >
                  <span
                    className={`font-baloo font-extrabold text-4xl sm:text-5xl leading-none flex-shrink-0 transition-colors ${
                      isActive ? 'text-tag-amber' : 'text-[#FDF7EC]/40'
                    }`}
                  >
                    {s.n}
                  </span>
                  <div className="flex flex-col gap-1.5 min-w-0">
                    <span className="font-baloo font-bold text-xl sm:text-2xl text-[#FDF7EC]">
                      {s.title}
                    </span>
                    <span className="text-sm sm:text-base leading-relaxed text-[#E9D9C1]">
                      {s.body}
                    </span>
                  </div>
                </button>
              );
            })}

            <div className="flex items-center gap-2 pt-2 px-2 font-mono text-[11px] tracking-wider text-[#A88B64]">
              <span className="w-4 h-[1px] bg-[#A88B64]" />
              <span>CLICK A STEP TO PREVIEW</span>
            </div>
          </div>

          {/* Right Column: Dynamic Preview Card */}
          <div className="lg:col-span-6">
            <div className="relative rounded-3xl border border-[#FDF7EC]/20 bg-radial-gradient from-tag-amber/15 via-[#FDF7EC]/[0.04] to-transparent p-6 sm:p-8 min-h-[380px] flex flex-col justify-between shadow-2xl backdrop-blur-md overflow-hidden">
              
              <div className="flex items-center justify-between border-b border-[#FDF7EC]/15 pb-4 mb-4">
                <span className="font-mono text-[11px] tracking-[1.4px] text-tag-amber font-bold">
                  {activeStep === 0 && 'STEP 1 · SELECT FINISH & BUILD'}
                  {activeStep === 1 && 'STEP 2 · CONFIGURE YOUR PROFILE'}
                  {activeStep === 2 && 'STEP 3 · INSTANT SCANNING'}
                </span>
                <span className="font-mono text-xs text-[#A88B64]">0{activeStep + 1} / 03</span>
              </div>

              {/* Step 1 Content: Material finish picker */}
              {activeStep === 0 && (
                <div className="flex flex-col gap-6 animate-fadeIn">
                  <div className="flex items-center gap-3.5 flex-wrap">
                    {SWATCHES.map((sw) => (
                      <button
                        key={sw.id}
                        onClick={() => setSelectedSwatch(sw)}
                        className="flex flex-col items-center gap-1.5 group"
                      >
                        <span
                          className={`w-12 h-12 rounded-full border-2 transition-all ${
                            selectedSwatch.id === sw.id
                              ? 'border-tag-amber scale-110 shadow-amber-glow'
                              : 'border-[#1B0F06] group-hover:scale-105'
                          }`}
                          style={{ background: sw.fill }}
                        />
                        <span className="text-[11px] font-mono text-[#E9D9C1]">
                          {sw.label}
                        </span>
                      </button>
                    ))}
                  </div>

                  <div className="flex items-end gap-6 flex-wrap bg-[#1B0F06]/40 p-4 rounded-2xl border border-[#FDF7EC]/10">
                    <div
                      className="w-28 h-36 rounded-2xl border-2 border-[#1B0F06] flex flex-col items-center justify-between py-3 shadow-md flex-shrink-0 transition-colors duration-300"
                      style={{ background: selectedSwatch.fill }}
                    >
                      <span
                        className="w-4 h-4 rounded-full border-2 border-[#1B0F06]"
                        style={{ background: selectedSwatch.accent }}
                      />
                      <div className="w-16 h-16 rounded-md bg-white border border-tag-brown-deep/30 p-1 flex items-center justify-center">
                        <div className="w-full h-full bg-[radial-gradient(#2E1B10_2px,transparent_2px)] [background-size:6px_6px]" />
                      </div>
                      <span
                        className="w-8 h-1 rounded-full"
                        style={{ background: selectedSwatch.accent }}
                      />
                    </div>
                    <div className="flex flex-col gap-1.5 text-sm text-[#E9D9C1]">
                      <span className="font-baloo font-bold text-xl text-[#FDF7EC]">
                        {selectedSwatch.name}
                      </span>
                      <span>Cast acrylic · 38 × 52 mm</span>
                      <span>Stainless steel key loop included</span>
                      <span className="text-tag-amber font-bold">{selectedSwatch.trait}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2 Content: Profile Card Setup */}
              {activeStep === 1 && (
                <div className="flex flex-col gap-4 animate-fadeIn">
                  <div className="bg-[#FFFDF8] text-tag-brown rounded-2xl p-4 sm:p-5 flex flex-col gap-3 shadow-md">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="text-[10.5px] font-mono font-bold tracking-wider text-tag-brown-light uppercase">
                          Display Name
                        </div>
                        <div className="font-baloo font-bold text-lg text-tag-brown">Ayesha Khan</div>
                      </div>
                      <span className="bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2 py-0.5 rounded-full">
                        Active
                      </span>
                    </div>
                    <div className="h-[1px] bg-tag-border/60" />
                    <div>
                      <div className="text-[10.5px] font-mono font-bold tracking-wider text-tag-brown-light uppercase">
                        Phone & Socials
                      </div>
                      <div className="text-sm font-semibold text-tag-brown flex items-center gap-2">
                        +92 300 114 2288
                        <span className="w-1.5 h-3.5 bg-tag-amber inline-block" />
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 text-xs sm:text-sm">
                    <div className="flex items-center justify-between p-3 rounded-xl bg-[#FDF7EC]/[0.08] border border-[#FDF7EC]/10">
                      <span>Show direct WhatsApp button</span>
                      <span className="w-8 h-5 rounded-full bg-tag-amber flex items-center justify-end px-0.5">
                        <span className="w-4 h-4 rounded-full bg-tag-brown" />
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-xl bg-[#FDF7EC]/[0.08] border border-[#FDF7EC]/10">
                      <span>Lost & Found Emergency Mode</span>
                      <span className="w-8 h-5 rounded-full bg-[#FDF7EC]/30 flex items-center px-0.5">
                        <span className="w-4 h-4 rounded-full bg-white" />
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3 Content: Scan simulation */}
              {activeStep === 2 && (
                <div className="flex flex-col gap-5 animate-fadeIn">
                  <div className="flex items-center gap-5 flex-wrap">
                    <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl bg-white border-2 border-[#1B0F06] p-2 flex items-center justify-center shadow-lg flex-shrink-0">
                      <div className="w-full h-full bg-[repeating-conic-gradient(#231409_0%_25%,#fffdf8_0%_50%)_0_0/16px_16px] rounded-lg" />
                    </div>
                    <div className="flex flex-col gap-3 text-sm text-[#FDF7EC]">
                      <div className="flex items-center gap-2.5">
                        <span className="w-6 h-6 rounded-full bg-tag-amber text-tag-brown font-extrabold text-xs flex items-center justify-center flex-shrink-0">
                          1
                        </span>
                        <span>Any camera spots the code instantly</span>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <span className="w-6 h-6 rounded-full bg-tag-amber text-tag-brown font-extrabold text-xs flex items-center justify-center flex-shrink-0">
                          2
                        </span>
                        <span>Opens in browser — zero app download</span>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <span className="w-6 h-6 rounded-full bg-tag-amber text-tag-brown font-extrabold text-xs flex items-center justify-center flex-shrink-0">
                          3
                        </span>
                        <span>One tap saves directly to contact book</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Footer text */}
              <div className="pt-4 border-t border-[#FDF7EC]/15 text-xs text-[#E9D9C1]">
                Change your card anytime from your browser. Your physical tag never needs reprogramming.
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
