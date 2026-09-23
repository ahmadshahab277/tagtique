import QRCode from 'qrcode';
import { buildScanUrl } from './scanUrl';

const YELLOW = '#F5B21F';
const INK = '#1C120C';

function stickerToken(item) {
  return item?.qr_code_value || item?.qrId || item?.tag_id || item?.tagId || item?.rawId || 'tagtique';
}

export function stickerFileName(item) {
  const raw = item?.vehicleNumber || item?.vehicle_number || item?.plate || item?.serialNumber || stickerToken(item);
  const safe = String(raw).replace(/[^\w\-]+/g, '-').replace(/-+/g, '-').slice(0, 40);
  return `tagtique-sticker-${safe || 'tag'}.png`;
}

function roundedRect(ctx, x, y, w, h, r) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

export async function renderStickerBlob(item) {
  const qrDataUrl = await QRCode.toDataURL(buildScanUrl(stickerToken(item)), {
    width: 720,
    margin: 1,
    errorCorrectionLevel: 'H',
    color: { dark: '#FFFFFF', light: INK }
  });

  const canvas = document.createElement('canvas');
  canvas.width = 900;
  canvas.height = 1100;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = YELLOW;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  try {
    await document.fonts.load('800 72px "Noto Sans Arabic"');
    await document.fonts.load('800 56px Manrope');
  } catch (_) {}

  ctx.fillStyle = '#FFFFFF';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const urdu = 'اسکین کریں، رابطہ کریں';
  const english = 'Scan to Contact';
  const footer = 'tagtique powered by ata';
  fitFont(ctx, urdu, 64, '"Noto Sans Arabic", "Segoe UI", Tahoma, sans-serif', canvas.width - 80);
  ctx.fillText(urdu, canvas.width / 2, 120);
  fitFont(ctx, english, 52, 'Manrope, "Segoe UI", sans-serif', canvas.width - 80);
  ctx.fillText(english, canvas.width / 2, 210);

  const qrSize = 560;
  const qrX = (canvas.width - qrSize) / 2;
  const qrY = 300;
  ctx.fillStyle = INK;
  roundedRect(ctx, qrX - 28, qrY - 28, qrSize + 56, qrSize + 56, 36);
  ctx.fill();

  const image = await loadImage(qrDataUrl);
  ctx.drawImage(image, qrX, qrY, qrSize, qrSize);

  ctx.fillStyle = '#FFFFFF';
  ctx.font = '700 32px Manrope, "Segoe UI", sans-serif';
  ctx.fillText(footer, canvas.width / 2, 1020);

  const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
  return blob;
}

function fitFont(ctx, text, size, family, maxWidth) {
  let next = size;
  ctx.font = `800 ${next}px ${family}`;
  while (ctx.measureText(text).width > maxWidth && next > 28) {
    next -= 2;
    ctx.font = `800 ${next}px ${family}`;
  }
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });
}

export function triggerFileDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}
