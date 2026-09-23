import QRCode from 'qrcode';
import { buildScanUrl } from './scanUrl';

const YELLOW = '#F5B21F';
const WHITE = '#FFFFFF';
const INK = '#1B0F06';

function stickerToken(item) {
  return item?.qr_code_value || item?.qrId || item?.tag_id || item?.tagId || item?.rawId || 'tagtique';
}

export function stickerFileName(item) {
  const raw = item?.vehicleNumber || item?.vehicle_number || item?.plate || item?.serialNumber || stickerToken(item);
  const safe = String(raw).replace(/[^\w\-]+/g, '-').replace(/-+/g, '-').slice(0, 40);
  return `tagtique-sticker-${safe || 'tag'}.png`;
}

export async function renderStyledQrDataUrl(text) {
  const canvas = drawStyledQr(text);
  return canvas.toDataURL('image/png');
}

export async function renderStickerBlob(item) {
  const qrDataUrl = await renderStyledQrDataUrl(buildScanUrl(stickerToken(item)));

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

  ctx.fillStyle = WHITE;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const urdu = 'اسکین کریں، رابطہ کریں';
  const english = 'Scan to Contact Driver';
  fitFont(ctx, urdu, 52, '"Noto Sans Arabic", "Segoe UI", Tahoma, sans-serif', canvas.width - 90);
  ctx.fillText(urdu, canvas.width / 2, 78);
  fitFont(ctx, english, 40, 'Manrope, "Segoe UI", sans-serif', canvas.width - 90);
  ctx.fillText(english, canvas.width / 2, 142);

  const image = await loadImage(qrDataUrl);
  const qrSize = 820;
  const qrX = (canvas.width - qrSize) / 2;
  const qrY = 190;
  ctx.drawImage(image, qrX, qrY, qrSize, qrSize * (image.height / image.width));

  const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
  return blob;
}

function drawStyledQr(text) {
  const qr = QRCode.create(text, { errorCorrectionLevel: 'H' });
  const count = qr.modules.size;
  const margin = 4;
  const cell = 16;
  const footer = 52;
  const span = (count + margin * 2) * cell;
  const canvas = document.createElement('canvas');
  canvas.width = span;
  canvas.height = span + footer;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = YELLOW;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const center = (count - 1) / 2;
  const clearRadius = 3.4;
  const inFinder = (row, col) => (
    (row < 7 && col < 7) ||
    (row < 7 && col >= count - 7) ||
    (row >= count - 7 && col < 7)
  );

  ctx.fillStyle = INK;
  for (let row = 0; row < count; row += 1) {
    for (let col = 0; col < count; col += 1) {
      if (!qr.modules.get(row, col) || inFinder(row, col)) continue;
      const dx = col - center;
      const dy = row - center;
      if (dx * dx + dy * dy < clearRadius * clearRadius) continue;
      ctx.fillRect((col + margin) * cell, (row + margin) * cell, cell, cell);
    }
  }

  drawFinderEye(ctx, 0, 0, cell, margin);
  drawFinderEye(ctx, count - 7, 0, cell, margin);
  drawFinderEye(ctx, 0, count - 7, cell, margin);

  const icon = cell * 4.2;
  const mid = (margin + count / 2) * cell;
  ctx.fillStyle = YELLOW;
  ctx.beginPath();
  ctx.arc(mid, mid, icon * 0.62, 0, Math.PI * 2);
  ctx.fill();
  drawPhoneIcon(ctx, mid - icon / 2, mid - icon / 2, icon, INK);

  ctx.save();
  ctx.strokeStyle = INK;
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.roundRect(4, 4, span - 8, span - 8, 22);
  ctx.stroke();
  ctx.restore();

  ctx.fillStyle = WHITE;
  ctx.font = '600 22px Manrope, "Segoe UI", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('powered by Tagtique', canvas.width / 2, span + footer / 2);
  return canvas;
}

function drawFinderEye(ctx, col, row, cell, margin) {
  const x = (col + margin) * cell;
  const y = (row + margin) * cell;
  ctx.fillStyle = INK;
  ctx.fillRect(x, y, 7 * cell, 7 * cell);
  ctx.fillStyle = YELLOW;
  ctx.fillRect(x + cell, y + cell, 5 * cell, 5 * cell);
  ctx.fillStyle = INK;
  ctx.fillRect(x + 2 * cell, y + 2 * cell, 3 * cell, 3 * cell);
}

function drawPhoneIcon(ctx, x, y, size, color) {
  const path = new Path2D('M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z');
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(size / 24, size / 24);
  ctx.fillStyle = color;
  ctx.fill(path);
  ctx.restore();
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
