# Setup 2B: Bullish VAL Rejection with Absorption — Failed Auction
**Mirror of:** `bearish_vah_rejection_absorption` (Setup 2)  
**Type:** Mean Reversion / Failed Auction  
**Difficulty:** Intermediate — patience required, NOT a reactive entry  
**Instrument:** COMEX_MINI:MGC1! (Micro Gold Futures) — 1 Minute Chart  
**Session:** Any approved kill zone  

---

## Core Concept

Exact mirror of Setup 2. Price spikes BELOW VAL sweeping sell-side liquidity (stops below the low). Instead of immediately reversing, it consolidates below VAL — smart money is absorbing every sell order into their longs. When selling dries up, price closes back above VAL and the move up begins. The absorption zone becomes the support floor for the rest of the move.

---

## Market Context Required

| Element | Requirement |
|---------|-------------|
| MTF 5m | Price at or below VAL |
| MTF 15m | Price at or below VAL |
| MTF 1H | Price at or below VAL |
| 4H/1H Bias | Bullish or neutral |
| Session age | More than 30 minutes old |
| Profile shape | Balanced or bullish trending (POC near bottom) |

---

## Setup Anatomy

### Phase 1 — Liquidity Sweep Below VAL
- Price spikes below MTF VAL — sweeps stop orders sitting below the low
- This is NOT your entry — it is the alert to start watching
- The spike can look like a genuine breakdown — do not chase it short
- Key tell: price closes the spike candle as a long lower wick or doji — body does not hold below VAL

### Phase 2 — Absorption Zone (5–10 bars)
**Must observe this phase before entry.**
- Price consolidates BELOW VAL for 5–10 bars
- During this period:
  - Candle **bodies shrink** — neither side has conviction
  - **Wicks grow** — probes lower and higher, finding no continuation
  - **Volume tapers** — selling pressure exhausting
  - Each push lower makes a higher low or equal low — no expansion downward
- Smart money is absorbing every short order into their long positions

### Phase 3 — Failed Continuation / Entry Trigger
- Price attempts one more push below the absorption zone low — fails, closes back above
- **OR** price simply lifts and closes back above MTF VAL without a final push
- **ENTRY: 1m close back ABOVE MTF VAL after the absorption zone**
- Aggressive: buy the close of the bar that breaks back above VAL
- Conservative: wait for a retest of VAL from above, buy the hold

### Phase 4 — Move to Target
- Once VAL breaks with a body close above, move accelerates through LVN above
- Target 1 = MTF POC (first area of value above — expect a brief pause here)
- Target 2 = Previous session VAL or nearest session VP level above
- Target 3 = MTF VAH if momentum continues

---

## Entry, Stop, Target

| Parameter | Level | Notes |
|-----------|-------|-------|
| **Entry (aggressive)** | Close of bar that breaks back above VAL | Buy the break |
| **Entry (conservative)** | Retest of VAL from above after break | Better R:R, may miss move |
| **Stop** | Below the lowest wick of the absorption zone | Below the spike low |
| **Target 1** | MTF POC | Partial / move stop to BE |
| **Target 2** | Nearest session VP level above (prev session VAL) | Full target |
| **Target 3** | MTF VAH | Runner if strong momentum |

---

## Alert Criteria (When to Get Ready)

Alert fires when ALL of the following are true:
1. Price closes BELOW VAL on 5m timeframe
2. Price closes BELOW VAL on 15m timeframe
3. Price closes BELOW VAL on 1H timeframe
4. Session is more than 30 minutes old
5. 4H/1H bias is bullish or neutral

**WATCH state activated — monitor for absorption phase to develop.**

---

## Entry Criteria (When to Pull the Trigger)

Enter LONG when ALL of the following are true after alert fires:
1. Price has been below VAL for **at least 5 bars** (absorption confirmed)
2. Candle bodies have shrunk during the absorption zone
3. Volume has tapered — no expanding volume on pushes lower
4. Price closes back ABOVE VAL with a body (not just a wick)
5. No major key level sitting within 20 ticks above as immediate resistance
6. Absorption lasted **no more than 15 bars** (if longer, value is migrating lower — abort)

---

## Take Profit Criteria

**Partial / Target 1 (MTF POC):**
- Close half at MTF POC
- Move stop to breakeven on remainder

**Full / Target 2 (nearest session VP level above):**
- Previous session VAL, overnight VP level, or weekly VP level above
- Exit if 5m candle closes back below VAL (momentum exhausted)

**Trail stop rule:**
- Once T1 hit, trail stop to swing low of most recent pullback
- Exit if price closes back below 5m VAL with conviction

---

## Stop Management

- Initial stop: below lowest wick of absorption zone (the spike low)
- If price immediately accelerates up through LVN: trail stop to swing low of each pullback
- Hard exit: price closes back BELOW VAL with expanding volume = genuine breakdown, thesis wrong

---

## Key Observations / Lessons

1. **The spike below VAL is NOT the entry** — many traders short the breakdown and get trapped. Wait for absorption to confirm the trap.

2. **Absorption duration 5–10 bars is ideal**. Under 5 bars = not enough distribution time. Over 15 bars = value migrating lower, not rejecting.

3. **Volume taper is the tell**: if volume is expanding during consolidation below VAL, sellers still in control — do not buy yet.

4. **The LVN above VAL** is what gives R:R. Price moves fast through thin areas. Your stop is below the spike, target is far above through a thin zone.

5. **The spike below VAL serves a purpose**: it sweeps the stops of all the longs below the level AND generates the inventory smart money needs to drive price higher.

---

## What Would Have Invalidated This Setup

- Absorption zone price makes a new low with **expanding volume** = genuine breakdown — abort
- Absorption lasts more than 15 bars = value migrating lower
- Only 1 or 2 MTF TFs showing price below VAL = not full alignment
- 4H strongly bearish with momentum candles = trend opposing setup
- Kill zone less than 30 minutes old

---

## Comparison: Bearish vs Bullish Absorption Setup

| Element | Setup 2 Bearish (VAH Rejection) | Setup 2B Bullish (VAL Rejection) |
|---------|----------------------------------|----------------------------------|
| Sweep direction | Spike ABOVE VAH | Spike BELOW VAL |
| Absorption zone | Consolidates above VAH | Consolidates below VAL |
| Who is absorbing | Smart money absorbing longs into shorts | Smart money absorbing shorts into longs |
| Entry trigger | Close back BELOW VAH | Close back ABOVE VAL |
| Stop location | Above absorption zone high (spike high) | Below absorption zone low (spike low) |
| Target 1 | MTF POC | MTF POC |
| Target 2 | Session VP level below | Session VP level above |
| Invalidation | New high above absorption with volume | New low below absorption with volume |

---

## Pine Script Alert Logic (Future Indicator)
```
price crosses below VAL → start absorption timer
if price holds below VAL for 5+ bars
  AND volume tapers (current bar volume < average of prior 5 bars)
  AND candle bodies shrink (body size < 50% of prior avg body)
  → absorption confirmed, arm LONG alert
if price then closes BACK ABOVE VAL
  AND absorption was 5–15 bars
  → FIRE LONG ALERT
cancel if: price makes new low below absorption zone with expanding volume
```

---

## Tags
`bullish` `mean-reversion` `failed-auction` `absorption` `val-rejection` `mtf-triple-alignment` `gold` `mgc1` `1m-entry` `setup-2b`
