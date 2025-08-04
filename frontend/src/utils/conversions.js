// src/utils/conversions.js

/**
 * Number of base units in TVARA or VARA token (12 decimal places).
 * Example: 1 TVARA = 10^12 base units.
 */
export const TVARA_UNIT = 10n ** 12n;

/**
 * WAD precision for 18 decimals (e.g. USD with 18 decimals).
 * Example: 1 USD = 10^18 in WAD representation.
 */
export const WAD = 10n ** 18n;

/**
 * Converts a decimal (float or integer) to TVARA base units (BigInt).
 * @param {number} value - Decimal amount (e.g. 1.25 for 1.25 TVARA).
 * @return {bigint} Integer representation in TVARA base units.
 */
export function toTvara(value) {
  if (typeof value !== 'number') {
    throw new TypeError(`toTvara expects a number, got ${typeof value}`);
  }
  return BigInt(Math.floor(value * Number(TVARA_UNIT)));
}

/**
 * Converts TVARA base-unit BigInt to decimal number for UI display.
 * @param {bigint} big - BigInt value in base units.
 * @return {number} Human-readable decimal value.
 */
export function fromTvara(big) {
  return Number(big) / Number(TVARA_UNIT);
}

/**
 * Formats BigInt (TVARA or WAD) with thousand separators and up to given decimals.
 * @param {bigint} big - BigInt amount.
 * @param {bigint} unit - divisor unit (TVARA_UNIT or WAD).
 * @param {number} decimals - decimals in the output (default 4).
 */
export function formatBigInt(big, unit = TVARA_UNIT, decimals = 4) {
  const abs = big < 0n ? -big : big;
  const whole = abs / unit;
  const fraction = abs % unit;
  const fractionStr = fraction.toString().padStart(unit === WAD ? 18 : 12, '0').slice(0, decimals);
  const numStr = `${whole.toString()}.${fractionStr}`;
  return big < 0n ? `-${numStr}` : numStr;
}


// src/utils/conversions.js

/** WAD scaling (1e18) — same as used in your contract health calculations */

// src/utils/conversions.ts (or .js)

const HF_INFINITE = (1n << 128n) - 1n;

/**
 * Format a health factor value as a percentage.
 *
 * @param {string|bigint|number|null|undefined} raw
 * @param {object} [opts]
 *   - decimals?: number — Decimal precision (default = 2)
 *   - minSafePercent?: number — Show ⚠️ below this
 */
export function formatHealthFactor(
  raw,
  opts = {}
) {
  const { decimals = 2, minSafePercent = 120 } = opts;

  /* 1️⃣ Parse raw into BigInt */
  let hf;
  if (typeof raw === 'bigint') {
    hf = raw;
  } else if (typeof raw === 'string') {
    hf = raw.startsWith('0x') ? BigInt(raw) : BigInt(parseInt(raw, 10));
    if (isNaN(Number(raw))) return '—';
  } else if (typeof raw === 'number') {
    if (!Number.isFinite(raw) || !Number.isInteger(raw)) return '—';
    hf = BigInt(raw);
  } else {
    return '—';
  }

  /* 2️⃣ Sentinel/infinite handling */
  if (hf === HF_INFINITE) return '∞';
  if (hf === 0n) return `0.${'0'.repeat(decimals)}%`;

  /* 3️⃣ When HF < WAD, assume it's already in percent units */
  if (hf < WAD) {
    const whole = hf / 1n;
    const frac = hf % 1n;
    const fracStr = frac.toString().padStart(decimals, '0');
    let label = `${whole.toString()}.${fracStr}%`;
    if (whole < BigInt(minSafePercent)) label += ' ⚠️';
    return label;
  }

  /* 4️⃣ Otherwise, treat hf as WAD-scaled */
  const scale = BigInt(10) ** BigInt(decimals + 2);
  const scaled = (hf * scale) / WAD;
  const whole = scaled / BigInt(10 ** decimals);
  const frac = scaled % BigInt(10 ** decimals);
  const fracStr = frac.toString().padStart(decimals, '0');

  const label = `${whole.toString()}.${fracStr}%`;
  return whole < BigInt(minSafePercent)
    ? `${label} ⚠️`
    : label;
}




// conversions.js

export function formatUtilization(raw, decimals = 2) {
  if (raw === null || raw === undefined) return '—';
  let v;
  try {
    v = typeof raw === 'bigint' ? raw : BigInt(raw);
  } catch {
    return '—';
  }
  if (v === 0n) return '0.00%';

  const scale = 100n * 10n ** BigInt(decimals);
  const scaled = (v * scale) / WAD; // now an integer like 6600 for "66.00"
  const integerPart = scaled / (10n ** BigInt(decimals));
  const fracPart = (scaled % (10n ** BigInt(decimals))).toString().padStart(decimals, '0');

  return `${integerPart}.${fracPart}%`;
}
