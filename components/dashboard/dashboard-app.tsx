"use client";

import { useEffect, useMemo, useState } from "react";
import useSWR from "swr";
import { AlertCenter, type LocalAlert } from "@/components/dashboard/alert-center";
import { AnalyticsStrip } from "@/components/dashboard/analytics-strip";
import { CandlesPanel } from "@/components/dashboard/candles-panel";
import { ChartsPanel } from "@/components/dashboard/charts-panel";
import { MarketSummaryPanel } from "@/components/dashboard/market-summary-panel";
import { OptionChainTable } from "@/components/dashboard/option-chain-table";
import { StockSearch } from "@/components/dashboard/stock-search";
import { StrategyBuilder } from "@/components/dashboard/strategy-builder";
import { TopBar } from "@/components/dashboard/top-bar";
import { WatchlistPanel } from "@/components/dashboard/watchlist-panel";
import { Panel } from "@/components/ui/panel";
import type { MarketSummaryPayload, OptionChainPayload } from "@/lib/market/types";

const fetcher = async <T,>(url: string): Promise<T> => {
  const response = await fetch(url);
  if (!response.ok) {
    const detail = await response.json().catch(() => null);
    throw new Error(detail?.message ?? "Request failed");
  }
  return response.json() as Promise<T>;
};

const DEFAULT_WATCHLIST = ["^NSEI", "RELIANCE.NS", "TCS.NS"];
const DEFAULT_ALERTS: LocalAlert[] = [];

function useLocalStorageState<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(initialValue);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(key);
      if (raw) {
        setValue(JSON.parse(raw) as T);
      }
    } catch {
      setValue(initialValue);
    } finally {
      setHydrated(true);
    }
  }, [initialValue, key]);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(key, JSON.stringify(value));
  }, [hydrated, key, value]);

  return [value, setValue] as const;
}

export function DashboardApp() {
  const [selectedSymbol, setSelectedSymbol] = useState("^NSEI");
  const [expiry, setExpiry] = useState("");
  const [strikeRange, setStrikeRange] = useState(10);
  const [watchlist, setWatchlist] = useLocalStorageState<string[]>("watchlist:v1", DEFAULT_WATCHLIST);
  const [alerts, setAlerts] = useLocalStorageState<LocalAlert[]>("alerts:v1", DEFAULT_ALERTS);

  const chainUrl = useMemo(() => {
    const params = new URLSearchParams({
      symbol: selectedSymbol,
      strikeRange: String(strikeRange)
    });
    if (expiry) {
      params.set("expiry", expiry);
    }
    return `/api/option-chain?${params.toString()}`;
  }, [expiry, selectedSymbol, strikeRange]);

  const {
    data: optionChain,
    error: optionError,
    isLoading: optionLoading,
    mutate: refreshOptionChain
  } = useSWR<OptionChainPayload>(chainUrl, fetcher, {
    refreshInterval: 15000,
    keepPreviousData: true
  });

  const { data: marketSummary } = useSWR<MarketSummaryPayload>("/api/market/summary", fetcher, {
    refreshInterval: 30000
  });

  useEffect(() => {
    if (!expiry && optionChain?.selectedExpiry) {
      setExpiry(optionChain.selectedExpiry);
    }
  }, [expiry, optionChain?.selectedExpiry]);

  const refreshLabel = optionLoading
    ? "Refreshing..."
    : optionChain
      ? `${optionChain.refreshIntervalMs / 1000}s auto`
      : "Booting";

  return (
    <main className="min-h-screen px-4 py-6 md:px-6 lg:px-8">
      <div className="mx-auto flex max-w-[1680px] flex-col gap-6">
        <TopBar data={optionChain} refreshLabel={refreshLabel} onRefresh={() => refreshOptionChain()} />

        <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="grid gap-4">
            <div className="glass-panel rounded-3xl p-5">
              <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
                <StockSearch selectedSymbol={selectedSymbol} onSelect={setSelectedSymbol} />
                <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                  <div className="mb-4 text-sm text-slate-300">
                    Control expiry and the visible strike window to focus on actionable positioning.
                  </div>
                  <div className="grid gap-4">
                    <label className="grid gap-2 text-sm text-slate-400">
                      Expiry date
                      <select
                        value={expiry}
                        onChange={(event) => setExpiry(event.target.value)}
                        className="rounded-2xl border border-slate-700 bg-slate-950/80 px-4 py-3 text-white outline-none"
                      >
                        {(optionChain?.expiryDates ?? []).map((item) => (
                          <option key={item} value={item}>
                            {item}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="grid gap-2 text-sm text-slate-400">
                      Strike range
                      <input
                        type="range"
                        min={6}
                        max={18}
                        step={1}
                        value={strikeRange}
                        onChange={(event) => setStrikeRange(Number(event.target.value))}
                        className="w-full accent-cyan-400"
                      />
                      <span className="text-xs text-slate-500">
                        Showing +/-{strikeRange} strikes around ATM
                      </span>
                    </label>
                    <div className="rounded-2xl border border-white/8 bg-slate-950/45 p-4 text-sm text-slate-300">
                      Trend pulse:{" "}
                      <span className="font-semibold text-white">
                        {optionChain?.analytics.trend ?? "--"}
                      </span>
                      <div className="mt-2 text-xs leading-5 text-slate-500">
                        This score blends PCR, support/resistance clusters, and max-pain positioning.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {optionError ? (
                <div className="mt-4 rounded-2xl border border-rose-400/20 bg-rose-500/10 p-4 text-sm text-rose-200">
                  {optionError.message}. The caching layer will keep serving the last successful response
                  when possible.
                </div>
              ) : null}
            </div>

            <AnalyticsStrip data={optionChain} />
          </div>
          <MarketSummaryPanel data={marketSummary} />
        </div>

        <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
          <OptionChainTable data={optionChain} />
          <div className="grid gap-4">
            <CandlesPanel candles={optionChain?.charts.candles} />
            <WatchlistPanel
              data={marketSummary}
              watchlist={watchlist}
              onAdd={(symbol) => setWatchlist((current) => Array.from(new Set([...current, symbol])))}
              onRemove={(symbol) => setWatchlist((current) => current.filter((item) => item !== symbol))}
              onSelect={setSelectedSymbol}
            />
          </div>
        </div>

        <ChartsPanel data={optionChain} />

        <div className="grid gap-4 xl:grid-cols-[1fr_1fr]">
          <StrategyBuilder data={optionChain} />
          <AlertCenter
            data={optionChain}
            alerts={alerts}
            onCreate={(alert) => setAlerts((current) => [...current, alert])}
            onDelete={(id) => setAlerts((current) => current.filter((item) => item.id !== id))}
          />
        </div>

        <Panel
          title="Professional roadmap"
          subtitle="Features that would move this closer to broker-grade tools like Kite or Sensibull."
        >
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {[
              "WebSocket price and option ticks with selective strike subscriptions",
              "Historical option-chain storage for playback, session analysis, and anomaly detection",
              "Strategy Greeks, margin estimation, and broker order routing",
              "News and macro sentiment overlays with earnings and event risk markers"
            ].map((item) => (
              <div
                key={item}
                className="rounded-2xl border border-white/8 bg-slate-950/45 p-4 text-sm leading-6 text-slate-300"
              >
                {item}
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </main>
  );
}
