import React from 'react';
import ProductSlider from './ProductSlider';

export default function PricingSection() {
  return (
    <section id="shop" className="bg-white">
      <ProductSlider editionId="cute" />
      <ProductSlider editionId="limited" />
    </section>
  );
}
