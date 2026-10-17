import React from 'react';
import HeroSection from '../components/HeroSection';
import HowItWorksSection from '../components/HowItWorksSection';
import PricingSection from '../components/PricingSection';
import FaqSection from '../components/FaqSection';

export default function HomePage() {
  return (
    <div className="flex flex-col bg-white text-black">
      <HeroSection />
      <HowItWorksSection />
      <PricingSection />
      <section id="about" className="bg-white text-black py-16 border-t border-black/10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <h2 className="font-manrope font-extrabold text-4xl tracking-tight">One sticker. Any belonging.</h2>
          <p className="mt-4 text-base text-black/70 leading-relaxed">
            Put the sticker on a laptop, bag, helmet, bottle, or vehicle. Online, a scan opens your contact page. Offline, it opens the phone dialer. After purchase, use Wi-Fi, scan the QR, fill the form, and tap Assign.
          </p>
        </div>
      </section>
      <FaqSection />
    </div>
  );
}

