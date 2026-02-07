/**
 * Sadece emoji görsellerinde (hero-2, hero-3):
 * - Mor/koyu arka planı tamamen kaldır
 * - Beyaz hale (kenar çizgisi) kaldır
 * Karakter sarısına dokunma.
 * Çalıştır: node tools/fix-emoji-bg.js
 */
const { Jimp } = require('jimp');
const path = require('path');
const fs = require('fs');

const HERO_DIR = path.join(__dirname, '..', 'images', 'hero-decor');
const EMOJI_HERO_INDICES = [2, 3];

// Beyaz / açık hale → şeffaf (kenar parlaması gitsin)
const WHITE_THRESHOLD = 238;
// Siyah / koyu → şeffaf
const BLACK_THRESHOLD = 45;
// Koyu mor / kahverengi arka plan (R,G,B orta-düşük)
function isDarkBackground(r, g, b) {
  if (r > 150 && g > 150 && b > 150) return false; // açık renklere dokunma
  const sum = r + g + b;
  if (sum > 380) return false; // sarı/emoji
  if (r > 180 && b < 120) return false; // sarı
  return sum < 320 || (r < 140 && g < 130 && b < 140);
}

async function processEmoji(imagePath) {
  const img = await Jimp.read(imagePath);
  img.scan(0, 0, img.bitmap.width, img.bitmap.height, function (x, y, idx) {
    const r = this.bitmap.data[idx + 0];
    const g = this.bitmap.data[idx + 1];
    const b = this.bitmap.data[idx + 2];
    const isWhite = r >= WHITE_THRESHOLD && g >= WHITE_THRESHOLD && b >= WHITE_THRESHOLD;
    const isBlack = r <= BLACK_THRESHOLD && g <= BLACK_THRESHOLD && b <= BLACK_THRESHOLD;
    const isDark = isDarkBackground(r, g, b);
    if (isWhite || isBlack || isDark) {
      this.bitmap.data[idx + 3] = 0;
    }
  });
  await img.write(imagePath);
  console.log('Düzeltildi:', path.basename(imagePath));
}

async function main() {
  for (const i of EMOJI_HERO_INDICES) {
    const p = path.join(HERO_DIR, `hero-${i}.png`);
    if (fs.existsSync(p)) await processEmoji(p);
  }
  console.log('Bitti.');
}

main().catch((e) => { console.error(e); process.exit(1); });
