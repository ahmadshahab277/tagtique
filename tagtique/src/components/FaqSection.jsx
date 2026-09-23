import React, { useState } from 'react';
import { Plus } from 'lucide-react';

const FAQS = [
  {
    q: 'Does the person scanning need an app or account?',
    a: 'Not at all. Every modern smartphone (iPhone and Android) reads the QR code natively with the default camera app. The camera banner opens your profile directly in Safari or Chrome in under a second.'
  },
  {
    q: 'Can I change my phone number or Instagram handle later?',
    a: 'Yes, as many times as you like. You manage your card from your Tagtique account. Changes update instantaneously for anyone who scans your tag in the future. The engraved QR on the physical acrylic never needs replacing.'
  },
  {
    q: 'Is the tag waterproof and scratch-proof?',
    a: 'Yes. Each tag is manufactured from cast optical acrylic with subsurface resin-sealed QR panels. Rain, pool water, coffee spills, and daily key scratches will not degrade or affect readability.'
  },
  {
    q: 'What happens if my keys or bag get lost?',
    a: 'You can immediately toggle "Lost & Found Mode" from your phone. When someone scans the tag, instead of your full contact sheet, they see an emergency return notice with your direct reward offer and contact hotline.'
  },
  {
    q: 'How long does shipping take?',
    a: 'Standard orders ship within 3 business days worldwide from our workshop in Lahore. Laser-engraved custom tags require 5–7 days for etching and quality inspection.'
  }
];

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section id="faq" className="py-16 sm:py-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-8">
        
        {/* Header */}
        <div className="flex flex-col gap-2">
          <span className="font-mono text-[11px] font-bold tracking-[1.6px] text-tag-brown-light uppercase">
            FAQ
          </span>
          <h2 className="font-baloo font-extrabold text-3xl sm:text-4xl text-tag-brown leading-tight">
            Questions people ask first.
          </h2>
        </div>

        {/* Accordion list */}
        <div className="flex flex-col gap-3">
          {FAQS.map((f, i) => {
            const isOpen = openIndex === i;
            return (
              <div
                key={i}
                className="bg-tag-card border-[1.5px] border-tag-border rounded-2xl overflow-hidden transition-all duration-200"
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? -1 : i)}
                  className="w-full flex items-center justify-between gap-4 p-5 sm:p-6 text-left font-manrope font-bold text-base sm:text-lg text-tag-brown hover:text-tag-amber-deep transition-colors"
                >
                  <span>{f.q}</span>
                  <span
                    className={`w-7 h-7 rounded-full bg-tag-pill flex items-center justify-center flex-shrink-0 text-tag-brown-light font-bold transition-transform duration-300 ${
                      isOpen ? 'rotate-45 bg-tag-amber text-tag-brown-deep' : ''
                    }`}
                  >
                    <Plus className="w-4 h-4" />
                  </span>
                </button>
                {isOpen && (
                  <div className="px-5 sm:px-6 pb-6 pt-1 text-sm sm:text-base leading-relaxed text-tag-brown-muted font-medium border-t border-tag-border/40 animate-fadeIn">
                    {f.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}


