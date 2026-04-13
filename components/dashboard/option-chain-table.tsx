"use client";

import type { OptionChainPayload, OptionStrikeRow } from "@/lib/market/types";
import { cn, formatNumber } from "@/lib/utils";

function sideTone(moneyness: OptionStrikeRow["callMoneyness"], variant: "call" | "put") {
  if (moneyness === "ATM") {
    return "bg-amber-400/10";
  }

  if (variant === "call") {
    return moneyness === "ITM" ? "bg-emerald-500/8" : "bg-rose-500/8";
  }

  return moneyness === "ITM" ? "bg-emerald-500/8" : "bg-rose-500/8";
}

function numberTone(value: number) {
  return value >= 0 ? "text-emerald-300" : "text-rose-300";
}

export function OptionChainTable({ data }: { data?: OptionChainPayload }) {
  if (!data) {
    return <div className="glass-panel h-[720px] animate-pulse rounded-3xl bg-slate-950/45" />;
  }

  return (
    <div className="glass-panel rounded-3xl">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/8 px-5 py-4">
        <div>
          <h2 className="text-lg font-semibold text-white">{data.displayName} option chain</h2>
          <p className="mt-1 text-sm text-slate-400">
            Expiry {data.selectedExpiry} | Sticky headers | ATM, ITM, OTM highlighting
          </p>
        </div>
        <div className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-1.5 text-sm text-cyan-100">
          Last updated {new Date(data.lastUpdated).toLocaleTimeString("en-IN")}
        </div>
      </div>

      <div className="max-h-[720px] overflow-auto">
        <table className="min-w-full border-separate border-spacing-0 text-sm">
          <thead className="sticky top-0 z-20 bg-slate-950/95 backdrop-blur">
            <tr className="text-xs uppercase tracking-[0.2em] text-slate-400">
              <th className="px-3 py-3 text-right">Call LTP</th>
              <th className="px-3 py-3 text-right">Call OI</th>
              <th className="px-3 py-3 text-right">Chg OI</th>
              <th className="px-3 py-3 text-right">Volume</th>
              <th className="px-3 py-3 text-right">IV</th>
              <th className="px-3 py-3 text-center">Strike</th>
              <th className="px-3 py-3 text-right">Put LTP</th>
              <th className="px-3 py-3 text-right">Put OI</th>
              <th className="px-3 py-3 text-right">Chg OI</th>
              <th className="px-3 py-3 text-right">Volume</th>
              <th className="px-3 py-3 text-right">IV</th>
            </tr>
          </thead>
          <tbody>
            {data.chain.map((row) => (
              <tr
                key={row.strike}
                className={cn(
                  "border-b border-white/6 text-slate-200 transition hover:bg-white/5",
                  row.isAtm && "bg-amber-400/8"
                )}
              >
                <td className={cn("px-3 py-3 text-right", sideTone(row.callMoneyness, "call"))}>
                  {row.call ? (
                    <div>
                      <div className="font-medium text-white">{row.call.ltp.toFixed(2)}</div>
                      <div className={cn("text-xs", numberTone(row.call.change))}>
                        {row.call.change > 0 ? "+" : ""}
                        {row.call.change.toFixed(2)}
                      </div>
                    </div>
                  ) : (
                    "--"
                  )}
                </td>
                <td className={cn("px-3 py-3 text-right", sideTone(row.callMoneyness, "call"))}>
                  {row.call ? formatNumber(row.call.oi) : "--"}
                </td>
                <td
                  className={cn(
                    "px-3 py-3 text-right",
                    sideTone(row.callMoneyness, "call"),
                    row.call ? numberTone(row.call.oiChange) : ""
                  )}
                >
                  {row.call ? formatNumber(row.call.oiChange) : "--"}
                </td>
                <td className={cn("px-3 py-3 text-right", sideTone(row.callMoneyness, "call"))}>
                  {row.call ? formatNumber(row.call.volume) : "--"}
                </td>
                <td className={cn("px-3 py-3 text-right", sideTone(row.callMoneyness, "call"))}>
                  {row.call?.iv?.toFixed(2) ?? "--"}
                </td>
                <td className="sticky left-0 z-10 border-x border-white/8 bg-slate-950/95 px-4 py-3 text-center font-semibold text-white backdrop-blur">
                  <div>{formatNumber(row.strike)}</div>
                  <div className="mt-1 text-[11px] uppercase tracking-[0.18em] text-slate-500">
                    {row.isAtm
                      ? "ATM"
                      : `${row.distanceFromSpot > 0 ? "+" : ""}${row.distanceFromSpot.toFixed(0)}`}
                  </div>
                </td>
                <td className={cn("px-3 py-3 text-right", sideTone(row.putMoneyness, "put"))}>
                  {row.put ? (
                    <div>
                      <div className="font-medium text-white">{row.put.ltp.toFixed(2)}</div>
                      <div className={cn("text-xs", numberTone(row.put.change))}>
                        {row.put.change > 0 ? "+" : ""}
                        {row.put.change.toFixed(2)}
                      </div>
                    </div>
                  ) : (
                    "--"
                  )}
                </td>
                <td className={cn("px-3 py-3 text-right", sideTone(row.putMoneyness, "put"))}>
                  {row.put ? formatNumber(row.put.oi) : "--"}
                </td>
                <td
                  className={cn(
                    "px-3 py-3 text-right",
                    sideTone(row.putMoneyness, "put"),
                    row.put ? numberTone(row.put.oiChange) : ""
                  )}
                >
                  {row.put ? formatNumber(row.put.oiChange) : "--"}
                </td>
                <td className={cn("px-3 py-3 text-right", sideTone(row.putMoneyness, "put"))}>
                  {row.put ? formatNumber(row.put.volume) : "--"}
                </td>
                <td className={cn("px-3 py-3 text-right", sideTone(row.putMoneyness, "put"))}>
                  {row.put?.iv?.toFixed(2) ?? "--"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
