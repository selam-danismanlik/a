// puzzle.js — Bulmaca üreteci

const DIFF_CONFIG = {
  easy:   { min: 2, max: 9  },
  medium: { min: 2, max: 12 },
  hard:   { min: 2, max: 15 },
};

function randInt(a, b, rng) {
  return Math.floor((rng || Math.random)() * (b - a + 1)) + a;
}

function shelfProduct(nums) {
  return nums.reduce((a, b) => a * b, 1);
}

/* Fisher-Yates karıştırıcı (isteğe bağlı seeded rng) */
function shuffleArr(arr, rng) {
  const r = rng || Math.random;
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/* ── Seeded RNG (Mulberry32) — Günlük bulmaca için ── */
function mulberry32(seed) {
  return function () {
    seed |= 0; seed = seed + 0x6D2B79F5 | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = t + Math.imul(t ^ (t >>> 7), 61 | t) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function getDailySeed(difficulty) {
  const d = new Date();
  const dateNum = d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
  const diffNum = { easy: 1, medium: 2, hard: 3 }[difficulty] || 1;
  return dateNum * 10 + diffNum;
}

/* ── Tek üretim denemesi ── */
function _tryGenerate(difficulty, rng) {
  const r = rng || Math.random;
  const { min, max } = DIFF_CONFIG[difficulty];
  const solution = [];

  for (let i = 0; i < 10; i++) {
    const size = r() < 0.5 ? 2 : 3;
    const nums = Array.from({ length: size }, () => randInt(min, max, r));
    solution.push({ id: i, target: shelfProduct(nums), size, nums: [...nums] });
  }

  const pool2 = [], pool3 = [];
  solution.forEach(s => (s.size === 2 ? pool2 : pool3).push(...s.nums));

  shuffleArr(pool2, r);
  shuffleArr(pool3, r);

  const scrambled = solution.map(s => ({
    id: s.id, target: s.target, size: s.size, nums: [], locked: false,
  }));

  let i2 = 0, i3 = 0;
  scrambled.forEach(s => {
    s.nums = s.size === 2
      ? [pool2[i2++], pool2[i2++]]
      : [pool3[i3++], pool3[i3++], pool3[i3++]];
  });

  return scrambled;
}

/*
 * Ana üretici — başlangıçta hiçbir raf doğru olmayacak şekilde üretir.
 * Seeded RNG verilirse (günlük bulmaca) tek denemede döndürür.
 */
function generateGame(difficulty = 'easy', rng) {
  if (rng) return _tryGenerate(difficulty, rng); // seeded: deterministik

  for (let attempt = 0; attempt < 200; attempt++) {
    const scrambled = _tryGenerate(difficulty);
    if (!scrambled.some(s => shelfProduct(s.nums) === s.target)) return scrambled;
  }
  return _tryGenerate(difficulty);
}

/* Günlük bulmaca üretici */
function generateDailyGame(difficulty = 'medium') {
  const rng = mulberry32(getDailySeed(difficulty));
  let result = _tryGenerate(difficulty, rng);
  // Başlangıçta hiçbir raf çözülmüş olmasın
  let attempts = 0;
  while (result.some(s => shelfProduct(s.nums) === s.target) && attempts++ < 50) {
    result = _tryGenerate(difficulty, mulberry32(getDailySeed(difficulty) + attempts));
  }
  return result;
}
