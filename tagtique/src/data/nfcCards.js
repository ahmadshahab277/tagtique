export const NFC_CARD_PRICE_PKR = 999;

export const NFC_DESIGNS = [
  {
    id: 'cyber-pulse',
    name: 'Cyber Pulse',
    line: 'Dark card, geometric lines, a small tap mark.',
    front: '#070B14',
    ink: '#E8F4FF',
    accent: '#3DDCFF',
    back: '#0B1220'
  },
  {
    id: 'neo-chrome',
    name: 'Neo Chrome',
    line: 'Cool metal tones and a sharp corner mark.',
    front: '#1C1F26',
    ink: '#F4F1EA',
    accent: '#D6B25E',
    back: '#12141A'
  },
  {
    id: 'minimal-luxe',
    name: 'Minimal Luxe',
    line: 'Warm paper, wide space, thin type.',
    front: '#F6F1E8',
    ink: '#1A1A1A',
    accent: '#1A1A1A',
    back: '#EFE8DC'
  },
  {
    id: 'digital-creator',
    name: 'Digital Creator',
    line: 'Bold blocks for a profile you tap to share.',
    front: '#111111',
    ink: '#FFFFFF',
    accent: '#FF4D2E',
    back: '#1A1A1A'
  },
  {
    id: 'phantom-grid',
    name: 'Phantom Grid',
    line: 'Black grid with a restrained green line.',
    front: '#050505',
    ink: '#F5F5F5',
    accent: '#9BE36A',
    back: '#0E0E0E'
  },
  {
    id: 'signature',
    name: 'Signature',
    line: 'Black and cream, set up like a numbered card.',
    front: '#111111',
    ink: '#F3E6C8',
    accent: '#F3E6C8',
    back: '#F7F1E4'
  }
];

export function findNfcDesign(id) {
  return NFC_DESIGNS.find((design) => design.id === id) || null;
}
