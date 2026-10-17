import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { findEdition, STICKER_PRICE_PKR } from '../data/editions';
import StickerArt from './StickerArt';

export default function ProductSlider({ editionId }) {
  const scroller = useRef(null);
  const edition = findEdition(editionId);
  if (!edition) return null;

  const slide = (direction) => {
    const node = scroller.current;
    if (!node) return;
    const card = node.querySelector('[data-card]');
    const distance = card ? card.getBoundingClientRect().width + 16 : 320;
    node.scrollBy({ left: direction * distance, behavior: 'smooth' });
  };

  return (
    <div className="bg-white text-black py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="font-manrope font-extrabold text-4xl sm:text-5xl tracking-tight">
          {edition.name.toUpperCase()} EDITION.
        </h2>
        <p className="mt-2 text-sm text-black/55 max-w-xl">{edition.line}</p>

        <div className="relative mt-8">
          <button
            type="button"
            onClick={() => slide(-1)}
            aria-label={`Previous ${edition.name} stickers`}
            className="glass-pill hidden sm:flex absolute left-2 top-[38%] z-10 w-10 h-10 items-center justify-center rounded-full text-lg"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={() => slide(1)}
            aria-label={`Next ${edition.name} stickers`}
            className="glass-pill hidden sm:flex absolute right-2 top-[38%] z-10 w-10 h-10 items-center justify-center rounded-full text-lg"
          >
            ›
          </button>

          <div
            ref={scroller}
            className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-2 scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {edition.styles.map((style) => {
              const product = { ...style, editionId: edition.id, editionName: edition.name };
              const slug = `${edition.id}-${style.id}`;
              return (
                <Link
                  key={style.id}
                  data-card
                  to={`/product/${slug}`}
                  className="snap-start shrink-0 w-[78%] sm:w-[260px] bg-white border border-black/5 shadow-[0_12px_40px_rgba(0,0,0,0.06)] rounded-3xl overflow-hidden flex flex-col focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
                >
                  <div className="aspect-[230/341] w-full bg-[#f3f3f3]">
                    <StickerArt product={product} />
                  </div>
                  <div className="px-4 py-4 flex items-start justify-between gap-3">
                    <div>
                      <p className="font-extrabold tracking-wide">{style.name.toUpperCase()}</p>
                      <p className="text-sm text-black/55 mt-1">{style.line || edition.line}</p>
                      <p className="text-xs font-semibold mt-2 underline underline-offset-2">View product</p>
                    </div>
                    <p className="font-bold whitespace-nowrap">PKR {STICKER_PRICE_PKR.toLocaleString('en-PK')}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
