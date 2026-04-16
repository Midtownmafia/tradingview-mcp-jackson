/**
 * MCP tool registration for Volume Profile.
 */
import { z } from 'zod';
import { jsonResult } from './_format.js';
import { computeVolumeProfile } from '../core/volprofile.js';

export function registerVolProfileTools(server) {
  server.tool(
    'vp_compute',
    'Compute a Volume Profile from live OHLCV bars. Returns POC, VAH, VAL, HVNs (high volume nodes — price stalls), LVNs (low volume nodes — price sprints), and profile shape (balanced / bullish_trend / bearish_trend). Use this to find key levels and detect market state.',
    {
      bars: z.coerce.number().optional().describe('Number of bars to include in profile (default 100, max 500). More bars = longer time context.'),
      tick_size: z.coerce.number().optional().describe('Price resolution per bin (default 0.1 for MGC/gold). Use 0.25 for ES, 1.0 for NQ.'),
      bins: z.coerce.number().optional().describe('Alternative to tick_size — number of histogram bins (e.g., 100, 200). Overridden by tick_size if both provided.'),
      include_histogram: z.coerce.boolean().optional().describe('Include full price→volume histogram in output (default false — large output, use only when needed).'),
      node_count: z.coerce.number().optional().describe('Number of HVNs and LVNs to return (default 5).'),
    },
    async ({ bars, tick_size, bins, include_histogram, node_count }) => {
      try {
        return jsonResult(await computeVolumeProfile({ bars, tick_size, bins, include_histogram, node_count }));
      } catch (err) {
        return jsonResult({ success: false, error: err.message }, true);
      }
    }
  );

  server.tool(
    'vp_shape',
    'Quick check: is the current volume profile balanced (rotational) or trending (skewed)? Returns shape, POC position, and trading bias. Use before deciding between mean-reversion (Setup 1/2) and trend-continuation (Setup 3) entries.',
    {
      bars: z.coerce.number().optional().describe('Number of bars to analyze (default 100).'),
    },
    async ({ bars }) => {
      try {
        const result = await computeVolumeProfile({ bars, node_count: 3 });
        if (!result.success) return jsonResult(result, true);
        return jsonResult({
          success: true,
          shape: result.shape,
          poc: result.poc,
          vah: result.vah,
          val: result.val,
          bias: result.shape === 'bearish_trend' ? 'SHORT — join the trend, look for lower high (Setup 3)'
              : result.shape === 'bullish_trend' ? 'LONG — join the trend, look for higher low (Setup 3B)'
              : 'NEUTRAL — mean reversion at extremes (Setup 1/2)',
          top_hvns: result.hvns.slice(0, 3),
          top_lvns: result.lvns.slice(0, 3),
        });
      } catch (err) {
        return jsonResult({ success: false, error: err.message }, true);
      }
    }
  );
}
