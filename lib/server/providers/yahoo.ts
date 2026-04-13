import { MARKET_UNIVERSE } from "@/lib/market/universe";
import type {
  Candle,
  MarketMover,
  MarketSummaryPayload,
  SectorPerformance,
  SymbolSearchResult
} from "@/lib/market/types";

const YAHOO_HEADERS = {
  Accept: "application/json",
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123 Safari/537.36"
};

async function yahooFetch<T>(url: string) {
  const response = await fetch(url, {
    headers: YAHOO_HEADERS,
    next: { revalidate: 0 }
  });

  if (!response.ok) {
    throw new Error(`Yahoo request failed with ${response.status}`);
  }

  return (await response.json()) as T;
}

export async function searchYahooSymbols(query: string): Promise<SymbolSearchResult[]> {
  if (!query.trim()) {
    return [];
  }

  type YahooSearchResponse = {
    quotes: Array<{
      symbol: string;
      shortname?: string;
      exchDisp?: string;
      quoteType?: string;
    }>;
  };

  const data = await yahooFetch<YahooSearchResponse>(
    `https://query2.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(
      query
    )}&quotesCount=8&newsCount=0&lang=en-US&region=IN`
  );

  return data.quotes.map((item) => ({
    symbol: item.symbol,
    shortName: item.shortname ?? item.symbol,
    exchange: item.exchDisp ?? "Unknown",
    quoteType: item.quoteType ?? "Unknown"
  }));
}

type YahooQuoteResponse = {
  quoteResponse: {
    result: Array<{
      symbol: string;
      shortName?: string;
      regularMarketPrice?: number;
      regularMarketChange?: number;
      regularMarketChangePercent?: number;
      regularMarketVolume?: number;
      marketCap?: number;
    }>;
  };
};

export async function fetchYahooMarketSummary(): Promise<MarketSummaryPayload> {
  const symbols = MARKET_UNIVERSE.map((item) => item.symbol).join(",");
  const quoteData = await yahooFetch<YahooQuoteResponse>(
    `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${encodeURIComponent(symbols)}`
  );

  const movers: MarketMover[] = quoteData.quoteResponse.result.map((quote) => {
    const profile = MARKET_UNIVERSE.find((item) => item.symbol === quote.symbol);
    return {
      symbol: quote.symbol,
      shortName: profile?.shortName ?? quote.shortName ?? quote.symbol,
      price: quote.regularMarketPrice ?? 0,
      change: quote.regularMarketChange ?? 0,
      changePercent: quote.regularMarketChangePercent ?? 0,
      volume: quote.regularMarketVolume ?? 0,
      marketCap: quote.marketCap ?? 0,
      sector: profile?.sector ?? "Other"
    };
  });

  const gainers = [...movers].sort((a, b) => b.changePercent - a.changePercent).slice(0, 5);
  const losers = [...movers].sort((a, b) => a.changePercent - b.changePercent).slice(0, 5);
  const mostActive = [...movers].sort((a, b) => b.volume - a.volume).slice(0, 5);

  const sectorPerformance = movers.reduce<Record<string, MarketMover[]>>((acc, mover) => {
    acc[mover.sector] = [...(acc[mover.sector] ?? []), mover];
    return acc;
  }, {});

  const sectors: SectorPerformance[] = Object.entries(sectorPerformance)
    .map(([sector, items]) => ({
      sector,
      averageChangePercent:
        items.reduce((acc, item) => acc + item.changePercent, 0) / Math.max(items.length, 1),
      leaders: [...items]
        .sort((a, b) => b.changePercent - a.changePercent)
        .slice(0, 2)
        .map((item) => item.shortName)
    }))
    .sort((a, b) => b.averageChangePercent - a.averageChangePercent);

  const advancing = movers.filter((item) => item.changePercent >= 0).length;
  const declining = movers.length - advancing;
  const score =
    movers.reduce((acc, item) => acc + item.changePercent, 0) / Math.max(movers.length, 1);
  const label = score > 0.35 ? "Bullish" : score < -0.35 ? "Bearish" : "Neutral";

  return {
    gainers,
    losers,
    mostActive,
    sectors,
    sentiment: {
      score,
      label,
      advancing,
      declining
    },
    timestamp: new Date().toISOString()
  };
}

type YahooChartResponse = {
  chart: {
    result?: Array<{
      meta: {
        regularMarketPrice?: number;
        chartPreviousClose?: number;
      };
      timestamp?: number[];
      indicators: {
        quote: Array<{
          open?: Array<number | null>;
          high?: Array<number | null>;
          low?: Array<number | null>;
          close?: Array<number | null>;
          volume?: Array<number | null>;
        }>;
      };
    }>;
  };
};

export async function fetchYahooChart(symbol: string): Promise<{
  spot: number;
  priceChange: number;
  priceChangePercent: number;
  candles: Candle[];
}> {
  const data = await yahooFetch<YahooChartResponse>(
    `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(
      symbol
    )}?interval=5m&range=1d&includePrePost=false&lang=en-US&region=IN`
  );
  const result = data.chart.result?.[0];
  if (!result || !result.timestamp?.length) {
    throw new Error("Yahoo chart payload was empty");
  }

  const quote = result.indicators.quote[0];
  const candles = result.timestamp
    .map((time, index) => {
      const open = quote.open?.[index];
      const high = quote.high?.[index];
      const low = quote.low?.[index];
      const close = quote.close?.[index];
      const volume = quote.volume?.[index];

      if (
        open == null ||
        high == null ||
        low == null ||
        close == null ||
        volume == null
      ) {
        return null;
      }

      return {
        time: new Date(time * 1000).toISOString(),
        open,
        high,
        low,
        close,
        volume
      };
    })
    .filter(Boolean) as Candle[];

  const spot = result.meta.regularMarketPrice ?? candles.at(-1)?.close ?? 0;
  const previousClose = result.meta.chartPreviousClose ?? candles[0]?.open ?? spot;
  const priceChange = spot - previousClose;
  const priceChangePercent = previousClose === 0 ? 0 : (priceChange / previousClose) * 100;

  return {
    spot,
    priceChange,
    priceChangePercent,
    candles
  };
}

