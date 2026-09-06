// Deterministic "专属像素小人" generator — 8x8, full-bleed (every cell painted,
// no empty margin), mirrored left/right. Same seed always produces the same
// little pixel character, so a person's avatar can be regenerated later (e.g.
// in the admin dashboard) purely from the seed stored alongside their
// submission, without storing any image data.

export const AVATAR_SIZE = 8;

const FACE_PALETTE = [
  "#F2C94C",
  "#F2994A",
  "#EB5757",
  "#BB6BD9",
  "#56CCF2",
  "#6FCF97",
  "#E0E0E0",
  "#C68B59",
];
const SHIRT_PALETTE = [
  "#2D9CDB",
  "#EB5757",
  "#27AE60",
  "#9B51E0",
  "#F2C94C",
  "#F2994A",
  "#828282",
  "#F5F4F0",
];
const HAIR_PALETTE = ["#111111", "#FFFFFF", "#7C5E48", "#F2C94C"];
const ACCENT_PALETTE = ["#F2C94C", "#56CCF2", "#BB6BD9", "#6FCF97"];
const SHOE_PALETTE = ["#2b2b2e", "#3a3a3d", "#454548"];

// which of the 4 left-half columns (0..3, mirrored to 7..4) carry hair on row 0
const HAIR_VARIANTS: boolean[][] = [
  [true, true, true, true], // full bangs
  [false, true, true, true], // side part
  [false, false, true, true], // center tuft / mohawk
  [true, false, false, false], // thin side tuft
];

const BG = "#0b0b0d";

function hashSeed(str: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed: number) {
  let a = seed;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export interface AvatarSpec {
  seed: string;
  bg: string;
  grid: string[][]; // 8x8, every cell filled — no transparent/background gaps
}

export function buildAvatarSpec(seed: string): AvatarSpec {
  const rand = mulberry32(hashSeed(seed || "scaa"));
  const face = FACE_PALETTE[Math.floor(rand() * FACE_PALETTE.length)];
  const shirt = SHIRT_PALETTE[Math.floor(rand() * SHIRT_PALETTE.length)];
  const hair = HAIR_PALETTE[Math.floor(rand() * HAIR_PALETTE.length)];
  const hairVar = HAIR_VARIANTS[Math.floor(rand() * HAIR_VARIANTS.length)];
  const eyeWide = rand() < 0.5;
  const accent = ACCENT_PALETTE[Math.floor(rand() * ACCENT_PALETTE.length)];
  const accessory = Math.floor(rand() * 3); // 0 none, 1 headband, 2 cheek mark
  const shoe = SHOE_PALETTE[Math.floor(rand() * SHOE_PALETTE.length)];

  const grid: string[][] = Array.from({ length: 8 }, () => new Array(8).fill(BG));
  const setMirrored = (r: number, c: number, color: string) => {
    grid[r][c] = color;
    grid[r][7 - c] = color;
  };

  for (let c = 0; c < 4; c++) setMirrored(0, c, hairVar[c] ? hair : face);
  for (let c = 0; c < 4; c++) setMirrored(1, c, accessory === 1 ? accent : face);
  for (let c = 0; c < 4; c++) {
    const isEye = eyeWide ? c === 0 || c === 2 : c === 1;
    setMirrored(2, c, isEye ? BG : face);
  }
  for (let c = 0; c < 4; c++) setMirrored(3, c, accessory === 2 && c === 0 ? accent : face);
  for (let r = 4; r <= 6; r++) for (let c = 0; c < 4; c++) setMirrored(r, c, shirt);
  for (let c = 0; c < 4; c++) setMirrored(7, c, shoe);

  return { seed, bg: BG, grid };
}

export function randomSeed(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}
