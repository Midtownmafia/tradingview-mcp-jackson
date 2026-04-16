# Setup 2: Bearish VAH Rejection with Absorption — Failed Auction
**Type:** Mean Reversion / Failed Auction  
**Difficulty:** Intermediate — patience required, NOT a reactive entry  
**Instrument:** COMEX_MINI:MGC1! (Micro Gold Futures) — 1 Minute Chart  
**Session:** London Kill Zone (2:00am–5:00am ET) preferred — any approved kill zone valid  
**First documented:** April 8, 2026 — MGC1! ~2:00am ET  

---

## What Makes This Different from Setup 1

Setup 1 is a clean liquidity grab + **immediate** reversal spike.  
Setup 2 has price **hold ABOVE VAH for multiple bars** (absorption phase) before rejecting.  
The entry is **NOT the spike candle** — it is the failed continuation **after** the absorption period ends.

This is a slower, more deliberate setup. The patience is the edge.

---

## Core Concept

Price spikes above VAH sweeping buy-side liquidity (stops above the high). Instead of immediately reversing, it consolidates above VAH — smart money is absorbing every buy order into their shorts. When buying dries up, price closes back below VAH and the move down begins. The absorption zone becomes the resistance ceiling for the rest of the move.

---

## Market Context Required

| Element | Requirement |
|---------|-------------|
| MTF 5m | Price at or above VAH |
| MTF 15m | Price at or above VAH |
| MTF 1H | Price at or above VAH |
| 4H/1H Bias | Bearish or neutral |
| Session age | More than 30 minutes old |
| Profile shape | Balanced or bearish trending (POC near top) |

---

## Setup Anatomy

### Phase 1 — Liquidity Sweep Above VAH
- Price spikes above MTF VAH — sweeps stop orders sitting above the high
- This is NOT your entry — it is the alert to start watching
- The spike can be fast (1–3 bars) and look convincing as a breakout
- Key tell: price closes the spike candle as a long upper wick or doji — body does not hold above VAH

### Phase 2 — Absorption Zone (5–10 bars)
**This is the defining feature of Setup 2. Must observe before entry.**
- Price consolidates ABOVE VAH for 5–10 bars
- During this period:
  - Candle **bodies shrink** — neither side has conviction
  - **Wicks grow** — probes higher and lower, finding no continuation
  - **Volume tapers** — buying pressure exhausting
  - Each push higher makes a lower high or equal high — no expansion
- Smart money is absorbing every long order into their short positions
- The longer the absorption without a new high with volume = more bearish

### Phase 3 — Failed Continuation / Entry Trigger
- Price attempts one more push above the absorption zone high — fails, closes back below
- **OR** price simply rolls over and closes back below MTF VAH without a final push
- **ENTRY: 1m close back BELOW MTF VAH after the absorption zone**
- Aggressive: sell the close of the bar that breaks below VAH
- Conservative: wait for a retest of VAH from below, sell the rejection

### Phase 4 — Move to Target
- Once VAH breaks with a body close below, move accelerates through LVN below
- Target 1 = MTF POC (first area of value below — expect a brief pause here)
- Target 2 = Previous session VAH or nearest session VP level below
- Target 3 = MTF VAL if momentum continues

---

## Entry, Stop, Target

| Parameter | Level | Notes |
|-----------|-------|-------|
| **Entry (aggressive)** | Close of bar that breaks back below VAH | Sell the break |
| **Entry (conservative)** | Retest of VAH from below after break | Better R:R, may miss move |
| **Stop** | Above the highest wick of the absorption zone | Above the spike high |
| **Target 1** | MTF POC | Partial / move stop to BE |
| **Target 2** | Nearest session VP level below (prev session VAH) | Full target |
| **Target 3** | MTF VAL | Runner if strong momentum |

**R:R note:** Stop is wide (above spike high) but target is far (POC then VAL). Typically 2:1 minimum to T1, 3–4:1 to T2.

---

## Alert Criteria (When to Get Ready)

Alert fires when ALL of the following are true:
1. Price closes ABOVE VAH on 5m timeframe
2. Price closes ABOVE VAH on 15m timeframe
3. Price closes ABOVE VAH on 1H timeframe
4. Session is more than 30 minutes old
5. 4H/1H bias is bearish or neutral

**WATCH state activated — monitor for absorption phase to develop.**

---

## Entry Criteria (When to Pull the Trigger)

Enter SHORT when ALL of the following are true after alert fires:
1. Price has been above VAH for **at least 5 bars** (absorption confirmed)
2. Candle bodies have shrunk during the absorption zone
3. Volume has tapered — no expanding volume on pushes higher
4. Price closes back BELOW VAH with a body (not just a wick)
5. No major key level sitting within 20 ticks below as immediate support
6. Absorption lasted **no more than 15 bars** (if longer, value is migrating higher — abort)

---

## Take Profit Criteria

**Partial / Target 1 (MTF POC):**
- Close half at MTF POC
- Move stop to breakeven on remainder

**Full / Target 2 (nearest session VP level below):**
- Previous session VAH, overnight VP level, or weekly VP level below
- Close remaining position when price reaches this level OR
- Exit if 5m candle closes back above VAH (momentum exhausted)

**Trail stop rule:**
- Once T1 hit, trail stop to swing high of most recent bounce
- Exit if price closes back above 5m VAH with conviction

---

## Stop Management

- Initial stop: above highest wick of absorption zone (the spike high)
- If price immediately accelerates down through LVN: trail stop to swing high of each bounce
- Hard exit: price closes back ABOVE VAH with expanding volume = genuine breakout, thesis wrong

---

## Key Observations / Lessons

1. **The spike above VAH is NOT the entry** — it is the signal to watch. Many traders short the spike and get stopped. Wait for absorption.

2. **Absorption duration matters**: 5–10 bars is ideal. Less than 5 bars = not enough time for smart money to distribute. More than 15 bars = value is migrating higher, not rejecting.

3. **Volume taper during absorption is confirmation**: if volume is expanding during the consolidation above VAH, buyers are still in control — do not short yet.

4. **The LVN below VAH** is what gives this setup its R:R. Price moves fast through thin volume areas. Your stop is above the spike, your target is far below through a thin zone.

5. **Patience is the edge here**: most traders will try to short the spike or chase the breakdown. Your edge is identifying the absorption, waiting for it to complete, and entering only when confirmed.

---

## What Would Have Invalidated This Setup

- Absorption zone price makes a new high with **expanding volume** = genuine breakout, not rejection — abort
- Absorption lasts more than 15 bars = value migrating higher, not rejecting
- Only 1 or 2 MTF TFs showing price above VAH = not full alignment
- 4H strongly bullish with momentum candles = trend opposing the setup
- Kill zone less than 30 minutes old

---

## Example Trade — April 8, 2026, London Kill Zone ~2:00am ET

- Spike high: ~4,868 (liquidity grab above VAH)
- Absorption: 7 bars held above VAH, bodies shrinking, volume tapering
- Entry: close back below VAH (~4,863)
- Stop: above spike high (~4,869) = ~6 tick risk
- Target 1: MTF POC
- Target 2: Previous session VAH
- Screenshot reference: `screenshots/tv_undefined_2026-04-16T05-02-04-926Z.png` (in repo root)

---

## Comparison: Setup 1 vs Setup 2

| Element | Setup 1 (Exhaustion Reversal) | Setup 2 (Absorption Rejection) |
|---------|-------------------------------|--------------------------------|
| Entry timing | On the spike candle reversal | After absorption zone completes |
| Bars above VAH | 1–3 (immediate reversal) | 5–10 (deliberate absorption) |
| Entry candle | Spike reversal bar | Close back below VAH |
| Stop location | Above spike wick | Above absorption zone high |
| Risk | Tighter (spike wick is close) | Wider (spike + absorption zone) |
| R:R | Moderate | Higher (wider target vs stop) |
| Difficulty | Reactive — must act fast | Patient — observe and wait |

---

## Pine Script Alert Logic (Future Indicator)
```
price crosses above VAH → start absorption timer
if price holds above VAH for 5+ bars
  AND volume tapers (current bar volume < average of prior 5 bars)
  AND candle bodies shrink (body size < 50% of prior avg body)
  → absorption confirmed, arm SHORT alert
if price then closes BACK BELOW VAH
  AND absorption was 5–15 bars (not over-extended)
  → FIRE SHORT ALERT
cancel if: price makes new high above absorption zone with expanding volume
```

---

## Tags
`bearish` `mean-reversion` `failed-auction` `absorption` `vah-rejection` `london-kz` `mtf-triple-alignment` `gold` `mgc1` `1m-entry` `setup-2`
