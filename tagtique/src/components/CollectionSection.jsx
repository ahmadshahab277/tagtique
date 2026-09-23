import React from 'react';
import { Link } from 'react-router-dom';
import Tag3D from './Tag3D';
import { ArrowRight } from 'lucide-react';

const PRODUCTS = [
  {
    id: 'cream',
    name: 'The Classic',
    price: 19,
    badge: 'CREAM',
    desc: 'Rounded cream acrylic, amber eyelet, steel loop. Fits keys and bag straps.'
  },
  {
    id: 'espresso',
    name: 'The Espresso',
    price: 22,
    badge: 'ESPRESSO',
    desc: 'Matte deep brown with a cream code panel. Quiet on a laptop lid.'
  },
  {
    id: 'amber',
    name: 'The Amber',
    price: 24,
    badge: 'AMBER',
    desc: 'Translucent honey acrylic that glows when light passes through it.'
  },
  {
    id: 'glow',
    name: 'The Nightlight',
    price: 26,
    badge: 'GLOW',
    desc: 'Mint-to-violet gradient acrylic that charges in daylight and glows after dark.'
  }
];

export default function CollectionSection() {
  return (
    <section id="styles" className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-10">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="flex flex-col gap-2 max-w-xl">
            <span className="font-mono text-[11px] font-bold tracking-[1.6px] text-tag-brown-light uppercase">
              THE COLLECTION
            </span>
            <h2 className="font-baloo font-extrabold text-3xl sm:text-4xl lg:text-5xl text-tag-brown leading-tight">
              Tags you would wear even if they did nothing.
            </h2>
          </div>
          <a
            href="#pricing"
            className="inline-flex items-center gap-1.5 text-sm sm:text-base font-bold text-tag-brown-light hover:text-tag-amber-deep transition-colors"
          >
            <span>See all bundle options</span>
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {PRODUCTS.map((prod) => (
            <article
              key={prod.id}
              className="bg-tag-card border-[1.5px] border-tag-border rounded-3xl overflow-hidden flex flex-col transition-all duration-300 hover:-translate-y-2 hover:shadow-warm-lg hover:border-tag-amber/80 group"
            >
              {/* Card 3D Preview Box */}
              <div className="relative aspect-[4/3] bg-radial-gradient from-[#FFF8EC] via-[#F4E7CE] to-[#EAD8B5] overflow-hidden">
                <Tag3D variant={prod.id} interactive={true} autoSpin={true} cameraDistance={4.2} />
                
                {/* Finish Badge */}
                <span className="absolute top-3 left-3 pointer-events-none font-mono text-[10px] font-bold tracking-wider text-tag-brown-light bg-tag-card/90 backdrop-blur-xs px-2.5 py-1 rounded-full border border-tag-border/60 shadow-xs">
                  {prod.badge}
                </span>
              </div>

              {/* Card Meta & Action */}
              <div className="p-5 sm:p-6 flex flex-col gap-2 flex-1 justify-between">
                <div>
                  <div className="flex items-baseline justify-between gap-2">
                    <h3 className="font-baloo font-bold text-xl text-tag-brown">
                      {prod.name}
                    </h3>
                    <span className="font-baloo font-extrabold text-lg text-tag-brown">
                      ${prod.price}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-tag-brown-muted leading-relaxed mt-1 font-medium">
                    {prod.desc}
                  </p>
                </div>

                <Link
                  to={`/order?finish=${prod.id}`}
                  className="mt-4 w-full text-center border-2 border-tag-brown-deep bg-tag-bg hover:bg-tag-amber rounded-full py-2.5 text-sm font-extrabold text-tag-brown transition-all duration-150 hover:shadow-warm-sm active:scale-98 inline-block"
                >
                  Build this one
                </Link>
              </div>
            </article>
          ))}
        </div>

      </div>
    </section>
  );
}
