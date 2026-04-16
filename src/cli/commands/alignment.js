import { register } from '../router.js';
import { checkMtfAlignment } from '../../core/alignment.js';

register('align', {
  description: 'MTF VP Alignment — check if 5m/15m/1H Volume Profiles all agree on direction',
  subcommands: new Map([
    ['check', {
      description: 'Check MTF VP alignment right now. Returns BULLISH, BEARISH, or NEUTRAL.',
      options: {},
      handler: () => checkMtfAlignment(),
    }],
  ]),
});
