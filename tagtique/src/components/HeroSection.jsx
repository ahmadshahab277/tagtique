import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';

const STICKERS = [
  {
    id: 'atom',
    name: 'Quantum Atom QR',
    tagline: 'Deep Space Orbit Edition',
    src: '/assets/stickers/atom.png',
    badge: 'Limited',
    accentColor: '#3B82F6',
    href: '/#shop'
  },
  {
    id: 'gray_sunglasses',
    name: 'Cool Boy QR',
    tagline: 'Cyber Chibi Mascot',
    src: '/assets/stickers/designed/Gray_Sunglasses.png',
    badge: 'Signature',
    accentColor: '#8B5CF6',
    href: '/product/cute-shade'
  },
  {
    id: 'goku',
    name: 'Goku Saiyan QR',
    tagline: 'Dragon Ball Anime Edition',
    src: '/assets/stickers/anime/goku.png',
    badge: 'Popular',
    accentColor: '#F97316',
    href: '/product/anime-goku'
  }
];

export default function HeroSection({
  heroAnchorRef,
  activeEdition = 'mascot',
  onEditionChange,
  selectedMascot,
  selectedAnime,
  selectedCollection
}) {
  const dynamicStickers = [
    {
      editionId: 'collections',
      id: selectedCollection?.id || 'retro-tv',
      name: selectedCollection?.name || 'Retro TV QR',
      tagline: selectedCollection?.series || 'Vintage Electronics',
      src: selectedCollection?.src || '/assets/stickers/mature/01_retro-tv.png',
      badge: 'Curated',
      accentColor: selectedCollection?.accentColor || '#8B5CF6',
      href: `/product/${selectedCollection?.slug || 'collections-retro-tv'}`
    },
    {
      editionId: 'mascot',
      id: selectedMascot?.id || 'coolboy',
      name: selectedMascot?.name || 'Cool Boy QR',
      tagline: selectedMascot?.series || 'Signature Series 01',
      src: selectedMascot?.src || '/assets/stickers/designed/Gray_Sunglasses.png',
      badge: 'Signature',
      accentColor: selectedMascot?.accentColor || '#8B5CF6',
      href: `/product/${selectedMascot?.slug || 'cute-shade'}`
    },
    {
      editionId: 'anime',
      id: selectedAnime?.id || 'goku',
      name: selectedAnime?.name || 'Goku QR',
      tagline: selectedAnime?.series || 'Dragon Ball Z',
      src: selectedAnime?.src || '/assets/stickers/anime/goku.png',
      badge: 'Shonen',
      accentColor: selectedAnime?.accentColor || '#F97316',
      href: `/product/${selectedAnime?.slug || 'anime-goku'}`
    }
  ];

  // Start with Mascot (index 1) in front center (-120deg)
  const [angle, setAngle] = useState(-(Math.PI * 2) / 3);
  const [isDragging, setIsDragging] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isInView, setIsInView] = useState(true);
  const dragStartX = useRef(0);
  const dragStartAngle = useRef(0);

  const [windowWidth, setWindowWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1200
  );

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Pause auto-rotation when user scrolls past hero section
  useEffect(() => {
    const handleScroll = () => {
      setIsInView(window.scrollY < 380);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Sync angle when activeEdition changes from outside tabs (e.g. clicking tab below)
  useEffect(() => {
    if (isDragging) return;
    const targetIdx = dynamicStickers.findIndex((s) => s.editionId === activeEdition);
    if (targetIdx !== -1) {
      const baseTarget = -(targetIdx * Math.PI * 2) / 3;
      setAngle((currentAngle) => {
        const twoPi = Math.PI * 2;
        const diff = (baseTarget - currentAngle) % twoPi;
        const shortestDiff = ((diff + Math.PI * 3) % twoPi) - Math.PI;
        return currentAngle + shortestDiff;
      });
    }
  }, [activeEdition]);

  // Touch and mouse drag handlers for 3D spin
  const handlePointerDown = (e) => {
    setIsDragging(true);
    dragStartX.current = e.clientX || (e.touches && e.touches[0].clientX) || 0;
    dragStartAngle.current = angle;
  };

  const handlePointerMove = (e) => {
    if (!isDragging) return;
    const clientX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
    const deltaX = clientX - dragStartX.current;
    const sensitivity = 0.005;
    const newAngle = dragStartAngle.current - deltaX * sensitivity;
    setAngle(newAngle);

    // Calculate front sticker during drag and notify parent
    if (onEditionChange) {
      const closestIdx = dynamicStickers.reduce((closest, _, idx) => {
        const thetaIdx = (newAngle + (idx * Math.PI * 2) / 3) % (Math.PI * 2);
        const normIdx = (thetaIdx + Math.PI * 2) % (Math.PI * 2);
        const distIdx = Math.min(normIdx, Math.PI * 2 - normIdx);

        const thetaClose = (newAngle + (closest * Math.PI * 2) / 3) % (Math.PI * 2);
        const normClose = (thetaClose + Math.PI * 2) % (Math.PI * 2);
        const distClose = Math.min(normClose, Math.PI * 2 - normClose);

        return distIdx < distClose ? idx : closest;
      }, 0);

      const closestEdition = dynamicStickers[closestIdx]?.editionId;
      if (closestEdition && closestEdition !== activeEdition) {
        onEditionChange(closestEdition);
      }
    }
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  // Step rotation to previous or next sticker
  const rotateToStep = useCallback((direction) => {
    const step = (Math.PI * 2) / 3;
    setAngle((prev) => {
      // Rotating to next sticker index (Mascot -> Anime -> Collections -> Mascot)
      const nextAngle = direction === 'next' ? prev - step : prev + step;
      if (onEditionChange) {
        const closestIdx = dynamicStickers.reduce((closest, _, idx) => {
          const thetaIdx = (nextAngle + (idx * Math.PI * 2) / 3) % (Math.PI * 2);
          const normIdx = (thetaIdx + Math.PI * 2) % (Math.PI * 2);
          const distIdx = Math.min(normIdx, Math.PI * 2 - normIdx);

          const thetaClose = (nextAngle + (closest * Math.PI * 2) / 3) % (Math.PI * 2);
          const normClose = (thetaClose + Math.PI * 2) % (Math.PI * 2);
          const distClose = Math.min(normClose, Math.PI * 2 - normClose);

          return distIdx < distClose ? idx : closest;
        }, 0);

        const closestEdition = dynamicStickers[closestIdx]?.editionId;
        if (closestEdition) onEditionChange(closestEdition);
      }
      return nextAngle;
    });
  }, [dynamicStickers, onEditionChange]);

  // Auto-rotate stickers every 4.5 seconds to bring behind stickers to front
  useEffect(() => {
    if (isDragging || isHovered || !isInView) return;

    const autoTimer = setInterval(() => {
      rotateToStep('next');
    }, 4500);

    return () => clearInterval(autoTimer);
  }, [isDragging, isHovered, isInView, rotateToStep]);

  // Jump specific sticker directly to front center
  const bringToFront = (index) => {
    const baseOffset = (index * (Math.PI * 2)) / 3;
    setAngle(-baseOffset);
    if (onEditionChange) {
      onEditionChange(dynamicStickers[index].editionId);
    }
  };

  // Calculate the currently closest front sticker
  const frontIndex = dynamicStickers.reduce((closestIdx, _, idx) => {
    const thetaIdx = (angle + (idx * Math.PI * 2) / 3) % (Math.PI * 2);
    const normalized = (thetaIdx + Math.PI * 2) % (Math.PI * 2);
    const distIdx = Math.min(normalized, Math.PI * 2 - normalized);

    const thetaClosest = (angle + (closestIdx * Math.PI * 2) / 3) % (Math.PI * 2);
    const normClosest = (thetaClosest + Math.PI * 2) % (Math.PI * 2);
    const distClosest = Math.min(normClosest, Math.PI * 2 - normClosest);

    return distIdx < distClosest ? idx : closestIdx;
  }, 0);

  const activeSticker = dynamicStickers[frontIndex];

  // Well-proportioned orbital spacing for crisp, non-overflowing sticker layout
  const radiusX =
    windowWidth < 640
      ? 125
      : windowWidth < 1024
      ? 220
      : windowWidth < 1280
      ? 280
      : 320;
  const radiusZ = 95;

  return (
    <section
      className="relative bg-[#08090D] text-white overflow-hidden flex flex-col items-center justify-center select-none py-8 sm:py-12 md:py-14"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Dynamic 3D Stage Background Lighting */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Soft atmospheric studio spotlight overhead */}
        <div className="absolute left-1/2 top-1/3 -translate-x-1/2 -translate-y-1/2 w-[850px] h-[550px] bg-[radial-gradient(circle,rgba(214,178,94,0.08)_0%,rgba(0,0,0,0)_70%)] blur-3xl" />
        {/* Dynamic ambient color glow matching active sticker */}
        <div 
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] blur-[120px] opacity-20 transition-all duration-700"
          style={{ backgroundColor: activeSticker.accentColor }}
        />
        {/* Tactile print-bed dot matrix texture matching the showcase section */}
        <div 
          className="absolute inset-0 opacity-15"
          style={{
            backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.2) 1px, transparent 1px)',
            backgroundSize: '24px 24px',
            maskImage: 'radial-gradient(circle at 50% 45%, black 45%, transparent 85%)',
            WebkitMaskImage: 'radial-gradient(circle at 50% 45%, black 45%, transparent 85%)'
          }}
        />
      </div>

      {/* 3D Orbiting Stage Container */}
      <div
        className="relative w-full max-w-6xl h-[340px] sm:h-[390px] md:h-[440px] flex items-center justify-center cursor-grab active:cursor-grabbing px-4"
        style={{ perspective: '1200px' }}
      >
        {/* Ground Pedestal Oval Shadow */}
        <div className="absolute left-1/2 top-[82%] -translate-x-1/2 -translate-y-1/2 w-[70%] sm:w-[55%] h-16 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0.85)_0%,rgba(0,0,0,0.35)_50%,transparent_75%)] pointer-events-none blur-md" />

        {/* 3D Rotating Stickers */}
        {dynamicStickers.map((sticker, idx) => {
          // Angle for this sticker
          const theta = (angle + (idx * Math.PI * 2) / 3) % (Math.PI * 2);
          const normalizedTheta = (theta + Math.PI * 2) % (Math.PI * 2);

          const x = Math.sin(normalizedTheta) * radiusX;
          const z = Math.cos(normalizedTheta) * radiusZ; // +radiusZ is front, -radiusZ is back

          // Normalized depth factor from 0 (farthest back) to 1 (front center)
          const depthFactor = (Math.cos(normalizedTheta) + 1) / 2;

          // Scale: 0.76 at back -> 1.04 at front (well-proportioned depth without oversized footprint)
          const scale = 0.76 + 0.28 * depthFactor;

          // Gentle optical depth blur: 2.2px at back -> 0px at front
          const blur = Math.max(0, (1 - depthFactor) * 2.2).toFixed(1);

          // Opacity: 0.75 at back -> 1.0 at front (vivid and clear)
          const opacity = (0.75 + 0.25 * depthFactor).toFixed(2);

          // Z-Index: 10 at back -> 40 at front
          const zIndex = Math.round(depthFactor * 30) + 10;

          // 3D Tilt Y: angle along circle tangent facing viewer
          const rotateY = (Math.sin(normalizedTheta) * -16).toFixed(1);

          // Drop shadow depth: softer in back, crisp and deep in front
          const shadowY = Math.round(8 + 14 * depthFactor);
          const shadowBlur = Math.round(14 + 18 * depthFactor);
          const shadowAlpha = (0.07 + 0.14 * depthFactor).toFixed(2);

          const isFront = depthFactor > 0.85;

          return (
            <div
              key={sticker.id}
              onClick={(e) => {
                if (!isFront) {
                  e.preventDefault();
                  bringToFront(idx);
                }
              }}
              className={`absolute top-1/2 left-1/2 flex flex-col items-center justify-center will-change-transform ${
                isDragging ? 'transition-none' : 'transition-all duration-700 ease-out'
              }`}
              style={{
                transform: `translate3d(calc(-50% + ${x}px), calc(-50% + ${-z * 0.12}px), ${z}px) scale(${scale}) rotateY(${rotateY}deg) rotateX(-2deg)`,
                zIndex,
                filter: `blur(${blur}px)`,
                opacity,
                transformStyle: 'preserve-3d'
              }}
            >
              {/* 3D Sticker Container (Compact & Proportioned) */}
              <div
                ref={isFront ? heroAnchorRef : null}
                className="relative group w-[165px] sm:w-[205px] md:w-[240px] h-[225px] sm:h-[280px] md:h-[320px] flex items-center justify-center"
              >
                {isFront ? (
                  /* The visual graphic for front sticker is seamlessly managed by ScrollMascotSticker to fly down on scroll */
                  <div className="w-full h-full pointer-events-none" />
                ) : (
                  <>
                    {/* 3D Die-Cut Bevel Highlight effect */}
                    <div
                      className="absolute inset-0 pointer-events-none rounded-3xl transition-opacity duration-300"
                      style={{
                        opacity: isFront ? 0.35 : 0,
                        background:
                          'linear-gradient(135deg, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0) 60%)'
                      }}
                    />

                    {/* Sticker Graphic with layered 3D depth shadows */}
                    <img
                      src={sticker.src}
                      alt={sticker.name}
                      className="w-full h-full object-contain pointer-events-none select-none transition-transform duration-300"
                      style={{
                        filter: `
                          drop-shadow(0 1px 1px rgba(255,255,255,0.85))
                          drop-shadow(0 ${shadowY}px ${shadowBlur}px rgba(0,0,0,${shadowAlpha}))
                          drop-shadow(0 2px 5px rgba(0,0,0,0.06))
                        `
                      }}
                      loading="eager"
                      draggable={false}
                    />

                    {/* Subtle sheen highlight */}
                    <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl opacity-20">
                      <div className="w-[200%] h-full bg-gradient-to-r from-transparent via-white to-transparent -rotate-45 translate-x-[-100%] animate-[shine_4s_infinite]" />
                    </div>
                  </>
                )}
              </div>

              {/* Individual Ground Reflection Shadow for each sticker */}
              <div
                className="w-3/4 h-5 rounded-full bg-black/15 blur-md -mt-3 transition-opacity duration-200 pointer-events-none"
                style={{
                  opacity: (0.15 + 0.35 * depthFactor).toFixed(2),
                  transform: `scale(${scale})`
                }}
              />
            </div>
          );
        })}
      </div>

      {/* Floating Interactive Controls & Active Sticker Details */}
      <div className="relative z-30 mt-2 flex flex-col items-center gap-4">
        {/* Active Sticker Info Pill */}
        <div className="flex items-center gap-3 px-5 py-2.5 rounded-full bg-[#13141D]/90 border border-white/15 backdrop-blur-md shadow-[0_12px_35px_rgba(0,0,0,0.8)]">
          <div className="flex items-center gap-2">
            <span className="font-manrope font-extrabold text-sm sm:text-base text-white">
              {activeSticker.name}
            </span>
            <span className="text-xs text-white/50 hidden sm:inline">
              ({activeSticker.tagline})
            </span>
          </div>

          <button
            type="button"
            onClick={() => {
              document.getElementById('mascot-section')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="ml-2 inline-flex items-center gap-1 text-xs font-extrabold uppercase tracking-wider cursor-pointer transition-transform hover:translate-y-0.5"
            style={{ color: activeSticker.accentColor }}
          >
            <span>Scroll to {activeSticker.editionId === 'anime' ? 'Anime' : activeSticker.editionId === 'collections' ? 'Collections' : 'Mascot'}</span>
            <ArrowRight className="w-3.5 h-3.5 rotate-90" />
          </button>
        </div>

        {/* Carousel Stepper Buttons & Dots */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => rotateToStep('prev')}
            className="w-9 h-9 rounded-full bg-white/10 border border-white/15 hover:border-white/30 hover:bg-white/20 active:scale-95 text-white flex items-center justify-center shadow-lg transition-all cursor-pointer"
            aria-label="Previous Sticker"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Dots Indicator */}
          <div className="flex items-center gap-2 px-2">
            {dynamicStickers.map((s, idx) => (
              <button
                key={s.id}
                type="button"
                onClick={() => bringToFront(idx)}
                className={`transition-all duration-300 rounded-full cursor-pointer ${
                  frontIndex === idx
                    ? 'w-7 h-2 bg-white shadow-[0_0_8px_rgba(255,255,255,0.7)]'
                    : 'w-2 h-2 bg-white/20 hover:bg-white/45'
                }`}
                aria-label={`View ${s.name}`}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={() => rotateToStep('next')}
            className="w-9 h-9 rounded-full bg-white/10 border border-white/15 hover:border-white/30 hover:bg-white/20 active:scale-95 text-white flex items-center justify-center shadow-lg transition-all cursor-pointer"
            aria-label="Next Sticker"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
}

