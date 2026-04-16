# Trading System Session Summary — April 16, 2026

## What We Built

A complete algorithmic trading signal system for **Micro Gold Futures (MGC1!)** using TradingView Desktop connected via Chrome DevTools Protocol (CDP) through the `tradingview-mcp-jackson` Node.js project.

---

## The Stack

### TradingView Connection
- **Method**: Chrome DevTools Protocol (CDP) on port 9222
- **Project**: `C:/Users/Midto/tradingview-mcp-jackson` (forked from LewisWJackson, repo: Midtownmafia/tradingview-mcp-jackson)
- **MCP Server**: runs via `node src/server.js` — gives Claude direct chart control
- **CLI**: `node src/cli/index.js` (aliased as `tv`) — all tools accessible from terminal
- **Node version**: v22.15.0

### On-Chart Indicators (MGC1! 1m/5m)
1. **MM ICT Setups** (`indicators/mm_ict_setups.pine`) — main signal indicator, 311 lines
2. **Multi Timeframe Volume Profiles [TradingIQ]** — existing indicator for MTF VP levels
3. **ManipulationX V.5**, **Algo V.17**, **10x HTF Candles V2**, **Session Volume Profiles x5**, **OnlyWicks Daily Process** — existing indicators

---

## MM ICT Setups Indicator — Full Details

Single Pine Script indicator combining three signal systems. Located at `indicators/mm_ict_setups.pine` in repo.

### Signal 1: Silver Bullet (SB labels)
- **Concept**: FVG forms during ICT kill zone → price retests FVG → enter in FVG direction
- **Kill Zones**: London (3–4am ET), NY AM (10–11am ET), NY PM (2–3pm ET)
- **Entry Logic**: Armed on FVG formation, fires ONCE when price was outside FVG prior bar then enters it. Disarms after trigger. Invalidated if price closes through FVG bottom (bull) or top (bear). Expires when kill zone ends.
- **Visual**: `SB` label above/below bar (lime = long, red = short)
- **Kill zone background**: Blue = London, Yellow = NY AM, Orange = NY PM

### Signal 2: Unicorn (◆ diamonds)
- **Concept**: Market Structure Shift → Order Block identified → FVG overlapping OB (confluence) → OB retest entry
- **Steps**: 
  1. Swing high/low pivot detected (lookback: 5 bars default)
  2. Price breaks swing = MSS (teal ▲ up / orange ▼ down)
  3. Last bearish candle before bull MSS = Bull Order Block (teal box)
  4. Last bullish candle before bear MSS = Bear Order Block (orange box)
  5. FVG that overlaps OB zone = Unicorn confluence (bright green/red box)
  6. Setup armed, fires ONCE when price retests OB from outside (was_above[1] then dips in)
  7. Disarms + requires new MSS after trigger. Invalidated if close breaks OB low/high.
- **Visual**: ◆ diamond below bar (lime = long, red = short). Tiny triangles = MSS signals.

### Signal 3: MTF VP Alignment (large ▲▼ triangles)
- **Concept**: VWAP-based value area computed for 5m, 15m, 1H. When price breaks above all three VAHs = BULLISH, below all VALs = BEARISH.
- **Method**: `ta.vwap` + `ta.stdev(hlc3, 50)` via `request.security()` for each TF
- **VAH** = VWAP + stdev × multiplier (default 1.0)
- **VAL** = VWAP − stdev × multiplier
- **Fires ONCE** on first bar of alignment, background tint while aligned, status label on right edge
- **Visual**: Large lime ▲ below bar (bull), large red ▼ above bar (bear). Dotted circle lines = 5m/15m/1H VAH/VAL. Faint green/red background while aligned.
- **VA line colors**: Teal = 5m, Orange = 15m, Purple = 1H

### How to Trade the Signals
The signals fire on setup confirmation, NOT immediate entry. Correct workflow:
1. Signal fires → **bias is set** (direction known)
2. **Wait for pullback** against the signal direction
3. **Enter** in the original signal direction on the next push
4. This gives a tight stop and better R:R

---

## Node.js Tools Built

### Volume Profile Engine
- **File**: `src/core/volprofile.js`
- **Algorithm**: TPO-style distribution — each bar's volume spread evenly across high-low range at tick resolution
- **Outputs**: POC (highest volume price), VAH/VAL (70% value area), HVNs (local volume peaks), LVNs (local volume valleys), shape (balanced/bullish_trend/bearish_trend)
- **CLI**: `tv vp compute`, `tv vp shape`, `tv vp levels`
- **MCP tools**: `vp_compute`, `vp_shape`

### MTF Alignment Detector
- **File**: `src/core/alignment.js`
- **Method**: Reads "Multi Timeframe Volume Profiles [TradingIQ]" indicator's labels from chart, parses POC/VAH/VAL per TF (5m, 15m, 1H), compares current price
- **Signals**: BULLISH (price above VAH all TFs), BEARISH (price below VAL all TFs), BULLISH/BEARISH_PARTIAL, NEUTRAL, MIXED
- **CLI**: `tv align check`
- **MCP tool**: `vp_mtf_alignment`

---

## Trading Playbook (playbook.md in repo)

Five documented setups for MGC1!:

| Setup | Direction | Description |
|-------|-----------|-------------|
| 1 | Both | MTF VP Exhaustion Reversal at VAL/VAH |
| 2 | Bearish | London KZ VAH Rejection with Absorption |
| 2B | Bullish | VAL Rejection with Absorption (mirror of 2) |
| 3 | Bearish | Trending Profile Lower High Continuation |
| 3B | Bullish | Trending Profile Higher Low Continuation |

**Session Rules**: London KZ (2–5am ET), NY AM (9:30am–noon ET). NY PM restricted — only trade with ForexFactory news filter (no red folder USD events within 5 min).

**MASTER GOAL**: Turn all playbook setups into a single Pine Script alert indicator (in progress — MM ICT Setups is the foundation).

---

## Key Files in Repo

```
tradingview-mcp-jackson/
├── playbook.md                          # Full trading playbook + setup rules
├── indicators/
│   └── mm_ict_setups.pine              # Main indicator (Silver Bullet + Unicorn + MTF VP Align)
├── src/
│   ├── server.js                        # MCP server (78 tools)
│   ├── core/
│   │   ├── volprofile.js               # Volume Profile computation engine
│   │   └── alignment.js               # MTF VP alignment detector
│   ├── tools/
│   │   ├── volprofile.js               # MCP tool registration (vp_compute, vp_shape)
│   │   └── alignment.js               # MCP tool registration (vp_mtf_alignment)
│   └── cli/commands/
│       ├── volprofile.js               # CLI: tv vp compute/shape/levels
│       └── alignment.js               # CLI: tv align check
└── SESSION_SUMMARY_2026-04-16.md       # This file
```

---

## Pending / Next Steps

- [ ] **Backtest** — run MM ICT Setups on last week's replay sessions to verify signal quality
- [ ] **Live this weekend** — crypto on Bitunix XAUUSDT with $200 test account
- [ ] **Live Monday** — Gold futures, Apex/TopStep funded account
- [ ] **FRVP Replacement (#6)** — compute POC/VAH/VAL from OHLCV and draw as horizontal lines (replaces TV built-in fixed range VP)
- [ ] **Live Alert Bot** — stream alignment + ICT signals, fire desktop notification on confluence
- [ ] **Road laptop setup** — clone repo, install Node v22, run setup-windows-cdp.ps1, configure Claude Code MCP

---

## Road Laptop Setup Instructions

```bash
# 1. Clone repo
git clone https://github.com/Midtownmafia/tradingview-mcp-jackson.git $HOME\tradingview-mcp-jackson

# 2. Run CDP setup script
powershell -ExecutionPolicy Bypass -File "$HOME\tradingview-mcp-jackson\scripts\setup-windows-cdp.ps1"

# 3. Install dependencies
cd $HOME\tradingview-mcp-jackson && npm install

# 4. Add to Claude Code MCP config (claude_desktop_config.json):
{
  "mcpServers": {
    "tradingview": {
      "command": "node",
      "args": ["C:/Users/[USERNAME]/tradingview-mcp-jackson/src/server.js"]
    }
  }
}

# 5. Launch TradingView with CDP
node src/cli/index.js launch

# 6. Test connection
node src/cli/index.js status
```

---

## Signal Reference Card

| Signal | Visual | Meaning | Action |
|--------|--------|---------|--------|
| `SB` lime label | Below bar | Silver Bullet Long setup | Wait for pullback, enter long |
| `SB` red label | Above bar | Silver Bullet Short setup | Wait for pullback, enter short |
| ◆ lime diamond | Below bar | Unicorn Long entry | Wait for pullback, enter long |
| ◆ red diamond | Above bar | Unicorn Short entry | Wait for pullback, enter short |
| Large lime ▲ | Below bar | MTF VP Bull Alignment fired | All 3 TFs agree — long bias |
| Large red ▼ | Above bar | MTF VP Bear Alignment fired | All 3 TFs agree — short bias |
| Small teal ▲ | Below bar | Bullish MSS (Unicorn step 1) | Context only |
| Small orange ▼ | Above bar | Bearish MSS (Unicorn step 1) | Context only |
| Blue background | — | London Kill Zone active | SB setups valid |
| Yellow background | — | NY AM Kill Zone active | SB setups valid |
| Orange background | — | NY PM Kill Zone active | SB setups valid (careful with news) |
| Teal dotted lines | Horizontal | 5m VAH / VAL | Key VP levels |
| Orange dotted lines | Horizontal | 15m VAH / VAL | Key VP levels |
| Purple dotted lines | Horizontal | 1H VAH / VAL | Key VP levels |
