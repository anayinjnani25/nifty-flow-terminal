"use client";

import { Plus, Star, X } from "lucide-react";
import { useMemo, useState } from "react";
import { Panel } from "@/components/ui/panel";
import type { MarketSummaryPayload } from "@/lib/market/types";

export function WatchlistPanel({
  data,
  watchlist,
  onAdd,
  onRemove,
  onSelect
}: {
  data?: MarketSummaryPayload;
  watchlist: string[];
  onAdd: (symbol: string) => void;
  onRemove: (symbol: string) => void;
  onSelect: (symbol: string) => void;
}) {
  const [manualSymbol, setManualSymbol] = useState("");

  const movers = useMemo(() => data?.gainers.concat(data.losers).concat(data.mostActive) ?? [], [data]);
  const uniqueMap = new Map(movers.map((item) => [item.symbol, item]));

  return (
    <Panel
      title="Watchlist"
      subtitle="Local watchlist for your favorite symbols and fast chain switching."
      className="h-full"
      action={
        <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs text-cyan-100">
          <Star className="h-3.5 w-3.5" />
          {watchlist.length} saved
        </div>
      }
    >
      <div className="space-y-4">
        <div className="flex gap-2">
          <input
            value={manualSymbol}
            onChange={(event) => setManualSymbol(event.target.value.toUpperCase())}
            placeholder="Add symbol e.g. SBIN.NS"
            className="flex-1 rounded-2xl border border-slate-700 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400/50"
          />
          <button
            type="button"
            onClick={() => {
              if (!manualSymbol.trim()) return;
              onAdd(manualSymbol.trim());
              setManualSymbol("");
            }}
            className="inline-flex items-center gap-2 rounded-2xl border border-cyan-400/30 bg-cyan-400/10 px-4 py-3 text-sm text-cyan-100"
          >
            <Plus className="h-4 w-4" />
            Add
          </button>
        </div>
        <div className="space-y-2">
          {watchlist.map((symbol) => {
            const match = uniqueMap.get(symbol);
            return (
              <div
                key={symbol}
                className="flex items-center justify-between rounded-2xl border border-white/8 bg-slate-950/45 px-4 py-3"
              >
                <button type="button" onClick={() => onSelect(symbol)} className="text-left">
                  <div className="text-sm font-medium text-white">{match?.shortName ?? symbol}</div>
                  <div className="text-xs text-slate-500">{symbol}</div>
                </button>
                <div className="flex items-center gap-3">
                  {match ? (
                    <div className={match.changePercent >= 0 ? "text-sm text-emerald-300" : "text-sm text-rose-300"}>
                      {match.changePercent >= 0 ? "+" : ""}
                      {match.changePercent.toFixed(2)}%
                    </div>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => onRemove(symbol)}
                    className="rounded-full p-1 text-slate-500 transition hover:bg-white/5 hover:text-rose-300"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Panel>
  );
}
