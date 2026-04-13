# NIFTY Flow Terminal

A modern full-stack trading dashboard built with Next.js, TypeScript, Tailwind CSS, and Recharts, designed around a highly interactive NIFTY 50 option-chain experience.

## What is included

- Real-time or near-real-time option-chain dashboard shell
- Sticky, scrollable option-chain table with ATM / ITM / OTM highlighting
- Analytics:
  - Max Pain
  - Put Call Ratio
  - Support / Resistance from OI clusters
  - OI build-up detection
  - Market trend pulse
- Live refresh every 15 seconds
- Manual refresh action
- Last-updated timestamp and provider status
- OI, volume, IV, and candlestick visualizations
- Stock search for Indian equities via Yahoo Finance search
- Multi-stock context panels:
  - top gainers
  - top losers
  - most active
  - sector performance
  - market breadth sentiment
- Extra product features implemented:
  - watchlist
  - local alert center
  - options strategy builder

## Stack

- Frontend: Next.js App Router + React + Tailwind CSS
- Backend: Next.js route handlers
- Charts: Recharts + custom SVG candlestick renderer
- State / data refresh: SWR
- Styling: Tailwind + custom glassmorphism trading theme

## Project structure

```text
app/
  api/
    market/summary/route.ts
    option-chain/route.ts
    search/route.ts
  globals.css
  layout.tsx
  page.tsx
components/
  dashboard/
  ui/
lib/
  market/
  server/
```

## Setup

1. Install Node.js 20 or newer.
2. Install dependencies:

```bash
npm install
```

3. Copy environment variables:

```bash
cp .env.example .env.local
```

4. Start the app:

```bash
npm run dev
```

5. Open `http://localhost:3000`.

## Data provider model

The app uses a provider abstraction so you can keep the UI and analytics stable while swapping feeds later.

### Default mode: `mock`

`MARKET_OPTION_CHAIN_PROVIDER=mock`

- Uses Yahoo Finance for:
  - symbol search
  - spot / chart data
  - tracked market summary
- Uses a synthetic option-chain model for NIFTY and unsupported equities
- Best for local development, demos, and UI iteration

### Optional mode: `nse-public`

`MARKET_OPTION_CHAIN_PROVIDER=nse-public`

- Attempts to read the public NSE web option-chain endpoint
- Still uses Yahoo Finance for price charting and search
- May break due to rate limits, cookies, bot protection, or schema changes
- Should not be treated as production-grade market-data infrastructure

## Why the fallback exists

Yahoo Finance is useful for quotes, charts, and search, but it does not reliably expose the full NIFTY 50 option chain in a way that this app can depend on. Because of that, the app ships with a provider switch and a safe mock mode so the platform remains usable and demoable without rewriting the frontend.

## API routes

### `GET /api/option-chain`

Query params:

- `symbol`
- `expiry`
- `strikeRange`

Returns:

- spot price
- change and percent change
- expiry list
- provider metadata
- calculated analytics
- option-chain rows
- chart series

### `GET /api/market/summary`

Returns:

- gainers
- losers
- most active
- sector performance
- breadth sentiment

### `GET /api/search?q=...`

Returns Yahoo Finance search results for equities and indices.

## Caching and refresh

- Option chain route cache: 10 seconds
- Market summary route cache: 30 seconds
- Search cache: 60 seconds
- Frontend auto-refresh:
  - option chain: 15 seconds
  - summary: 30 seconds

This reduces API pressure and makes it easier to swap in rate-limited providers later.

## Implemented analytics logic

- PCR: total put OI / total call OI
- Max Pain: minimum aggregate expiry payout across displayed strikes
- Support / Resistance: top put / call OI strike clusters
- Build-up:
  - price up + OI up -> Long Build-up
  - price down + OI up -> Short Build-up
  - price down + OI down -> Long Unwinding
  - price up + OI down -> Short Covering
- Trend pulse: derived from PCR, max pain, and support / resistance context

## Advanced features already added

- Watchlist system with local persistence
- Alert center for spot and PCR thresholds
- Strategy builder for:
  - Straddle
  - Strangle
  - Iron Condor

## Recommended next upgrades

- WebSocket or SSE streaming instead of polling
- Historical option-chain snapshot storage in Redis / Postgres / ClickHouse
- User authentication with saved alerts and watchlists
- Greeks and payoff engine with volatility surface support
- Paper trading with position journal and P&L attribution
- News sentiment and event calendar overlays
- Broker integrations for order placement and margin estimation
- Paid exchange-grade feeds for reliable option depth and latency

## Scaling notes

For a more professional deployment:

- move provider calls behind a dedicated market-data service
- introduce Redis for distributed cache and replayable snapshots
- stream updates over WebSockets to subscribed strike ranges only
- store time-series snapshots for backtesting and playback
- split analytics into async jobs for heavier calculations
- use a licensed exchange or broker API for production reliability

## Important note

This project is structured to be production-ready from a code organization standpoint, but any free market-data source used here can change behavior at any time. Before commercial or public deployment, replace the free option-chain adapter with a properly licensed feed.
