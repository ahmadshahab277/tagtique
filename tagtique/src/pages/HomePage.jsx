import React from 'react';
import HeroSection from '../components/HeroSection';
import PricingSection from '../components/PricingSection';
import FaqSection from '../components/FaqSection';

export default function HomePage() {
  return (
    <div className="flex flex-col">
      <HeroSection />
      <PricingSection />
      <FaqSection />
    </div>
  );
}

