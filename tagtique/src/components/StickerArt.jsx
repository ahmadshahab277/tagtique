import React from 'react';

const SHEET = '/assets/cute-sheet.jpg';

export function cuteSheetStyle(product) {
  return {
    backgroundImage: `url(${SHEET})`,
    backgroundSize: '400% 300%',
    backgroundPosition: `${(product.col / 3) * 100}% ${(product.row / 2) * 100}%`,
    backgroundRepeat: 'no-repeat'
  };
}

export default function StickerArt({ product, className = '' }) {
  if (product?.image) {
    return <img src={product.image} alt="" className={`w-full h-full object-contain ${className}`} />;
  }
  if (product?.col != null && product?.row != null) {
    return <div className={`w-full h-full ${className}`} style={cuteSheetStyle(product)} role="img" aria-label={product.name} />;
  }
  return (
    <div className={`w-full h-full bg-[#12131A] ${className}`} />
  );
}
