import { register } from '../router.js';
import { computeVolumeProfile } from '../../core/volprofile.js';

register('vp', {
  description: 'Volume Profile tools — POC, VAH, VAL, HVNs, LVNs from live bars',
  subcommands: new Map([
    ['compute', {
      description: 'Compute full volume profile from live bars',
      options: {
        bars:      { type: 'string',  short: 'n', description: 'Number of bars (default 100, max 500)' },
        'tick-size': { type: 'string', short: 't', description: 'Price resolution per bin (default 0.1 for gold)' },
        bins:      { type: 'string',  description: 'Histogram bins — alternative to tick-size' },
        histogram: { type: 'boolean', description: 'Include full histogram in output' },
        nodes:     { type: 'string',  description: 'Number of HVNs/LVNs to return (default 5)' },
      },
      handler: (opts) => computeVolumeProfile({
        bars:              opts.bars      ? parseInt(opts.bars)            : undefined,
        tick_size:         opts['tick-size'] ? parseFloat(opts['tick-size']) : undefined,
        bins:              opts.bins      ? parseInt(opts.bins)            : undefined,
        include_histogram: !!opts.histogram,
        node_count:        opts.nodes     ? parseInt(opts.nodes)           : undefined,
      }),
    }],
    ['shape', {
      description: 'Quick profile shape check: balanced or trending? Returns bias (Setup 1/2 vs 3)',
      options: {
        bars: { type: 'string', short: 'n', description: 'Number of bars (default 100)' },
      },
      handler: async (opts) => {
        const r = await computeVolumeProfile({ bars: opts.bars ? parseInt(opts.bars) : undefined, node_count: 3 });
        if (!r.success) return r;
        return {
          shape: r.shape,
          poc: r.poc,
          vah: r.vah,
          val: r.val,
          bias: r.shape === 'bearish_trend' ? 'SHORT — look for lower high (Setup 3)'
              : r.shape === 'bullish_trend'  ? 'LONG — look for higher low (Setup 3B)'
              : 'NEUTRAL — mean reversion at extremes (Setup 1/2)',
          top_hvns: r.hvns.slice(0, 3),
          top_lvns: r.lvns.slice(0, 3),
        };
      },
    }],
    ['levels', {
      description: 'Get POC, VAH, VAL, HVNs, LVNs — no histogram',
      options: {
        bars: { type: 'string', short: 'n', description: 'Number of bars (default 100)' },
      },
      handler: async (opts) => {
        const r = await computeVolumeProfile({ bars: opts.bars ? parseInt(opts.bars) : undefined, node_count: 5 });
        if (!r.success) return r;
        return {
          poc: r.poc, vah: r.vah, val: r.val,
          shape: r.shape,
          hvns: r.hvns,
          lvns: r.lvns,
          bar_count: r.bar_count,
          time_range: r.time_range,
        };
      },
    }],
  ]),
});
