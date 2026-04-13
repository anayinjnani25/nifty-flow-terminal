"use client";

import { Search, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import type { SymbolSearchResult } from "@/lib/market/types";
import { cn } from "@/lib/utils";

export function StockSearch({
  selectedSymbol,
  onSelect
}: {
  selectedSymbol: string;
  onSelect: (symbol: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SymbolSearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }

    const controller = new AbortController();
    const timeout = setTimeout(async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`, {
          signal: controller.signal
        });
        const data = (await response.json()) as SymbolSearchResult[];
        setResults(data);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => {
      controller.abort();
      clearTimeout(timeout);
    };
  }, [query]);

  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
      <div className="mb-3 flex items-center gap-2 text-sm text-slate-300">
        <Sparkles className="h-4 w-4 text-cyan-300" />
        Search equities and switch the chain context instantly.
      </div>
      <div className="relative">
        <Search className="pointer-events-none absolute left-4 top-3.5 h-4 w-4 text-slate-500" />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search Reliance, TCS, HDFC Bank..."
          className="w-full rounded-2xl border border-slate-700/70 bg-slate-950/70 py-3 pl-11 pr-4 text-sm text-white outline-none transition focus:border-cyan-400/50"
        />
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {["^NSEI", "RELIANCE.NS", "TCS.NS", "HDFCBANK.NS", "INFY.NS"].map((symbol) => (
          <button
            key={symbol}
            type="button"
            onClick={() => onSelect(symbol)}
            className={cn(
              "rounded-full border px-3 py-1.5 text-xs transition",
              selectedSymbol === symbol
                ? "border-cyan-300 bg-cyan-400/15 text-cyan-100"
                : "border-slate-700 bg-slate-900/60 text-slate-300 hover:border-slate-500"
            )}
          >
            {symbol === "^NSEI" ? "NIFTY 50" : symbol.replace(".NS", "")}
          </button>
        ))}
      </div>
      <div className="mt-4 max-h-56 space-y-2 overflow-y-auto pr-1">
        {loading ? <div className="text-sm text-slate-400">Searching live symbols...</div> : null}
        {!loading &&
          results.map((item) => (
            <button
              key={item.symbol}
              type="button"
              onClick={() => {
                onSelect(item.symbol);
                setQuery("");
                setResults([]);
              }}
              className="w-full rounded-2xl border border-slate-800/80 bg-slate-950/50 px-4 py-3 text-left transition hover:border-cyan-400/25 hover:bg-slate-900/80"
            >
              <div className="text-sm font-medium text-white">{item.shortName}</div>
              <div className="mt-1 text-xs text-slate-400">
                {item.symbol} | {item.exchange} | {item.quoteType}
              </div>
            </button>
          ))}
      </div>
    </div>
  );
}
