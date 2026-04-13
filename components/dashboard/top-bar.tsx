"use client";

import { Activity, RefreshCw, ShieldCheck, TimerReset } from "lucide-react";
import type { OptionChainPayload } from "@/lib/market/types";
import { formatCurrency } from "@/lib/utils";

export function TopBar({
  data,
  refreshLabel,
  onRefresh
}: {
  data?: OptionChainPayload;
  refreshLabel: string;
  onRefresh: () => void;
}) {
  const changePositive = (data?.priceChange ?? 0) >= 0;

  return (
    <div className="glass-panel relative overflow-hidden rounded-[2rem] border border-slate-800/80 px-6 py-6">
      <div className="absolute inset-0 data-grid opacity-40" />
      <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs uppercase tracking-[0.28em] text-cyan-200">
            <Activity className="h-3.5 w-3.5" />
            NIFTY Flow Terminal
          </div>
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-white md:text-5xl">
              Real-time option flow with clarity, speed, and trade context.
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300 md:text-base">
              Focused on NIFTY 50 first, but extensible to single-stock chains, alerts, strategy
              payoffs, and richer broker-grade market intelligence.
            </p>
          </div>
        </div>

        <div className="grid min-w-full gap-3 sm:grid-cols-3 lg:min-w-[520px]">
          <div className="rounded-2xl border border-white/8 bg-white/5 p-4">
            <div className="text-xs uppercase tracking-[0.22em] text-slate-400">Spot</div>
            <div className="mt-2 text-2xl font-semibold text-white">
              {data ? formatCurrency(data.underlyingPrice) : "--"}
            </div>
            <div className={changePositive ? "text-sm text-emerald-300" : "text-sm text-rose-300"}>
              {data
                ? `${changePositive ? "+" : ""}${data.priceChange.toFixed(2)} (${data.priceChangePercent.toFixed(2)}%)`
                : "Waiting for feed"}
            </div>
          </div>
          <div className="rounded-2xl border border-white/8 bg-white/5 p-4">
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-slate-400">
              <ShieldCheck className="h-3.5 w-3.5" />
              Provider
            </div>
            <div className="mt-2 text-lg font-semibold text-white">{data?.sourceLabel ?? "--"}</div>
            <div className="text-sm text-slate-300 capitalize">
              {data?.providerStatus ?? "loading"} mode
            </div>
          </div>
          <div className="rounded-2xl border border-white/8 bg-white/5 p-4">
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-slate-400">
              <TimerReset className="h-3.5 w-3.5" />
              Refresh
            </div>
            <div className="mt-2 text-lg font-semibold text-white">{refreshLabel}</div>
            <button
              type="button"
              onClick={onRefresh}
              className="mt-3 inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-2 text-sm text-cyan-100 transition hover:bg-cyan-400/20"
            >
              <RefreshCw className="h-4 w-4" />
              Manual refresh
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

