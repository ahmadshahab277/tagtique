/**
 * Tagtique Central Pricing Configuration & Utility
 *
 * Pricing Rules:
 * 1. Mobile & Laptop:
 *    - 1 Sticker: PKR 600 each
 *    - Bundle of 2: PKR 1,000 (Save PKR 200)
 *    - More than 2: +PKR 450 for each sticker above 2 (1,000 + (qty - 2) * 450)
 *      - 3 Stickers: PKR 1,450 (Save PKR 350)
 *      - 4 Stickers: PKR 1,900 (Save PKR 500)
 *
 * 2. Vehicle & Simple Sticker:
 *    - 1 Sticker: PKR 1,000 each
 *    - Bundle of 2: PKR 1,500 (Save PKR 500)
 *    - More than 2: +PKR 750 for each sticker above 2 (1,500 + (qty - 2) * 750)
 *      - 3 Stickers: PKR 2,250 (Save PKR 750)
 *      - 4 Stickers: PKR 3,000 (Save PKR 1,000)
 *
 * 3. NFC Cards:
 *    - PKR 1,999 each
 */

export const PRICING_CONFIG = {
  compact: {
    single: 600,
    pack2: 1000,
    additionalPerUnit: 450,
  },
  large: {
    single: 1000,
    pack2: 1500,
    additionalPerUnit: 750,
  },
  nfc: {
    single: 1999,
  }
};

/**
 * Checks if target belongs to the Mobile / Laptop pricing tier
 */
export function isCompactTarget(target) {
  return target === 'mobile' || target === 'laptop';
}

/**
 * Calculates total price for stickers based on placement category and quantity
 * @param {'mobile'|'laptop'|'vehicle'|'sticker'|string} target
 * @param {number} quantity
 * @returns {number} total price in PKR
 */
export function calculateStickerPrice(target, quantity = 1) {
  const qty = Math.max(1, parseInt(quantity, 10) || 1);
  const cfg = isCompactTarget(target) ? PRICING_CONFIG.compact : PRICING_CONFIG.large;

  if (qty === 1) return cfg.single;
  if (qty === 2) return cfg.pack2;
  return cfg.pack2 + (qty - 2) * cfg.additionalPerUnit;
}

/**
 * Calculates regular price without bundle discount (for strikethrough comparison)
 */
export function calculateStickerOriginalPrice(target, quantity = 1) {
  const qty = Math.max(1, parseInt(quantity, 10) || 1);
  const cfg = isCompactTarget(target) ? PRICING_CONFIG.compact : PRICING_CONFIG.large;
  return cfg.single * qty;
}

/**
 * Calculates savings amount in PKR (returns 0 for single item)
 */
export function calculateStickerSavings(target, quantity = 1) {
  const original = calculateStickerOriginalPrice(target, quantity);
  const current = calculateStickerPrice(target, quantity);
  return Math.max(0, original - current);
}

/**
 * Returns formatted labels and package prices for a target
 */
export function getTargetPricingSummary(target) {
  if (isCompactTarget(target)) {
    return {
      tierName: 'Mobile & Laptop',
      singleLabel: 'PKR 600 each',
      bundleLabel: '2 for PKR 1,000',
      additionalLabel: '+PKR 450 each extra',
      pack1: 600,
      pack2: 1000,
      pack3: 1450,
      extraPerUnit: 450,
    };
  }
  return {
    tierName: 'Vehicle & Simple Sticker',
    singleLabel: 'PKR 1,000 each',
    bundleLabel: '2 for PKR 1,500',
    additionalLabel: '+PKR 750 each extra',
    pack1: 1000,
    pack2: 1500,
    pack3: 2250,
    extraPerUnit: 750,
  };
}

/**
 * Resolves line item total in cart regardless of whether it is an NFC card or sticker
 */
export function calculateItemTotal(item) {
  if (!item) return 0;
  if (item.type === 'nfc') {
    const unitPrice = Number(item.price) || PRICING_CONFIG.nfc.single;
    return unitPrice * (Number(item.quantity) || 1);
  }

  // Derive target placement from item
  const target = item.target || (
    item.badge?.toLowerCase().includes('vehicle') ||
    item.badge?.toLowerCase().includes('car') ||
    item.id?.includes('vehicle') ||
    item.id?.includes('sticker')
      ? (item.id?.includes('vehicle') || item.badge?.toLowerCase().includes('vehicle') ? 'vehicle' : 'sticker')
      : (item.id?.includes('laptop') || item.badge?.toLowerCase().includes('laptop') ? 'laptop' : 'mobile')
  );

  return calculateStickerPrice(target, item.quantity || 1);
}

