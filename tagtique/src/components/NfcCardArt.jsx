import React, { useEffect, useState } from 'react';

function Pattern({ design }) {
  if (design.id === 'cyber-pulse') {
    return (
      <g fill="none" stroke={design.accent} strokeWidth="2" opacity="0.85">
        <path d="M40 80 H220 V160 H360" />
        <path d="M80 250 H300 V190 H520" />
        <circle cx="220" cy="160" r="5" fill={design.accent} />
        <circle cx="520" cy="190" r="5" fill={design.accent} />
      </g>
    );
  }
  return <rect x="48" y="300" width="120" height="1" fill={design.accent || '#3DDCFF'} />;
}

function TapMark({ color = '#3DDCFF' }) {
  return (
    <g fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" aria-hidden="true">
      <path d="M70 150 a28 28 0 0 1 28 28" />
      <path d="M70 136 a42 42 0 0 1 42 42" />
      <path d="M70 122 a56 56 0 0 1 56 56" />
    </g>
  );
}

export function NfcQr({ value, className = '' }) {
  const [src, setSrc] = useState('');

  useEffect(() => {
    if (!value) return;
    let live = true;
    import('qrcode').then((QR) =>
      QR.toDataURL(value, {
        margin: 1,
        width: 220,
        errorCorrectionLevel: 'M',
        color: { dark: '#111111', light: '#ffffff' }
      }).then((url) => {
        if (live) setSrc(url);
      })
    );
    return () => {
      live = false;
    };
  }, [value]);

  if (!src) return <div className={`bg-white ${className}`} />;
  return <img src={src} alt="NFC Profile QR Code" className={className} />;
}

export default function NfcCardArt({ design, side = 'front', qrValue, serial = 'PREVIEW' }) {
  if (!design) return null;

  const hasImages = Boolean(design.frontImage && design.backImage);
  const currentImg = side === 'front' ? design.frontImage : design.backImage;

  if (hasImages && currentImg) {
    return (
      <div className="relative w-full aspect-[856/540] overflow-hidden rounded-[18px] shadow-[0_18px_45px_rgba(0,0,0,0.6)] group/card bg-[#12131A] select-none border border-white/10">
        <img
          src={currentImg}
          alt={`${design.name} ${side}`}
          className="w-full h-full object-cover rounded-[18px] transition-transform duration-500 will-change-transform group-hover/card:scale-[1.015]"
          loading="lazy"
        />

        {/* Specular Glare & Metallic Sheen Overlay */}
        <div className="absolute inset-0 pointer-events-none rounded-[18px] bg-gradient-to-tr from-transparent via-white/12 to-transparent opacity-75 group-hover/card:opacity-100 transition-opacity" />
      </div>
    );
  }

  // Fallback SVG rendering
  const backInk = '#F5F5F5';
  return (
    <div className="relative w-full aspect-[856/540] overflow-hidden rounded-[18px] shadow-[0_16px_40px_rgba(0,0,0,0.12)] bg-[#12131A]">
      <svg viewBox="0 0 856 540" className="w-full h-full block" role="img" aria-label={`${design.name} ${side}`}>
        <rect width="856" height="540" fill={side === 'front' ? (design.front || '#0F1017') : (design.back || '#1A1B24')} />
        {side === 'front' && <Pattern design={design} />}
        {side === 'front' ? (
          <>
            <TapMark color={design.accent} />
            <text x="70" y="250" fill={design.ink || '#FFFFFF'} fontFamily="Manrope, Arial, sans-serif" fontSize="22" fontWeight="700">NFC</text>
            <text x="48" y="430" fill={design.ink || '#FFFFFF'} fontFamily="Manrope, Arial, sans-serif" fontSize="42" fontWeight="800">{design.name}</text>
            <text x="48" y="470" fill={design.ink || '#FFFFFF'} opacity="0.7" fontFamily="Manrope, Arial, sans-serif" fontSize="18">tagtique tap to share</text>
          </>
        ) : (
          <>
            <text x="48" y="90" fill={backInk} fontFamily="Manrope, Arial, sans-serif" fontSize="22" fontWeight="700">tagtique</text>
            <text x="48" y="140" fill={backInk} opacity="0.75" fontFamily="Manrope, Arial, sans-serif" fontSize="16">Scan if NFC is off</text>
            <text x="48" y="480" fill={backInk} opacity="0.55" fontFamily="Manrope, Arial, sans-serif" fontSize="14">{serial}</text>
          </>
        )}
      </svg>
    </div>
  );
}
