import React from 'react';
import { Link } from 'react-router-dom';
import Tag3D from './Tag3D';

const SIDE_STICKERS = [
  {
    name: 'Mimi',
    href: '/product/cute-mimi',
    src: '/assets/cute/mimi.png',
    className: 'hidden md:block absolute left-[6%] lg:left-[14%] top-[8%] w-[20%] h-[84%] -rotate-[8deg]'
  },
  {
    name: 'Beat',
    href: '/product/cute-beat',
    src: '/assets/cute/beat.png',
    className: 'hidden md:block absolute right-[6%] lg:right-[14%] top-[8%] w-[20%] h-[84%] rotate-[8deg]'
  }
];

export default function HeroSection() {
  return (
    <section className="relative bg-white text-black overflow-hidden flex flex-col">
      <div className="relative h-[50vh] min-h-[380px] max-h-[540px]">
        <div className="absolute left-1/2 top-[58%] -translate-x-1/2 -translate-y-1/2 w-[70%] h-24 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0.08),transparent_70%)] pointer-events-none" />
        {SIDE_STICKERS.map((sticker) => (
          <Link key={sticker.name} to={sticker.href} className={sticker.className} aria-label={sticker.name}>
            <img
              src={sticker.src}
              alt=""
              className="w-full h-full object-contain drop-shadow-[0_18px_30px_rgba(0,0,0,0.12)]"
            />
          </Link>
        ))}
        <div className="absolute left-1/2 top-[8%] -translate-x-1/2 w-[68%] sm:w-[40%] md:w-[26%] h-[84%] z-10">
          <Tag3D variant="amber" autoSpin={false} interactive cameraDistance={3.45} />
        </div>
      </div>

      <div className="relative z-20 flex flex-col items-center text-center px-6 pt-2 pb-12 sm:pb-16 bg-white">
        <h1 className="font-manrope font-extrabold text-4xl sm:text-6xl lg:text-7xl leading-[0.95] tracking-tight">
          One sticker. Any belonging.
        </h1>
        <p className="mt-3 text-sm sm:text-base text-black/55 max-w-md">
          A QR sticker for anything you might lose. A scan opens your page online, or a phone call when there is no internet.
        </p>
        <Link
          to="/#shop"
          className="mt-5 inline-flex items-center justify-center bg-black text-white rounded-full px-8 py-3 text-sm font-bold tracking-wide shadow-[0_10px_30px_rgba(0,0,0,0.18)] hover:bg-black/90"
        >
          SHOP NOW
        </Link>
      </div>
    </section>
  );
}
