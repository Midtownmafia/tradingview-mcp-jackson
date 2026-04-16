/**
 * Volume Profile computation engine.
 * Computes POC, VAH, VAL, HVNs, LVNs from raw OHLCV bars.
 * Uses TPO-style volume distribution — each bar's volume is distributed
 * evenly across its high-low range at tick resolution.
 */

import { getOhlcv } from './data.js';

const DEFAULT_TICK_SIZE = 0.1;   // MGC1! tick size
const DEFAULT_BINS = 200;         // histogram resolution
const VALUE_AREA_PCT = 0.70;      // 70% of volume = value area

/**
 * Distribute a bar's volume evenly across its price range.
 * Returns array of { price, volume } at tick resolution.
 */
function distributeBarVolume(bar, tickSize) {
  const { high, low, volume } = bar;
  if (high === low) return [{ price: high, volume }];

  const ticks = [];
  let p = Math.round(low / tickSize) * tickSize;
  while (p <= high + tickSize * 0.01) {
    ticks.push(Math.round(p * 1e6) / 1e6);
    p = Math.round((p + tickSize) * 1e6) / 1e6;
  }
  if (ticks.length === 0) return [{ price: high, volume }];

  const volPerTick = volume / ticks.length;
  return ticks.map(price => ({ price, volume: volPerTick }));
}

/**
 * Build a volume profile histogram from OHLCV bars.
 * @param {Array} bars - OHLCV bar array
 * @param {number} tickSize - price increment per bin
 * @param {number} bins - number of histogram bins (alternative to tickSize)
 * @returns {Map<number, number>} price → volume map
 */
function buildHistogram(bars, tickSize, bins) {
  // If bins specified, derive tickSize from range
  if (bins && !tickSize) {
    const high = Math.max(...bars.map(b => b.high));
    const low = Math.min(...bars.map(b => b.low));
    tickSize = Math.max(DEFAULT_TICK_SIZE, (high - low) / bins);
    tickSize = Math.round(tickSize / DEFAULT_TICK_SIZE) * DEFAULT_TICK_SIZE || DEFAULT_TICK_SIZE;
  }
  tickSize = tickSize || DEFAULT_TICK_SIZE;

  const histogram = new Map();
  for (const bar of bars) {
    for (const { price, volume } of distributeBarVolume(bar, tickSize)) {
      const key = Math.round(price * 1e6) / 1e6;
      histogram.set(key, (histogram.get(key) || 0) + volume);
    }
  }
  return { histogram, tickSize };
}

/**
 * Find POC, VAH, VAL from histogram.
 */
function findValueArea(histogram, valueAreaPct = VALUE_AREA_PCT) {
  const sorted = [...histogram.entries()].sort((a, b) => a[0] - b[0]);
  if (sorted.length === 0) return null;

  const totalVolume = sorted.reduce((sum, [, v]) => sum + v, 0);

  // POC = highest volume price
  let pocPrice = sorted[0][0];
  let pocVolume = 0;
  for (const [price, vol] of sorted) {
    if (vol > pocVolume) { pocVolume = vol; pocPrice = price; }
  }

  // Value area: expand outward from POC until 70% volume captured
  const pocIndex = sorted.findIndex(([p]) => p === pocPrice);
  let lo = pocIndex, hi = pocIndex;
  let accumulated = pocVolume;
  const target = totalVolume * valueAreaPct;

  while (accumulated < target && (lo > 0 || hi < sorted.length - 1)) {
    const belowVol = lo > 0 ? sorted[lo - 1][1] : 0;
    const aboveVol = hi < sorted.length - 1 ? sorted[hi + 1][1] : 0;
    if (aboveVol >= belowVol) { hi++; accumulated += sorted[hi][1]; }
    else { lo--; accumulated += sorted[lo][1]; }
  }

  return {
    poc: Math.round(pocPrice * 10) / 10,
    vah: Math.round(sorted[hi][0] * 10) / 10,
    val: Math.round(sorted[lo][0] * 10) / 10,
    poc_volume: Math.round(pocVolume),
    total_volume: Math.round(totalVolume),
    value_area_pct: Math.round((accumulated / totalVolume) * 100),
  };
}

/**
 * Find High Volume Nodes (HVNs) and Low Volume Nodes (LVNs).
 * HVN = local peak in histogram (price slows/stalls here)
 * LVN = local valley in histogram (price sprints through)
 */
function findNodes(histogram, count = 5) {
  const sorted = [...histogram.entries()].sort((a, b) => a[0] - b[0]);
  if (sorted.length < 3) return { hvns: [], lvns: [] };

  const volumes = sorted.map(([, v]) => v);
  const mean = volumes.reduce((a, b) => a + b, 0) / volumes.length;

  const hvns = [];
  const lvns = [];

  for (let i = 1; i < sorted.length - 1; i++) {
    const [price, vol] = sorted[i];
    const prev = sorted[i - 1][1];
    const next = sorted[i + 1][1];

    // Local peak above mean = HVN
    if (vol > prev && vol > next && vol > mean * 1.3) {
      hvns.push({ price: Math.round(price * 10) / 10, volume: Math.round(vol) });
    }
    // Local valley below mean = LVN
    if (vol < prev && vol < next && vol < mean * 0.7) {
      lvns.push({ price: Math.round(price * 10) / 10, volume: Math.round(vol) });
    }
  }

  // Sort by significance
  hvns.sort((a, b) => b.volume - a.volume);
  lvns.sort((a, b) => a.volume - b.volume);

  return {
    hvns: hvns.slice(0, count),
    lvns: lvns.slice(0, count),
  };
}

/**
 * Detect profile shape: balanced (bell curve) vs trending (skewed).
 */
function detectProfileShape(histogram, va) {
  const sorted = [...histogram.entries()].sort((a, b) => a[0] - b[0]);
  const range = sorted[sorted.length - 1][0] - sorted[0][0];
  if (range === 0) return 'unknown';

  const pocRelativePosition = (va.poc - sorted[0][0]) / range;

  if (pocRelativePosition > 0.6) return 'bearish_trend';   // POC near top
  if (pocRelativePosition < 0.4) return 'bullish_trend';   // POC near bottom
  return 'balanced';                                          // POC in middle
}

/**
 * Main VP compute function — called by tools and CLI.
 * @param {Object} opts
 * @param {number} opts.bars - number of bars to use (default 100)
 * @param {number} opts.tick_size - price resolution (default 0.1 for MGC)
 * @param {number} opts.bins - alternative to tick_size: number of histogram bins
 * @param {boolean} opts.include_histogram - include full histogram in output
 * @param {number} opts.node_count - number of HVNs/LVNs to return (default 5)
 */
export async function computeVolumeProfile({
  bars: barCount = 100,
  tick_size,
  bins,
  include_histogram = false,
  node_count = 5,
} = {}) {
  // Fetch bars from TradingView
  const ohlcvResult = await getOhlcv({ count: barCount });
  if (!ohlcvResult?.bars?.length) {
    return { success: false, error: 'No OHLCV data available' };
  }

  const bars = ohlcvResult.bars;
  const { histogram, tickSize } = buildHistogram(bars, tick_size, bins);
  const va = findValueArea(histogram);
  if (!va) return { success: false, error: 'Could not compute value area' };

  const { hvns, lvns } = findNodes(histogram, node_count);
  const shape = detectProfileShape(histogram, va);

  const result = {
    success: true,
    bar_count: bars.length,
    tick_size: tickSize,
    shape,                    // 'balanced' | 'bullish_trend' | 'bearish_trend'
    poc: va.poc,
    vah: va.vah,
    val: va.val,
    poc_volume: va.poc_volume,
    total_volume: va.total_volume,
    value_area_pct: va.value_area_pct,
    hvns,                     // High Volume Nodes — price stalls here
    lvns,                     // Low Volume Nodes — price sprints through
    price_range: {
      high: Math.max(...bars.map(b => b.high)),
      low: Math.min(...bars.map(b => b.low)),
    },
    time_range: {
      from: new Date(bars[0].time * 1000).toISOString(),
      to: new Date(bars[bars.length - 1].time * 1000).toISOString(),
    },
  };

  if (include_histogram) {
    result.histogram = [...histogram.entries()]
      .sort((a, b) => b[0] - a[0])
      .map(([price, volume]) => ({ price: Math.round(price * 10) / 10, volume: Math.round(volume) }));
  }

  return result;
}
