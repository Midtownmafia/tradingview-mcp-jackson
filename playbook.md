# Volume Profile Trading Playbook v1.0

# Instrument: MGC1\! (Micro Gold Futures) \+ Crypto (BTC/ETH/SOL)

# Last Updated: April 13, 2026

## MASTER GOAL

All setups in this playbook will be coded into a single Pine Script alert indicator.
Each setup's conditions must be written precisely enough to be translated 1:1 into Pine Script logic.
The indicator will fire alerts when setup conditions are met, with output matching the format in Section 7.2.

---

## SECTION 1 — Core Theory: Volume Profile \+ Auction Market Theory

### 1.1 Price vs Value

- **Price** is the numerical transaction point — where the market IS right now  
- **Value** is where the most business was conducted — the fair price both sides agreed on  
- **The edge** comes from the gap between price and value:  
  - Price below VAL \= discount zone \= potential long opportunity  
  - Price above VAH \= premium zone \= potential short opportunity  
  - Price at POC \= fair value \= equilibrium, lowest edge for new entries

### 1.2 Market States

Three states determine your trading approach:

**Balance**

- Bell curve volume distribution, price oscillating between VAH and VAL  
- POC clearly defined in the center  
- Trading approach: mean reversion — buy VAL, sell VAH, target POC

**Imbalance**

- Price moves away from VA with conviction and high volume  
- Low volume nodes (LVNs) form as price moves too fast to build value  
- Trading approach: trend following — join the move, target next HVN

**Discovery**

- Market actively searching for new equilibrium  
- Volume profile migrating to new levels, new HVNs forming at new prices  
- Trading approach: wait for acceptance at new level, then treat as new fair value

### 1.3 Market Reactions

- **Acceptance** — price consolidates at new level, volume builds, new HVN forming \= trend continuation  
- **Rejection** — price visits level briefly then rapidly moves away, low volume at extreme \= reversal  
- **Excess** — failed push at extreme, price found unfair, marks a turning point back to fair value

### 1.4 Core Components

**Point of Control (POC)**

- Highest traded volume level in the profile  
- Acts as magnet/fair value — strongest gravitational pull  
- When POC is near VAH: short bias from VAH/POC confluence targeting VAL  
- When POC is near VAL: long bias from VAL/POC confluence targeting VAH  
- When POC is in middle: use 4H/1H bias to determine breakout vs rotation  
- POC \= TP1 on mean reversion trades (first lowest hanging fruit)

**Value Area (VA)**

- 70% of total session volume \= zone of agreement  
- Inside VA \= rotational/rangebound bias  
- Outside VA \= trending or failed auction scenario

**Value Area High (VAH)**

- Upper boundary \= premium/resistance pricing  
- As reversal level: price spikes above, fails to hold, closes back inside VA \= short to POC  
- As breakout level: price closes above, retests VAH as support, holds \= long continuation  
- Confirmation of reversal: candle bodies shrinking, wicks getting longer at VAH, exhaustion across timeframes  
- Confirmation of breakout: strong close outside, new volume building above, POC migrating higher

**Value Area Low (VAL)**

- Lower boundary \= discount/support pricing  
- As reversal level: price dips below, fails to hold, closes back inside VA \= long to POC  
- As breakout level: price closes below, retests VAL as resistance, holds \= short continuation  
- Confirmation of reversal: liquidity grab below VAL \+ bullish momentum on 5m and 15m  
- Confirmation of breakdown: high volume close below, new value building below old VAL

### 1.5 Volume Nodes

**High Volume Node (HVN)**

- Appears as a bulge/peak on the horizontal histogram  
- Price SLOWS or STALLS here — brick wall behavior  
- Rejection signature: V-shaped recovery, pin bar or engulfing candle at node  
- Absorption signature: price grinds against level repeatedly without breaking  
- HVN \= target/exit zone, not entry zone

**Low Volume Node (LVN)**

- Appears as a valley/thin area on the histogram  
- Price SPRINTS through these — air pocket / fast lane behavior  
- Entry timing: use VA breakout as trigger into LVN  
- Target: far edge of LVN where volume begins to build again into next HVN  
- Invalidation: if price enters LVN and slows down / starts building volume \= exit immediately

### 1.6 Absorption vs Exhaustion (Price Action Only — No Footprint)

**Exhaustion visual signatures:**

- Candle bodies getting progressively smaller  
- Wicks getting longer relative to bodies  
- FVGs getting smaller on 5m  
- Volume tapering at extremes  
- Multiple timeframes showing same exhaustion simultaneously

**Absorption visual signatures:**

- Price reaching key level and failing to move through despite repeated attempts  
- Long wicks at level but close stays on same side  
- Price grinding against level without breaking

---

## SECTION 2 — Key Levels and Session Definitions

### 2.1 Level Hierarchy (strongest to weakest context)

1. Weekly VP levels (largest context)  
2. Previous Day VP levels  
3. Overnight VP levels  
4. Developing FRVP levels (current session)  
5. MTF VP alignment (5m/15m/1H)

### 2.2 Session Definitions (all times ET)

| Profile | Range | Levels |
| :---- | :---- | :---- |
| Weekly VP | Sunday 6:00pm → Friday 6:00pm | Weekly VH, Weekly PoC, Weekly VL |
| Previous Day VP | 9:30am → 6:00pm (prior day) | PD VH, PD PoC, PD VL |
| Overnight VP | 6:00pm → 9:30am | Overnight VH, Overnight PoC, Overnight VAL |
| Developing FRVP | 6:00pm → now (before 9:30am) OR 9:30am → now (after 9:30am) | Dev PoC, Dev VAH, Dev VAL |

### 2.3 Developing FRVP Rules

- Levels NOT trusted in first 30 minutes of session  
- Uses extend right — continuously updates as new bars come in  
- Lives on the 1m chart  
- VAH \= solid green line  
- POC \= solid yellow line  
- VAL \= solid green line  
- Built externally via Node.js (Component 1\) — gives full histogram data programmatically

### 2.4 How Key Levels Are Used

- All levels \= potential reaction zones based on trend direction  
- Confluence of multiple levels at same price \= highest probability reaction zone  
- Manually placed horizontal rays on chart — NEVER touch programmatically  
- When developing FRVP level coincides with Weekly/Overnight/PDaily level \= highest conviction setup

### 2.5 MTF Volume Profile (Rolling Profiles)

**Gold timeframes:** 5m / 15m / 1H **Crypto timeframes:** 23m / 60m / 6H

Each timeframe shows its own VAH, POC, VAL as a histogram on the chart.

**MTF Alignment Rules:**

- All three TFs at same level (e.g., all at VAL) \= highest conviction  
- Two of three aligned \= valid but lower conviction  
- Higher TF outweighs lower TF for bias  
- 1H alignment is most important, 5m is entry timing

---

## SECTION 3 — Structural Bias Framework

### 3.1 Timeframe Roles

| Timeframe | Role |
| :---- | :---- |
| 4H | Primary trend bias ONLY — never entry |
| 1H | Secondary trend bias ONLY — never entry |
| 15m | Entry confirmation |
| 5m | Entry confirmation |
| 1m | Execution — actual entry |

### 3.2 4H Bias Rule

Look at the **last 2 completed 4H candles**:

- Note color (bullish/bearish) and candle type  
- **Clearest signal: previous 4H candle has a long wick (upper or lower) \+ current 4H candle continuing in direction of that rejection**  
  - Long upper wick on previous 4H \+ current 4H bearish \= strong bearish bias  
  - Long lower wick on previous 4H \+ current 4H bullish \= strong bullish bias  
- Strong 4H signal OVERRIDES the fade-to-POC instinct — expect breakout through VA extreme instead

### 3.3 1H Bias Rule

- Used to confirm 4H bias  
- Check color and direction of current 1H candle  
- Full body 1H candle \= strong conviction in that direction  
- 1H showing indecision (long wicks both sides) \= wait for clarity

### 3.4 Entry Timing Preference

- Prefer entries at the **open of a new 4H or 1H bar**  
- Cleaner read on direction from that point forward  
- Avoid entries in the middle of a 4H or 1H candle unless setup is extremely clear

---

## SECTION 4 — Setup Library

---

### SETUP 1 — MTF VP Alignment \+ Exhaustion Reversal at VAL/VAH

**Type:** Mean Reversion **Timeframe:** 1m execution, 5m/15m/1H confirmation **Market State:** Balance or end of imbalance move

**Conditions for LONG setup (at VAL):**

1. 4H and 1H bias is bullish OR neutral (not strongly bearish)  
2. Developing FRVP VAL has been reached  
3. Price makes a liquidity grab BELOW the VAL (sweeps stops)  
4. 5m AND 15m showing bullish momentum reversal  
5. Exhaustion signals present across combination of timeframes:  
   - 1m candle bodies getting smaller and consolidating  
   - 5m FVGs getting smaller  
   - 15m bearish move running out of steam  
6. MTF VP (5m/15m/1H) showing alignment at VAL levels  
7. NOT in first 30 minutes of session

**Entry:** 1m candle showing reversal at VAL after liquidity grab — market buy or limit at VAL **Stop Loss:** Below the lowest wick of the liquidity grab below VAL **TP1:** Developing FRVP POC **TP2:** Developing FRVP VAH

**Conditions for SHORT setup (at VAH):**

1. 4H and 1H bias is bearish OR neutral (not strongly bullish)  
2. Developing FRVP VAH has been reached  
3. Price makes a liquidity grab ABOVE the VAH (sweeps stops)  
4. 5m AND 15m showing bearish momentum reversal  
5. Exhaustion signals present across combination of timeframes:  
   - 1m candle bodies getting smaller and consolidating  
   - 5m FVGs getting smaller  
   - 15m bullish move running out of steam  
6. MTF VP (5m/15m/1H) showing alignment at VAH levels  
7. NOT in first 30 minutes of session

**Entry:** 1m candle showing reversal at VAH after liquidity grab — market sell or limit at VAH **Stop Loss:** Above the highest wick of the liquidity grab above VAH **TP1:** Developing FRVP POC **TP2:** Developing FRVP VAL

**Invalidation:**

- Price closes back above VAH (for shorts) or below VAL (for longs) with conviction  
- No exhaustion signals present — move still has momentum  
- First 30 minutes of session  
- Only one timeframe showing exhaustion — need combination

**Confluence boosters (higher conviction):**

- Developing FRVP VAL/VAH coincides with Weekly/Overnight/PDaily level  
- MTF VP all three timeframes aligned at same level  
- Entry at open of new 1H or 4H bar  
- Momentum of prior move was fast (18-22 1m candles to cover the range \= high conviction reversal)

---

### SETUP 2 — London KZ VAH Rejection with Absorption (Bearish)

**Type:** Mean Reversion / Failed Auction  
**Difficulty:** Intermediate — requires patience, not a reactive entry  
**Timeframe:** 1m execution, 5m/15m/1H confirmation  
**Market State:** Price in premium / imbalance above VA  
**Session:** London Kill Zone (2:00am–5:00am ET)  
**First documented:** April 8, 2026 — MGC1! ~2:00am ET  

**What makes this different from Setup 1:**
Setup 1 is a clean liquidity grab + immediate reversal. Setup 2 has price hold ABOVE VAH for multiple bars (absorption) before rejecting. The entry is not the spike candle — it is the failed continuation after the absorption period.

**Conditions for SHORT setup (VAH rejection with absorption):**

1. Price spikes above MTF VAH — liquidity grab sweeps stops above the high  
2. Price consolidates ABOVE VAH for 5–10 bars (absorption zone) — this is the key differentiator  
3. During absorption: candle bodies shrink, wicks grow, volume tapers — exhaustion building  
4. All 3 MTF VP TFs showing price at or above VAH (full bearish alignment)  
5. 4H/1H bias is bearish or neutral  
6. Session is more than 30 minutes old  
7. Failed continuation signal: price attempts to push higher, fails, closes back below VAH  

**Entry:** 1m close back below MTF VAH after failed continuation — sell the close or limit at VAH retest  
**Stop Loss:** Above the highest wick of the absorption zone (above the spike high)  
**TP1:** MTF POC (5m POC nearest to price)  
**TP2:** Previous session VAH (the level price was targeting on the way down)  
**TP3:** MTF VAL if momentum continues  

**Pine Script alert logic (future indicator):**
- Price crosses above VAH → start absorption timer  
- If price holds above VAH for 5+ bars AND volume tapers AND candle bodies shrink → absorption confirmed  
- If price then closes back below VAH → fire SHORT alert  
- Cancel if price makes a new high with expanding volume (breakout, not rejection)  

**Invalidation:**
- Price breaks above absorption zone high with expanding volume = genuine breakout, exit immediately  
- Absorption lasts more than 15 bars = value migrating higher, not a rejection  
- Only one MTF TF showing price above VAH = not full alignment  

**Confluence boosters (higher conviction):**
- Absorption zone forms at confluence of VAH + weekly or overnight level  
- All 3 MTF TFs aligned at VAH simultaneously  
- Spike high matches a previous significant high (double top structure)  
- 4H candle showing long upper wick building during absorption  

**Example trade — April 8, 2026, London KZ:**
- Spike high: ~4,868 (liquidity grab above VAH)  
- Absorption: 7 bars held above VAH  
- Entry: close back below VAH (~4,863)  
- Stop: above spike high (~4,869)  
- Target: Previous session VAH  
- Screenshot: `screenshots/tv_undefined_2026-04-16T05-02-04-926Z.png`

### SETUP 3 — \[To be added\]

*(Next setup to be documented from replay session)*

---

## SECTION 5 — Risk Rules

### 5.1 Stop Loss Placement

- **Long trades:** Stop below the lowest wick of the dip below VAL  
- **Short trades:** Stop above the highest wick of the push above VAH  
- Logic: if price returns to the liquidity grab extreme with conviction, trade thesis is wrong

### 5.2 Profit Targets

- **TP1:** Developing FRVP POC (take partials or move stop to break even)  
- **TP2:** Opposite VA extreme (VAH for longs, VAL for shorts)  
- **Extended target:** Next significant key level (Weekly/Overnight/PDaily)

### 5.3 Trade Frequency Rules

- **Core principle: less trades \= more profit**  
- Only take HIGH confluence setups — multiple conditions must align  
- No setup \= no trade, wait for next opportunity  
- Max daily loss rule: **TO BE DEFINED** (placeholder — set this after first week of replay practice)  
- Max trades per session: **TO BE DEFINED** (placeholder — track and review after replay practice)

### 5.4 What Makes You Wait

- Only one timeframe showing exhaustion (need combination)  
- First 30 minutes of session  
- No clear 4H/1H bias  
- MTF VP not aligned  
- Price in middle of VA with no clear level confluence

---

## SECTION 6 — Crypto Adaptation (BTC/ETH/SOL)

### 6.1 Key Differences

- 24/7 market — no session boundaries  
- MTF alignment timeframes: **23m / 60m / 6H** (not 5m/15m/1H)  
- Weekly VP still applies but runs continuously (no Sunday 6pm open/Friday close)  
- No Overnight or Previous Day session definitions

### 6.2 Same Rules That Apply

- All VP core concepts identical (POC/VAH/VAL/HVN/LVN)  
- Same exhaustion signals  
- Same entry/stop/target logic  
- Same MTF alignment requirement  
- Same bias framework using 4H/1H candles

### 6.3 What Replaces Session Levels for Crypto

- **To be defined** — document after trading crypto setups in replay

---

## SECTION 7 — MCP Alert Logic

### 7.1 When MCP Should Alert

Fire an alert when ALL of the following are true:

1. Price is at Developing FRVP VAH or VAL  
2. MTF VP showing alignment (minimum 2 of 3 timeframes)  
3. Session is more than 30 minutes old  
4. Exhaustion signals present on at least 2 timeframes  
5. 4H/1H bias not strongly opposing the setup direction

### 7.2 Alert Output Format

\[DIRECTION\] Setup Alert — \[INSTRUMENT\]

Price: \[current price\]

Level: \[which level — Dev VAH/VAL/POC\]

MTF Alignment: \[5m above/below VAH/VAL\] \[15m above/below\] \[1H above/below\]

Key Level Confluence: \[nearest Weekly/Overnight/PDaily level and distance\]

Exhaustion: \[which timeframes showing exhaustion\]

4H Bias: \[bullish/bearish/neutral\]

Stop: \[price level\]

TP1: \[POC price\]

TP2: \[opposite VA extreme price\]

Session Time: \[minutes into session\]

### 7.3 MCP Should NOT Alert When

- First 30 minutes of session  
- Price is in middle of VA with no level confluence  
- Only one timeframe showing exhaustion  
- 4H strongly opposing setup direction  
- MTF VP all pointing opposite direction to setup

---

## QUICK REFERENCE CHECKLIST

### Bullish Setup Checklist

- [ ] 4H/1H bias bullish or neutral  
- [ ] Price at Developing FRVP VAL  
- [ ] Liquidity grab below VAL confirmed  
- [ ] 5m AND 15m showing bullish reversal momentum  
- [ ] Exhaustion on combination of timeframes  
- [ ] MTF VP aligned at VAL (min 2 of 3\)  
- [ ] Session more than 30 minutes old  
- [ ] Stop placed below lowest wick  
- [ ] TP1 \= POC, TP2 \= VAH

### Bearish Setup Checklist

- [ ] 4H/1H bias bearish or neutral  
- [ ] Price at Developing FRVP VAH  
- [ ] Liquidity grab above VAH confirmed  
- [ ] 5m AND 15m showing bearish reversal momentum  
- [ ] Exhaustion on combination of timeframes  
- [ ] MTF VP aligned at VAH (min 2 of 3\)  
- [ ] Session more than 30 minutes old  
- [ ] Stop placed above highest wick  
- [ ] TP1 \= POC, TP2 \= VAL

---

*Version 1.0 — Setup 1 only. Additional setups to be added from replay sessions.* *This document lives at: C:/Users/mkidt/tradingview-mcp-jackson/playbook.md*  
