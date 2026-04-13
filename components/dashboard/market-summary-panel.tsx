"use client";

import type { MarketSummaryPayload } from "@/lib/market/types";
import { Panel } from "@/components/ui/panel";
import { formatCompact } from "@/lib/utils";

function MoverList({
  title,
  items,
  positive
}: {
  title: string;
  items: MarketSummaryPayload["gainers"];
  positive: boolean;
}) {
  return (
    <div className="rounded-2xl border border-white/8 bg-slate-950/45 p-4">
      <div className="mb-3 text-xs uppercase tracking-[0.25em] text-slate-400">{title}</div>
      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.symbol} className="flex items-center justify-between gap-3">
            <div>
              <div className="text-sm font-medium text-white">{item.shortName}</div>
              <div className="text-xs text-slate-500">{item.symbol}</div>
            </div>
            <div className="text-right">
              <div className="text-sm text-white">INR {item.price.toFixed(2)}</div>
              <div className={positive ? "text-xs text-emerald-300" : "text-xs text-rose-300"}>
                {item.changePercent > 0 ? "+" : ""}
                {item.changePercent.toFixed(2)}%
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function MarketSummaryPanel({ data }: { data?: MarketSummaryPayload }) {
  return (
    <Panel
      title="Market breadth"
      subtitle="Cross-market context using a tracked basket of liquid Indian equities."
      className="h-full"
    >
      {data ? (
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <MoverList title="Top gainers" items={data.gainers} positive />
            <MoverList title="Top losers" items={data.losers} positive={false} />
            <div className="rounded-2xl border border-white/8 bg-slate-950/45 p-4">
              <div className="mb-3 text-xs uppercase tracking-[0.25em] text-slate-400">
                Most active
              </div>
              <div className="space-y-3">
                {data.mostActive.map((item) => (
                  <div key={item.symbol} className="flex items-center justify-between gap-3">
                    <div>
                      <div className="text-sm font-medium text-white">{item.shortName}</div>
                      <div className="text-xs text-slate-500">{item.sector}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-white">{formatCompact(item.volume)}</div>
                      <div className="text-xs text-slate-500">Vol</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
            <div className="rounded-2xl border border-white/8 bg-slate-950/45 p-4">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-xs uppercase tracking-[0.25em] text-slate-400">
                  Sector performance
                </span>
                <span className="text-sm text-slate-300">
                  Sentiment {data.sentiment.label} ({data.sentiment.score.toFixed(2)})
                </span>
              </div>
              <div className="space-y-3">
                {data.sectors.slice(0, 6).map((sector) => (
                  <div key={sector.sector}>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span className="text-white">{sector.sector}</span>
                      <span
                        className={
                          sector.averageChangePercent >= 0 ? "text-emerald-300" : "text-rose-300"
                        }
                      >
                        {sector.averageChangePercent >= 0 ? "+" : ""}
                        {sector.averageChangePercent.toFixed(2)}%
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-900">
                      <div
                        className={
                          sector.averageChangePercent >= 0
                            ? "h-2 rounded-full bg-gradient-to-r from-emerald-500/70 to-cyan-400/70"
                            : "h-2 rounded-full bg-gradient-to-r from-rose-500/70 to-amber-500/70"
                        }
                        style={{
                          width: `${Math.min(Math.abs(sector.averageChangePercent) * 24, 100)}%`
                        }}
                      />
                    </div>
                    <div className="mt-1 text-xs text-slate-500">{sector.leaders.join(" | ")}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-2xl border border-white/8 bg-slate-950/45 p-4">
              <div className="mb-4 text-xs uppercase tracking-[0.25em] text-slate-400">
                Breadth pulse
              </div>
              <div className="grid gap-3">
                <div className="rounded-2xl border border-white/8 bg-white/5 p-4">
                  <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Advancing</div>
                  <div className="mt-2 text-2xl font-semibold text-emerald-300">
                    {data.sentiment.advancing}
                  </div>
                </div>
                <div className="rounded-2xl border border-white/8 bg-white/5 p-4">
                  <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Declining</div>
                  <div className="mt-2 text-2xl font-semibold text-rose-300">
                    {data.sentiment.declining}
                  </div>
                </div>
                <div className="rounded-2xl border border-white/8 bg-white/5 p-4">
                  <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Timestamp</div>
                  <div className="mt-2 text-sm text-white">
                    {new Date(data.timestamp).toLocaleTimeString("en-IN")}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="h-72 animate-pulse rounded-3xl bg-slate-950/45" />
      )}
    </Panel>
  );
}
