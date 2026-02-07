/**
 * Hero-decor PNG'lerindeki beyaz (ve ona yakın) arka planı şeffafa çevirir.
 * Çalıştırma: node tools/remove-white-bg.js
 */
const { Jimp } = require('jimp');
const path = require('path');
const fs = require('fs');

const HERO_DIR = path.join(__dirname, '..', 'images', 'hero-decor');
// Nazik eşikler: sadece net beyaz/siyah/mor arka plan; karakterlere dokunma
const WHITE_THRESHOLD = 252; // sadece neredeyse saf beyaz
const BLACK_THRESHOLD = 22; // sadece neredeyse saf siyah
const PURPLE_G_MAX = 100;   // sadece belirgin mor (g çok düşük)
const PURPLE_RB_MIN = 100;  // mor için r ve b yüksek

async function makeTransparent(imagePath) {
  const img = await Jimp.read(imagePath);
  img.scan(0, 0, img.bitmap.width, img.bitmap.height, function (x, y, idx) {
    const r = this.bitmap.data[idx + 0];
    const g = this.bitmap.data[idx + 1];
    const b = this.bitmap.data[idx + 2];
    const isWhite = r >= WHITE_THRESHOLD && g >= WHITE_THRESHOLD && b >= WHITE_THRESHOLD;
    const isBlack = r <= BLACK_THRESHOLD && g <= BLACK_THRESHOLD && b <= BLACK_THRESHOLD;
    const isPurple = r >= PURPLE_RB_MIN && b >= PURPLE_RB_MIN && g <= PURPLE_G_MAX;
    if (isWhite || isBlack || isPurple) {
      this.bitmap.data[idx + 3] = 0;
    }
  });
  await img.write(imagePath);
  console.log('İşlendi:', path.basename(imagePath));
}

async function main() {
  for (let i = 1; i <= 11; i++) {
    const p = path.join(HERO_DIR, `hero-${i}.png`);
    if (fs.existsSync(p)) {
      await makeTransparent(p);
    } else {
      console.warn('Bulunamadı:', p);
    }
  }
  console.log('Bitti.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
