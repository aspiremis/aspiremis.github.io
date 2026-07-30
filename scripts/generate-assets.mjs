/**
 * Generates the raster assets that can't be SVG: the Apple touch icon and the
 * OpenGraph card.
 *
 * They're built from inline SVG rather than committed as binaries so the design
 * stays editable in source control — change a colour here, not in an image
 * editor. Runs as a `prebuild` step, so CI regenerates them on every deploy.
 */
import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const publicDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'public');

const COPPER = '#B45309';
const CREAM = '#FFF7ED';

const touchIcon = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <rect width="32" height="32" fill="${COPPER}"/>
  <g stroke="${CREAM}" stroke-width="2.4" stroke-linecap="round" fill="none">
    <path d="M10.5 7.5v17"/><path d="M10.5 12h10"/><path d="M10.5 20h10"/>
  </g>
  <circle cx="21.5" cy="12" r="2.4" fill="${CREAM}"/>
  <circle cx="21.5" cy="20" r="2.4" fill="${CREAM}"/>
</svg>`;

/**
 * OG card. Deliberately typographic and dark — it has to stay readable as a
 * 300px-wide thumbnail in a LinkedIn feed, which rules out anything detailed.
 */
const ogCard = `
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="glow" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#1C1512"/>
      <stop offset="100%" stop-color="#0A0A0B"/>
    </linearGradient>
    <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
      <path d="M60 0H0V60" fill="none" stroke="#26262B" stroke-width="1"/>
    </pattern>
  </defs>

  <rect width="1200" height="630" fill="url(#glow)"/>
  <rect width="1200" height="630" fill="url(#grid)" opacity="0.55"/>
  <rect x="0" y="0" width="1200" height="6" fill="${COPPER}"/>

  <!-- Identical geometry to favicon.svg, uniformly scaled 2x to 64px. -->
  <g transform="translate(80, 84) scale(2)">
    <rect width="32" height="32" rx="7.5" fill="${COPPER}"/>
    <g stroke="${CREAM}" stroke-width="2.4" stroke-linecap="round" fill="none">
      <path d="M10.5 7.5v17"/><path d="M10.5 12h10"/><path d="M10.5 20h10"/>
    </g>
    <circle cx="21.5" cy="12" r="2.4" fill="${CREAM}"/>
    <circle cx="21.5" cy="20" r="2.4" fill="${CREAM}"/>
  </g>

  <text x="80" y="300" font-family="Helvetica, Arial, sans-serif" font-size="82" font-weight="700" fill="#E4E4E7" letter-spacing="-3">Shalini Mishra</text>
  <text x="80" y="366" font-family="Helvetica, Arial, sans-serif" font-size="34" font-weight="500" fill="#E8A06A" letter-spacing="-0.5">M.Tech Power Systems Engineering · IIT Bhubaneswar</text>
  <text x="80" y="432" font-family="Georgia, serif" font-size="28" font-style="italic" fill="#A1A1AA">Understanding the grid, one simulation at a time.</text>

  <!-- One text run with tspans so the separators space themselves, rather than
       hand-placed x offsets that drift when the words change. -->
  <text x="80" y="512" font-family="Helvetica, Arial, sans-serif" font-size="21" fill="#8B8B94">
    Simulation<tspan fill="#3F3F46" dx="14">·</tspan><tspan dx="14">Research</tspan><tspan fill="#3F3F46" dx="14">·</tspan><tspan dx="14">Notes</tspan><tspan fill="#3F3F46" dx="14">·</tspan><tspan dx="14">Projects</tspan>
  </text>

  <text x="1120" y="556" text-anchor="end" font-family="Helvetica, Arial, sans-serif" font-size="21" fill="#71717A">shalini-ee.github.io</text>
</svg>`;

async function main() {
  await mkdir(publicDir, { recursive: true });

  await sharp(Buffer.from(touchIcon))
    .resize(180, 180)
    .png({ compressionLevel: 9 })
    .toFile(join(publicDir, 'apple-touch-icon.png'));

  await sharp(Buffer.from(touchIcon))
    .resize(512, 512)
    .png({ compressionLevel: 9 })
    .toFile(join(publicDir, 'icon-512.png'));

  await sharp(Buffer.from(touchIcon))
    .resize(192, 192)
    .png({ compressionLevel: 9 })
    .toFile(join(publicDir, 'icon-192.png'));

  await sharp(Buffer.from(ogCard))
    .png({ compressionLevel: 9 })
    .toFile(join(publicDir, 'og-default.png'));

  console.log('[assets] Generated apple-touch-icon, icon-192, icon-512, og-default');
}

main().catch((error) => {
  console.error('[assets] Generation failed:', error);
  process.exit(1);
});
