/**
 * MCP tool registration for MTF VP Alignment Detector.
 */
import { z } from 'zod';
import { jsonResult } from './_format.js';
import { checkMtfAlignment } from '../core/alignment.js';

export function registerAlignmentTools(server) {
  server.tool(
    'vp_mtf_alignment',
    'Check if price is aligned across 5m, 15m, and 1H Volume Profiles. Returns BULLISH (price above VAH on all TFs), BEARISH (price below VAL on all TFs), or NEUTRAL (mixed). Use before entering a trade — only trade in the direction of full MTF alignment. Reads the "Multi Timeframe Volume Profiles [TradingIQ]" indicator that must be visible on your chart.',
    {},
    async () => {
      try {
        return jsonResult(await checkMtfAlignment());
      } catch (err) {
        return jsonResult({ success: false, error: err.message }, true);
      }
    }
  );
}
