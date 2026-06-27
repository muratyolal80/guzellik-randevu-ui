// Generates PWA icons referenced by public/manifest.webmanifest (icon-192.png, icon-512.png).
// Brand: gold (#C59F59 family) full-bleed background (maskable safe), white 4-point sparkle.
// Run: node scripts/gen-pwa-icons.cjs
const path = require('path');
const sharp = require('sharp');

const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#CDA86A"/>
      <stop offset="1" stop-color="#B8924A"/>
    </linearGradient>
  </defs>
  <rect width="512" height="512" fill="url(#g)"/>
  <polygon points="256,76 292,220 436,256 292,292 256,436 220,292 76,256 220,220"
           fill="#FFFFFF" opacity="0.96"/>
  <circle cx="256" cy="256" r="20" fill="#B8924A"/>
</svg>`;
const buf = Buffer.from(svg);
const pub = path.join(__dirname, '..', 'public');

Promise.all([
  sharp(buf).resize(192, 192).png().toFile(path.join(pub, 'icon-192.png')),
  sharp(buf).resize(512, 512).png().toFile(path.join(pub, 'icon-512.png')),
])
  .then(() => console.log('PWA icons written to public/'))
  .catch((e) => { console.error(e); process.exit(1); });
