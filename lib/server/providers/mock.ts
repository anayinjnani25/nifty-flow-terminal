import { buildUpFromMetrics, calculateOptionAnalytics } from "@/lib/market/analytics";
import type { OptionChainPayload, OptionStrikeRow } from "@/lib/market/types";
import { clamp } from "@/lib/utils";

type MockOptionChainParams = {
  symbol: string;
  displayName: string;
  expiry: string;
  expiryDates: string[];
  spot: number;
  priceChange: number;
  priceChangePercent: number;
  candles: OptionChainPayload["charts"]["candles"];
  strikeRange: number;
};

export function createMockOptionChain({
  symbol,
  displayName,
  expiry,
  expiryDates,
  spot,
  priceChange,
  priceChangePercent,
  candles,
  strikeRange
}: MockOptionChainParams): OptionChainPayload {
  const strikeStep = symbol === "^NSEI" ? 50 : Math.max(Math.round(spot * 0.01), 10);
  const atmStrike = Math.round(spot / strikeStep) * strikeStep;
  const rows: OptionStrikeRow[] = [];

  for (let index = -strikeRange; index <= strikeRange; index += 1) {
    const strike = atmStrike + index * strikeStep;
    const skew = index / Math.max(strikeRange, 1);
    const signal = Math.sin((strike + spot) / 91);
    const drift = Math.cos((strike - spot) / 67);
    const callIntrinsic = Math.max(spot - strike, 0);
    const putIntrinsic = Math.max(strike - spot, 0);
    const callExtrinsic = Math.max(18, 210 - Math.abs(index) * 11 + signal * 6);
    const putExtrinsic = Math.max(18, 200 - Math.abs(index) * 10 + drift * 6);
    const callChange = Number(((-priceChange * 0.18) - skew * 8).toFixed(2));
    const putChange = Number(((priceChange * 0.18) + skew * 8).toFixed(2));
    const callOiChange = Math.round(
      10000 * (1.2 - Math.abs(skew)) * (priceChange <= 0 ? 1.08 : 0.82)
    );
    const putOiChange = Math.round(
      10000 * (1.2 - Math.abs(skew)) * (priceChange >= 0 ? 1.08 : 0.82)
    );

    rows.push({
      strike,
      distanceFromSpot: strike - spot,
      isAtm: strike === atmStrike,
      callMoneyness: strike < atmStrike ? "ITM" : strike === atmStrike ? "ATM" : "OTM",
      putMoneyness: strike > atmStrike ? "ITM" : strike === atmStrike ? "ATM" : "OTM",
      call: {
        ltp: Number((callIntrinsic + callExtrinsic).toFixed(2)),
        change: callChange,
        oi: Math.round(55000 + Math.max(0, 11 - Math.abs(index)) * 21000 + (signal + 1) * 7000),
        oiChange: callOiChange,
        volume: Math.round(9000 + Math.max(0, 12 - Math.abs(index)) * 4500 + (drift + 1) * 3000),
        iv: Number(clamp(16 + Math.abs(skew) * 6.5 + (signal + 1) * 0.9, 9, 45).toFixed(2)),
        buildUp: buildUpFromMetrics(callChange, callOiChange)
      },
      put: {
        ltp: Number((putIntrinsic + putExtrinsic).toFixed(2)),
        change: putChange,
        oi: Math.round(53000 + Math.max(0, 11 - Math.abs(index)) * 21500 + (drift + 1) * 8000),
        oiChange: putOiChange,
        volume: Math.round(9200 + Math.max(0, 12 - Math.abs(index)) * 4700 + (signal + 1) * 3100),
        iv: Number(clamp(16 + Math.abs(skew) * 6.2 + (drift + 1) * 0.9, 9, 45).toFixed(2)),
        buildUp: buildUpFromMetrics(putChange, putOiChange)
      }
    });
  }

  const analytics = calculateOptionAnalytics(rows, spot);

  return {
    symbol,
    displayName,
    underlyingPrice: spot,
    priceChange,
    priceChangePercent,
    selectedExpiry: expiry,
    expiryDates,
    providerStatus: "mock",
    sourceLabel: "Demo option-chain model backed by live Yahoo index price",
    lastUpdated: new Date().toISOString(),
    refreshIntervalMs: 15000,
    notes: [
      "Yahoo Finance does not reliably expose NIFTY 50 option-chain rows; this dashboard falls back to a synthetic chain model unless you enable a custom provider.",
      "Charts and spot price can still run off live or delayed Yahoo Finance market data."
    ],
    analytics,
    chain: rows,
    charts: {
      oiByStrike: rows.map((row) => ({
        strike: row.strike,
        callOi: row.call?.oi ?? 0,
        putOi: row.put?.oi ?? 0,
        callVolume: row.call?.volume ?? 0,
        putVolume: row.put?.volume ?? 0
      })),
      ivSmile: rows.map((row) => ({
        strike: row.strike,
        callIv: row.call?.iv ?? null,
        putIv: row.put?.iv ?? null
      })),
      candles
    }
  };
}
