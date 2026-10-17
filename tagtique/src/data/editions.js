export const EDITIONS = [
  {
    id: 'hero',
    name: 'Hero',
    line: 'Shaped sticker. Bold color around the QR. Scan to contact the driver.',
    swatch: '#F59E0B',
    ink: '#111111',
    styles: [
      { id: 'amber', name: 'Amber', swatch: '#F59E0B' },
      { id: 'wave', name: 'Wave', swatch: '#1D4ED8' },
      { id: 'night', name: 'Night Gold', swatch: '#111111' },
      { id: 'blush', name: 'Blush', swatch: '#F9A8D4' }
    ]
  },
  {
    id: 'cute',
    name: 'Cute',
    line: 'Small white sticker. A face peeks over the QR.',
    swatch: '#FDE68A',
    ink: '#111111',
    styles: [
      { id: 'mimi', name: 'Mimi', swatch: '#F9A8D4', line: 'Pink · Soft · Cute', col: 0, row: 0 },
      { id: 'beat', name: 'Beat', swatch: '#60A5FA', line: 'Blue · Bright · Cute', col: 1, row: 0 },
      { id: 'bun', name: 'Bun', swatch: '#C4B5FD', line: 'Lilac · Soft · Cute', col: 2, row: 0 },
      { id: 'dash', name: 'Dash', swatch: '#F87171', line: 'Red · Bold · Cute', col: 3, row: 0 },
      { id: 'cub', name: 'Cub', swatch: '#D97706', line: 'Honey · Warm · Cute', col: 0, row: 1 },
      { id: 'scout', name: 'Scout', swatch: '#FDBA74', line: 'Tan · Playful · Cute', col: 1, row: 1 },
      { id: 'shade', name: 'Shade', swatch: '#94A3B8', line: 'Silver · Cool · Cute', col: 2, row: 1 },
      { id: 'star', name: 'Star', swatch: '#2DD4BF', line: 'Mint · Bright · Cute', col: 3, row: 1 },
      { id: 'panda', name: 'Panda', swatch: '#86EFAC', line: 'Green · Calm · Cute', col: 0, row: 2 },
      { id: 'berry', name: 'Berry', swatch: '#FB7185', line: 'Rose · Sweet · Cute', col: 1, row: 2 },
      { id: 'frog', name: 'Frog', swatch: '#4ADE80', line: 'Leaf · Happy · Cute', col: 2, row: 2 },
      { id: 'whisk', name: 'Whisk', swatch: '#A78BFA', line: 'Violet · Night · Cute', col: 3, row: 2 }
    ]
  },
  {
    id: 'karaoke',
    name: 'Karaoke',
    line: 'Mic and guitar. Navy and gold. Urdu and English.',
    swatch: '#111827',
    ink: '#F5D76E',
    styles: [
      { id: 'gold', name: 'Gold QR', swatch: '#E8B923' },
      { id: 'classic', name: 'Classic QR', swatch: '#F8F5EF' }
    ]
  },
  {
    id: 'limited',
    name: 'Limited',
    line: 'Four original abstract prints.',
    swatch: '#312E81',
    ink: '#111111',
    styles: [
      {
        id: 'cosmic-drift',
        name: 'Cosmic Drift',
        swatch: '#312E81',
        line: 'Orbital rings on deep navy',
        image: '/assets/limited/cosmic-drift.svg'
      },
      {
        id: 'neon-circuit',
        name: 'Neon Circuit',
        swatch: '#22D3EE',
        line: 'Geometric lines, no characters',
        image: '/assets/limited/neon-circuit.svg'
      },
      {
        id: 'midnight-phantom',
        name: 'Midnight Phantom',
        swatch: '#18181B',
        line: 'Moody monochrome shapes',
        image: '/assets/limited/midnight-phantom.svg'
      },
      {
        id: 'solar-bloom',
        name: 'Solar Bloom',
        swatch: '#F59E0B',
        line: 'Layered sunburst petals',
        image: '/assets/limited/solar-bloom.svg'
      }
    ]
  }
];

export const STICKER_PRICE_PKR = 999;

export function findEdition(id) {
  return EDITIONS.find((edition) => edition.id === id) || null;
}

export function productSlug(editionId, styleId) {
  return `${editionId}-${styleId}`;
}

export function allProducts() {
  return EDITIONS.flatMap((edition) =>
    edition.styles.map((style) => ({
      ...style,
      editionId: edition.id,
      editionName: edition.name,
      slug: productSlug(edition.id, style.id),
      pricePkr: STICKER_PRICE_PKR
    }))
  );
}

export function findProduct(slug) {
  return allProducts().find((product) => product.slug === slug) || null;
}
