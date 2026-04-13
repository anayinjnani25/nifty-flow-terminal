export type ProviderStatus = "live" | "delayed" | "mock";
export type MarketTrend = "Bullish" | "Bearish" | "Neutral";
export type BuildUpSignal =
  | "Long Build-up"
  | "Short Build-up"
  | "Long Unwinding"
  | "Short Covering"
  | "Flat";
export type Moneyness = "ITM" | "ATM" | "OTM";

export type OptionSideMetrics = {
  ltp: number;
  change: number;
  oi: number;
  oiChange: number;
  volume: number;
  iv: number | null;
  buildUp: BuildUpSignal;
};

export type OptionStrikeRow = {
  strike: number;
  distanceFromSpot: number;
  call: OptionSideMetrics | null;
  put: OptionSideMetrics | null;
  callMoneyness: Moneyness;
  putMoneyness: Moneyness;
  isAtm: boolean;
};

export type Candle = {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};

export type MarketMover = {
  symbol: string;
  shortName: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap: number;
  sector: string;
};

export type SectorPerformance = {
  sector: string;
  averageChangePercent: number;
  leaders: string[];
};

export type SymbolSearchResult = {
  symbol: string;
  shortName: string;
  exchange: string;
  quoteType: string;
};

export type OptionChainAnalytics = {
  pcr: number;
  maxPain: number;
  support: number[];
  resistance: number[];
  trend: MarketTrend;
  atmStrike: number;
  totalCallOi: number;
  totalPutOi: number;
  dominantBuildUp: BuildUpSignal;
};

export type OptionChainPayload = {
  symbol: string;
  displayName: string;
  underlyingPrice: number;
  priceChange: number;
  priceChangePercent: number;
  selectedExpiry: string;
  expiryDates: string[];
  providerStatus: ProviderStatus;
  sourceLabel: string;
  lastUpdated: string;
  refreshIntervalMs: number;
  notes: string[];
  analytics: OptionChainAnalytics;
  chain: OptionStrikeRow[];
  charts: {
    oiByStrike: Array<{
      strike: number;
      callOi: number;
      putOi: number;
      callVolume: number;
      putVolume: number;
    }>;
    ivSmile: Array<{
      strike: number;
      callIv: number | null;
      putIv: number | null;
    }>;
    candles: Candle[];
  };
};

export type MarketSummaryPayload = {
  gainers: MarketMover[];
  losers: MarketMover[];
  mostActive: MarketMover[];
  sectors: SectorPerformance[];
  sentiment: {
    score: number;
    label: MarketTrend;
    advancing: number;
    declining: number;
  };
  timestamp: string;
};

