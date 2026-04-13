import { buildUpFromMetrics, calculateOptionAnalytics } from "@/lib/market/analytics";
import type { Moneyness, OptionChainPayload, OptionStrikeRow } from "@/lib/market/types";

type NseOptionResponse = {
  filtered?: {
    data?: Array<{
      strikePrice: number;
      expiryDate: string;
      CE?: {
        lastPrice?: number;
        change?: number;
        openInterest?: number;
        changeinOpenInterest?: number;
        totalTradedVolume?: number;
        impliedVolatility?: number;
      };
      PE?: {
        lastPrice?: number;
        change?: number;
        openInterest?: number;
        changeinOpenInterest?: number;
        totalTradedVolume?: number;
        impliedVolatility?: number;
      };
    }>;
    expiryDates?: string[];
  };
  records?: {
    expiryDates?: string[];
  };
};

const NSE_HEADERS = {
  Accept: "application/json, text/plain, */*",
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123 Safari/537.36"
};

function getNseSymbol(symbol: string) {
  if (symbol === "^NSEI" || symbol.toUpperCase() === "NIFTY") {
    return { endpoint: "option-chain-indices", value: "NIFTY", displayName: "NIFTY 50" };
  }

  return {
    endpoint: "option-chain-equities",
    value: symbol.replace(".NS", "").toUpperCase(),
    displayName: symbol.replace(".NS", "")
  };
}

export async function fetchNsePublicOptionChain(params: {
  symbol: string;
  selectedExpiry?: string | null;
  candles: OptionChainPayload["charts"]["candles"];
  spot: number;
  priceChange: number;
  priceChangePercent: number;
  strikeRange: number;
}): Promise<OptionChainPayload> {
  const meta = getNseSymbol(params.symbol);

  await fetch("https://www.nseindia.com/option-chain", {
    headers: NSE_HEADERS,
    next: { revalidate: 0 }
  });

  const data = await fetch(
    `https://www.nseindia.com/api/${meta.endpoint}?symbol=${encodeURIComponent(meta.value)}`,
    {
      headers: NSE_HEADERS,
      next: { revalidate: 0 }
    }
  ).then(async (response) => {
    if (!response.ok) {
      throw new Error(`NSE request failed with ${response.status}`);
    }
    return (await response.json()) as NseOptionResponse;
  });

  const expiryDates = data.records?.expiryDates ?? data.filtered?.expiryDates ?? [];
  const selectedExpiry = params.selectedExpiry ?? expiryDates[0];
  const filteredRows =
    data.filtered?.data?.filter((row) => !selectedExpiry || row.expiryDate === selectedExpiry) ?? [];

  const sortedRows = filteredRows
    .sort((a, b) => a.strikePrice - b.strikePrice)
    .slice(Math.max(0, Math.floor(filteredRows.length / 2) - params.strikeRange))
    .slice(0, params.strikeRange * 2 + 1);

  const chain: OptionStrikeRow[] = sortedRows.map((row) => ({
    strike: row.strikePrice,
    distanceFromSpot: row.strikePrice - params.spot,
    isAtm: false,
    callMoneyness:
      row.strikePrice < params.spot ? "ITM" : row.strikePrice > params.spot ? "OTM" : "ATM",
    putMoneyness:
      row.strikePrice > params.spot ? "ITM" : row.strikePrice < params.spot ? "OTM" : "ATM",
    call: row.CE
      ? {
          ltp: row.CE.lastPrice ?? 0,
          change: row.CE.change ?? 0,
          oi: row.CE.openInterest ?? 0,
          oiChange: row.CE.changeinOpenInterest ?? 0,
          volume: row.CE.totalTradedVolume ?? 0,
          iv:
            row.CE.impliedVolatility != null && Number.isFinite(row.CE.impliedVolatility)
              ? row.CE.impliedVolatility
              : null,
          buildUp: buildUpFromMetrics(row.CE.change ?? 0, row.CE.changeinOpenInterest ?? 0)
        }
      : null,
    put: row.PE
      ? {
          ltp: row.PE.lastPrice ?? 0,
          change: row.PE.change ?? 0,
          oi: row.PE.openInterest ?? 0,
          oiChange: row.PE.changeinOpenInterest ?? 0,
          volume: row.PE.totalTradedVolume ?? 0,
          iv:
            row.PE.impliedVolatility != null && Number.isFinite(row.PE.impliedVolatility)
              ? row.PE.impliedVolatility
              : null,
          buildUp: buildUpFromMetrics(row.PE.change ?? 0, row.PE.changeinOpenInterest ?? 0)
        }
      : null
  }));

  if (!chain.length) {
    throw new Error("NSE provider returned no strikes for the selected expiry");
  }

  const atmRow = chain.reduce(
    (closest, row) =>
      Math.abs(row.strike - params.spot) < Math.abs(closest.strike - params.spot) ? row : closest,
    chain[0]
  );

  const normalizedChain = chain.map((row) => ({
    ...row,
    isAtm: row.strike === atmRow?.strike,
    callMoneyness: (
      row.strike < atmRow.strike ? "ITM" : row.strike > atmRow.strike ? "OTM" : "ATM"
    ) as Moneyness,
    putMoneyness: (
      row.strike > atmRow.strike ? "ITM" : row.strike < atmRow.strike ? "OTM" : "ATM"
    ) as Moneyness
  }));

  const analytics = calculateOptionAnalytics(normalizedChain, params.spot);

  return {
    symbol: params.symbol,
    displayName: meta.displayName,
    underlyingPrice: params.spot,
    priceChange: params.priceChange,
    priceChangePercent: params.priceChangePercent,
    selectedExpiry: selectedExpiry ?? "N/A",
    expiryDates,
    providerStatus: "delayed",
    sourceLabel: "NSE public option-chain endpoint",
    lastUpdated: new Date().toISOString(),
    refreshIntervalMs: 15000,
    notes: [
      "This provider relies on a public NSE web endpoint and may rate-limit or change structure without notice.",
      "For production usage, switch this adapter to a licensed exchange or broker feed."
    ],
    analytics,
    chain: normalizedChain,
    charts: {
      oiByStrike: normalizedChain.map((row) => ({
        strike: row.strike,
        callOi: row.call?.oi ?? 0,
        putOi: row.put?.oi ?? 0,
        callVolume: row.call?.volume ?? 0,
        putVolume: row.put?.volume ?? 0
      })),
      ivSmile: normalizedChain.map((row) => ({
        strike: row.strike,
        callIv: row.call?.iv ?? null,
        putIv: row.put?.iv ?? null
      })),
      candles: params.candles
    }
  };
}
