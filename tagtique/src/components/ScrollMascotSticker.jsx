import React, { useEffect, useState, useRef, useCallback } from 'react';

/**
 * ScrollMascotSticker
 * 
 * Orchestrates the seamless scroll flight of the Cool Boy sticker from the Hero Section
 * directly down into the Mascot Edition container as the user scrolls.
 * Ensures only ONE single sticker exists across the experience.
 */
export default function ScrollMascotSticker({ 
  heroAnchorRef, 
  mascotAnchorRef, 
  isDocked, 
  onDockChange,
  activeCharacter
}) {
  const [coords, setCoords] = useState(null);
  const isDockedRef = useRef(false);
  const rafRef = useRef(null);

  const calculateMotion = useCallback(() => {
    if (!heroAnchorRef?.current || !mascotAnchorRef?.current) return;

    const heroRect = heroAnchorRef.current.getBoundingClientRect();
    const mascotRect = mascotAnchorRef.current.getBoundingClientRect();

    const heroCenterX = heroRect.left + heroRect.width / 2;
    const heroCenterY = heroRect.top + heroRect.height / 2;

    const mascotCenterX = mascotRect.left + mascotRect.width / 2;
    const mascotCenterY = mascotRect.top + mascotRect.height / 2;

    const currentScrollY = window.scrollY || window.pageYOffset || 0;

    // Viewport target resting line for the Mascot pedestal:
    // When the mascot container is comfortably centered in the viewport
    const targetViewportY = window.innerHeight * 0.48;

    // Document offset of the Mascot pedestal center:
    const mascotDocCenterY = mascotCenterY + currentScrollY;

    // Scroll position where Mascot container reaches prime docked position:
    const dockScrollY = Math.max(mascotDocCenterY - targetViewportY, 200);

    // Normalized progress: 0 (top of page in hero) -> 1 (docked on mascot pedestal)
    const rawProgress = currentScrollY / dockScrollY;
    const progress = Math.min(Math.max(rawProgress, 0), 1);

    if (progress >= 0.98) {
      if (!isDockedRef.current) {
        isDockedRef.current = true;
        onDockChange(true);
      }
    } else {
      if (isDockedRef.current) {
        isDockedRef.current = false;
        onDockChange(false);
      }

      // Smooth custom easing: gentle acceleration, fast glide, soft settling
      const ease = progress < 0.5
        ? 4 * progress * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 3) / 2;

      // Coordinate interpolation
      const currentX = heroCenterX + (mascotCenterX - heroCenterX) * ease;
      const currentY = heroCenterY + (mascotCenterY - heroCenterY) * ease;

      // Dimensions
      const currentWidth = heroRect.width + (mascotRect.width - heroRect.width) * ease;
      const currentHeight = heroRect.height + (mascotRect.height - heroRect.height) * ease;

      // 3D aerodynamic flight physics
      const flightLift = Math.sin(progress * Math.PI) * 0.14; // gentle lift towards viewer
      const flightRotateY = Math.sin(progress * Math.PI) * -16; // subtle aerodynamic roll
      const flightRotateX = Math.sin(progress * Math.PI) * 10; // slight nose-down tilt

      setCoords({
        x: currentX,
        y: currentY,
        width: currentWidth,
        height: currentHeight,
        scale: 1 + flightLift,
        rotateY: flightRotateY,
        rotateX: flightRotateX,
        progress
      });
    }
  }, [heroAnchorRef, mascotAnchorRef, onDockChange]);

  useEffect(() => {
    const onScrollOrResize = () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(calculateMotion);
    };

    window.addEventListener('scroll', onScrollOrResize, { passive: true });
    window.addEventListener('resize', onScrollOrResize, { passive: true });

    // Initial position calculation after layout
    calculateMotion();
    const timer = setTimeout(calculateMotion, 100);

    return () => {
      window.removeEventListener('scroll', onScrollOrResize);
      window.removeEventListener('resize', onScrollOrResize);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      clearTimeout(timer);
    };
  }, [calculateMotion]);

  // When docked, the sticker is rendered in-flow inside MascotSection.
  if (isDocked || !coords) return null;

  const characterSrc = activeCharacter?.src || '/assets/stickers/designed/Gray_Sunglasses.png';
  const characterName = activeCharacter?.name || 'Mascot';
  const accentColor = activeCharacter?.accentColor || '#8B5CF6';

  return (
    <div
      className="fixed pointer-events-none select-none z-50 will-change-transform"
      style={{
        left: `${coords.x}px`,
        top: `${coords.y}px`,
        width: `${coords.width}px`,
        height: `${coords.height}px`,
        transform: `translate3d(-50%, -50%, 0) scale(${coords.scale}) rotateY(${coords.rotateY}deg) rotateX(${coords.rotateX}deg)`,
        transformStyle: 'preserve-3d',
        transition: 'none'
      }}
      aria-hidden="true"
    >
      <div className="relative w-full h-full flex items-center justify-center">
        {/* Specular sheen layer during motion */}
        <div 
          className="absolute inset-0 pointer-events-none rounded-3xl transition-opacity duration-300"
          style={{
            opacity: coords.progress > 0.05 && coords.progress < 0.95 ? 0.35 : 0.15,
            background: 'linear-gradient(135deg, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0) 65%)'
          }}
        />

        {/* High-Resolution Active Character Graphic */}
        <img
          src={characterSrc}
          alt={`${characterName} Mascot Moving`}
          className="w-full h-full object-contain pointer-events-none select-none"
          style={{
            filter: `
              drop-shadow(0 2px 4px rgba(255,255,255,0.85))
              drop-shadow(0 ${14 + Math.round(coords.progress * 8)}px ${24 + Math.round(coords.progress * 8)}px rgba(0,0,0,0.5))
              drop-shadow(0 6px 18px ${accentColor}50)
            `
          }}
          draggable={false}
          loading="eager"
        />

        {/* Subtle dynamic flight shadow under the sticker */}
        <div
          className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-3/4 h-5 rounded-full bg-black/20 blur-md pointer-events-none"
          style={{
            opacity: Math.max(0.2, 0.45 - coords.progress * 0.15),
            transform: `scale(${coords.scale})`
          }}
        />
      </div>
    </div>
  );
}
