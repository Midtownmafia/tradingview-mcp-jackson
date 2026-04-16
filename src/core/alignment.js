/**
 * MTF VP Alignment Detector
 * Reads POC/VAH/VAL from the "Multi Timeframe Volume Profiles [TradingIQ]" indicator
 * and determines whether price is aligned BEARISH (above all VAHs) or BULLISH (below all VALs).
 *
 * Alignment rules (from playbook):
 *   BEARISH: price < VAH on 5m AND 15m AND 1H  →  all inside or below value area (short bias)
 *   BULLISH: price > VAL on 5m AND 15m AND 1H  →  all inside or above value area (long bias)
 *   Actually per playbook:
 *     BEARISH align = price BELOW VAH on all 3 TFs (inside or below VA)
 *     BULLISH align = price ABOVE VAL on all 3 TFs (inside or above VA)
 *
 * Per Setup 1 playbook: MTF align means all 3 TFs have price above VAH (bearish)
 * or below VAL (bullish). Let's implement:
 *   BEARISH = price < VAL on all 3 (below value area entirely)
 *   BULLISH = price > VAH on all 3 (above value area entirely)
 *   INSIDE  = price between VAL and VAH on at least one TF (mixed)
 */

import { getPineLabels } from './data.js';
import { getQuote } from './data.js';

const MTF_INDICATOR_FILTER = 'Multi Timeframe';

// Map raw TF label text to standard key
const TF_MAP = {
  '5':  '5m',
  '15': '15m',
  '1h': '1H',
  '60': '1H',
};

/**
 * Parse MTF VP indicator labels into a { tf -> { poc, vah, val } } map.
 * The indicator outputs groups of: [<TF label>, ◂ POC, ◂ VAH, ◂ VAL] in sequence.
 * The TF label OPENS each group; the next TF label (or end of array) CLOSES the previous.
 */
function parseMtfLevels(labels) {
  const levels = {};
  let currentTf = null;
  let pending = {};

  const saveGroup = () => {
    if (currentTf && pending.poc !== undefined && pending.vah !== undefined && pending.val !== undefined) {
      levels[currentTf] = { poc: pending.poc, vah: pending.vah, val: pending.val };
    }
  };

  for (const label of labels) {
    const text = (label.text || '').trim().replace(/\n/g, '').trim();
    const price = label.price;

    if (TF_MAP[text]) {
      // TF label opens a new group — save previous first
      saveGroup();
      currentTf = TF_MAP[text];
      pending = {};
    } else if (text === '◂ POC') {
      pending.poc = price;
    } else if (text === '◂ VAH') {
      pending.vah = price;
    } else if (text === '◂ VAL') {
      pending.val = price;
    }
    // ● dots and unknown labels are ignored
  }

  // Save last group
  saveGroup();

  return levels;
}

/**
 * Determine per-TF position relative to value area.
 * Returns 'above_va' | 'inside_va' | 'below_va'
 */
function classifyPosition(price, { vah, val }) {
  if (price > vah) return 'above_va';
  if (price < val) return 'below_va';
  return 'inside_va';
}

/**
 * Main alignment check.
 * @returns {Object} alignment result with per-TF breakdown and overall signal
 */
export async function checkMtfAlignment() {
  // 1. Get current price
  const quoteResult = await getQuote();
  if (!quoteResult?.last) {
    return { success: false, error: 'Could not get current price' };
  }
  const price = quoteResult.last;

  // 2. Read MTF VP labels
  const labelResult = await getPineLabels({ study_filter: MTF_INDICATOR_FILTER });
  if (!labelResult?.studies?.length) {
    return {
      success: false,
      error: 'Multi Timeframe Volume Profiles indicator not found on chart. Add it first.',
    };
  }

  const rawLabels = labelResult.studies[0]?.labels ?? [];
  if (rawLabels.length < 9) {
    return { success: false, error: `Only ${rawLabels.length} labels found — indicator may not be loaded yet` };
  }

  // 3. Parse into TF → levels
  const levels = parseMtfLevels(rawLabels);
  const foundTfs = Object.keys(levels);

  if (foundTfs.length < 2) {
    return {
      success: false,
      error: `Only found ${foundTfs.length} timeframe(s) in labels: ${foundTfs.join(', ')}. Need at least 2.`,
      raw_labels: rawLabels,
    };
  }

  // 4. Classify each TF
  const breakdown = {};
  for (const [tf, va] of Object.entries(levels)) {
    breakdown[tf] = {
      poc: va.poc,
      vah: va.vah,
      val: va.val,
      position: classifyPosition(price, va),
    };
  }

  // 5. Determine overall alignment
  const positions = Object.values(breakdown).map(b => b.position);
  const allAbove  = positions.every(p => p === 'above_va');
  const allBelow  = positions.every(p => p === 'below_va');
  const anyAbove  = positions.some(p => p === 'above_va');
  const anyBelow  = positions.some(p => p === 'below_va');

  const allInside = positions.every(p => p === 'inside_va');

  let signal, description, setup;
  if (allAbove) {
    signal      = 'BULLISH';
    description = `Price above VAH on all ${positions.length} TFs — strong long bias`;
    setup       = 'Setup 1 (mean reversion from VAH) or Setup 3B (higher low continuation)';
  } else if (allBelow) {
    signal      = 'BEARISH';
    description = `Price below VAL on all ${positions.length} TFs — strong short bias`;
    setup       = 'Setup 1 (mean reversion from VAL) or Setup 3 (lower high continuation)';
  } else if (allInside) {
    signal      = 'NEUTRAL';
    description = `Price inside value area on all ${positions.length} TFs — no directional edge`;
    setup       = 'Wait for breakout above VAH or below VAL';
  } else if (anyAbove && !anyBelow) {
    signal      = 'BULLISH_PARTIAL';
    description = 'Price above VAH on some TFs, inside VA on others — weak long lean';
    setup       = 'Wait for full alignment above VAH on all TFs';
  } else if (anyBelow && !anyAbove) {
    signal      = 'BEARISH_PARTIAL';
    description = 'Price below VAL on some TFs, inside VA on others — weak short lean';
    setup       = 'Wait for full alignment below VAL on all TFs';
  } else {
    signal      = 'MIXED';
    description = 'Price above VAH on some TFs but below VAL on others — conflicting signals';
    setup       = 'No edge — stay flat until TFs resolve';
  }

  return {
    success:   true,
    price,
    signal,
    description,
    setup,
    aligned:   allAbove || allBelow,
    timeframes: breakdown,
    tf_count:  foundTfs.length,
  };
}
