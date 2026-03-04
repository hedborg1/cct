/**
 * Project color palette — deterministic accent colors per project name.
 */

// 16 evenly-spaced hues (360/16 = 22.5° apart) — maximises visual distinction
const PALETTE = [
  { name: 'red',        hue: 0,    s: 70, l: 55 },
  { name: 'vermilion',  hue: 22,   s: 75, l: 55 },
  { name: 'orange',     hue: 38,   s: 80, l: 50 },
  { name: 'amber',      hue: 55,   s: 80, l: 48 },
  { name: 'yellow',     hue: 72,   s: 70, l: 48 },
  { name: 'lime',       hue: 95,   s: 60, l: 45 },
  { name: 'green',      hue: 140,  s: 60, l: 45 },
  { name: 'teal',       hue: 168,  s: 60, l: 45 },
  { name: 'cyan',       hue: 190,  s: 70, l: 50 },
  { name: 'sky',        hue: 210,  s: 70, l: 55 },
  { name: 'blue',       hue: 230,  s: 65, l: 58 },
  { name: 'indigo',     hue: 255,  s: 55, l: 60 },
  { name: 'violet',     hue: 280,  s: 55, l: 60 },
  { name: 'fuchsia',    hue: 305,  s: 60, l: 55 },
  { name: 'pink',       hue: 330,  s: 65, l: 55 },
  { name: 'rose',       hue: 350,  s: 70, l: 55 },
];

function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

export function getProjectColor(projectName) {
  const hash = hashString(projectName);
  // Golden ratio scatter — distributes sequential hashes across the palette evenly
  const index = Math.floor((((hash * 0.618033988749895) % 1) + 1) % 1 * PALETTE.length);
  const { hue, s, l, name } = PALETTE[index];
  return { index, hue, s, l, name };
}
