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
  if (design.id === 'neo-chrome') {
    return (
      <g>
        <polygon points="620,0 856,0 856,220" fill={design.accent} opacity="0.18" />
        <polygon points="700,0 856,0 856,120" fill={design.accent} opacity="0.35" />
      </g>
    );
  }
  if (design.id === 'minimal-luxe') {
    return <rect x="48" y="250" width="72" height="2" fill={design.ink} />;
  }
  if (design.id === 'digital-creator') {
    return (
      <g>
        <rect x="0" y="0" width="18" height="540" fill={design.accent} />
        <rect x="560" y="390" width="220" height="90" fill={design.accent} />
      </g>
    );
  }
  if (design.id === 'phantom-grid') {
    return (
      <g stroke={design.accent} strokeWidth="1" opacity="0.35">
        {Array.from({ length: 8 }, (_, i) => (
          <line key={i} x1={80 + i * 90} y1="40" x2={80 + i * 90} y2="500" />
        ))}
      </g>
    );
  }
  return <rect x="48" y="300" width="120" height="1" fill={design.accent} />;
}

function TapMark({ color }) {
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
  return <img src={src} alt="" className={className} />;
}

export default function NfcCardArt({ design, side = 'front', qrValue, serial = 'PREVIEW' }) {
  const backInk = design.id === 'signature' || design.id === 'minimal-luxe' ? '#1A1A1A' : '#F5F5F5';
  return (
    <div className="relative w-full aspect-[856/540] overflow-hidden rounded-[18px] shadow-[0_16px_40px_rgba(0,0,0,0.12)]">
      <svg viewBox="0 0 856 540" className="w-full h-full block" role="img" aria-label={`${design.name} ${side}`}>
        <rect width="856" height="540" fill={side === 'front' ? design.front : design.back} />
        {side === 'front' && <Pattern design={design} />}
        {side === 'front' ? (
          <>
            <TapMark color={design.accent} />
            <text x="70" y="250" fill={design.ink} fontFamily="Manrope, Arial, sans-serif" fontSize="22" fontWeight="700">NFC</text>
            <text x="48" y="430" fill={design.ink} fontFamily="Manrope, Arial, sans-serif" fontSize="42" fontWeight="800">{design.name}</text>
            <text x="48" y="470" fill={design.ink} opacity="0.7" fontFamily="Manrope, Arial, sans-serif" fontSize="18">tagtique · tap to share</text>
          </>
        ) : (
          <>
            <text x="48" y="90" fill={backInk} fontFamily="Manrope, Arial, sans-serif" fontSize="22" fontWeight="700">tagtique</text>
            <text x="48" y="140" fill={backInk} opacity="0.75" fontFamily="Manrope, Arial, sans-serif" fontSize="16">Scan if NFC is off</text>
            <text x="48" y="480" fill={backInk} opacity="0.55" fontFamily="Manrope, Arial, sans-serif" fontSize="14">{serial}</text>
          </>
        )}
      </svg>
      {side === 'back' && (
        <div className="absolute right-4 bottom-4 w-[22%] aspect-square bg-white p-1 rounded-md">
          <NfcQr value={qrValue} className="w-full h-full" />
        </div>
      )}
    </div>
  );
}
