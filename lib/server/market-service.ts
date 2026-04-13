import { DEFAULT_SYMBOL } from "@/lib/market/universe";
import type { MarketSummaryPayload, OptionChainPayload, SymbolSearchResult } from "@/lib/market/types";
import { createMockOptionChain } from "@/lib/server/providers/mock";
import { fetchNsePublicOptionChain } from "@/lib/server/providers/nse-public";
import {
  fetchYahooChart,
  fetchYahooMarketSummary,
  searchYahooSymbols
} from "@/lib/server/providers/yahoo";

function getDisplayName(symbol: string) {
  if (symbol === "^NSEI") {
    return "NIFTY 50";
  }

  return symbol.replace(".NS", "");
}

function buildExpiryDates() {
  const today = new Date();
  return Array.from({ length: 5 }, (_, index) => {
    const next = new Date(today);
    next.setDate(today.getDate() + index * 7 + ((4 - today.getDay() + 7) % 7));
    return next.toISOString().split("T")[0];
  });
}

export async function getOptionChainData(params: {
  symbol?: string | null;
  expiry?: string | null;
  strikeRange?: number;
}): Promise<OptionChainPayload> {
  const symbol = params.symbol?.trim() || DEFAULT_SYMBOL;
  const strikeRange = Math.min(Math.max(params.strikeRange ?? 10, 6), 18);
  const chartSymbol = symbol === "NIFTY" ? "^NSEI" : symbol;
  const chart = await fetchYahooChart(chartSymbol);
  const expiryDates = buildExpiryDates();
  const provider = process.env.MARKET_OPTION_CHAIN_PROVIDER ?? "mock";

  if (provider === "nse-public") {
    try {
      return await fetchNsePublicOptionChain({
        symbol,
        selectedExpiry: params.expiry,
        candles: chart.candles,
        spot: chart.spot,
        priceChange: chart.priceChange,
        priceChangePercent: chart.priceChangePercent,
        strikeRange
      });
    } catch {
      return createMockOptionChain({
        symbol,
        displayName: getDisplayName(symbol),
        expiry: params.expiry ?? expiryDates[0],
        expiryDates,
        spot: chart.spot,
        priceChange: chart.priceChange,
        priceChangePercent: chart.priceChangePercent,
        candles: chart.candles,
        strikeRange
      });
    }
  }

  return createMockOptionChain({
    symbol,
    displayName: getDisplayName(symbol),
    expiry: params.expiry ?? expiryDates[0],
    expiryDates,
    spot: chart.spot,
    priceChange: chart.priceChange,
    priceChangePercent: chart.priceChangePercent,
    candles: chart.candles,
    strikeRange
  });
}

export async function getMarketSummaryData(): Promise<MarketSummaryPayload> {
  return fetchYahooMarketSummary();
}

export async function searchSymbols(query: string): Promise<SymbolSearchResult[]> {
  return searchYahooSymbols(query);
}

