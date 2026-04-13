"use client";

import { ArrowDownToLine, ArrowUpToLine, Scale, Signal, Target, TrendingUp } from "lucide-react";
import type { OptionChainPayload } from "@/lib/market/types";
import { formatCompact, formatNumber } from "@/lib/utils";

export function AnalyticsStrip({ data }: { data?: OptionChainPayload }) {
  if (!data) {
    return (
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="glass-panel h-28 animate-pulse rounded-3xl bg-slate-900/40" />
        ))}
      </div>
    );
  }

  const cards = [
    {
      label: "PCR",
      value: data.analytics.pcr.toFixed(2),
      meta: data.analytics.trend,
      icon: Scale
    },
    {
      label: "Max Pain",
      value: formatNumber(data.analytics.maxPain, 0),
      meta: `ATM ${formatNumber(data.analytics.atmStrike, 0)}`,
      icon: Target
    },
    {
      label: "Support",
      value: data.analytics.support.map((item) => formatNumber(item)).join(" / "),
      meta: "Put OI cluster",
      icon: ArrowDownToLine
    },
    {
      label: "Resistance",
      value: data.analytics.resistance.map((item) => formatNumber(item)).join(" / "),
      meta: "Call OI cluster",
      icon: ArrowUpToLine
    },
    {
      label: "Total Call OI",
      value: formatCompact(data.analytics.totalCallOi),
      meta: data.analytics.dominantBuildUp,
      icon: Signal
    },
    {
      label: "Total Put OI",
      value: formatCompact(data.analytics.totalPutOi),
      meta: `${data.displayName} flow`,
      icon: TrendingUp
    }
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div key={card.label} className="glass-panel rounded-3xl p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-[0.22em] text-slate-400">{card.label}</span>
              <Icon className="h-4 w-4 text-cyan-300" />
            </div>
            <div className="mt-4 text-xl font-semibold text-white">{card.value}</div>
            <div className="mt-2 text-sm text-slate-300">{card.meta}</div>
          </div>
        );
      })}
    </div>
  );
}
