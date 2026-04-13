"use client";

import { useMemo, useState } from "react";
import { LineChart, Line, ResponsiveContainer, ReferenceLine, Tooltip, XAxis, YAxis } from "recharts";
import { Panel } from "@/components/ui/panel";
import type { OptionChainPayload } from "@/lib/market/types";

type StrategyPreset = "Straddle" | "Strangle" | "Iron Condor";

export function StrategyBuilder({ data }: { data?: OptionChainPayload }) {
  const [preset, setPreset] = useState<StrategyPreset>("Straddle");
  const [width, setWidth] = useState(200);

  const payoff = useMemo(() => {
    if (!data) return [];

    const atm = data.analytics.atmStrike;
    const lower = atm - width;
    const upper = atm + width;
    const atmRow = data.chain.find((row) => row.strike === atm);
    const lowerRow = data.chain.find((row) => row.strike === lower);
    const upperRow = data.chain.find((row) => row.strike === upper);
    const callPremium = atmRow?.call?.ltp ?? 0;
    const putPremium = atmRow?.put?.ltp ?? 0;
    const lowerPut = lowerRow?.put?.ltp ?? putPremium * 0.65;
    const upperCall = upperRow?.call?.ltp ?? callPremium * 0.65;

    return Array.from({ length: 19 }, (_, index) => {
      const spot = atm - width * 2 + index * (width / 2);
      let pnl = 0;

      if (preset === "Straddle") {
        pnl = Math.max(spot - atm, 0) + Math.max(atm - spot, 0) - (callPremium + putPremium);
      } else if (preset === "Strangle") {
        pnl = Math.max(spot - upper, 0) + Math.max(lower - spot, 0) - (upperCall + lowerPut);
      } else {
        const shortCall = upperCall;
        const shortPut = lowerPut;
        const longCall = Math.max((upper + width / 2) - spot, 0);
        const longPut = Math.max(spot - (lower - width / 2), 0);
        pnl =
          shortCall +
          shortPut -
          Math.max(spot - upper, 0) -
          Math.max(lower - spot, 0) -
          0.45 * (longCall + longPut);
      }

      return {
        spot,
        pnl: Number(pnl.toFixed(2))
      };
    });
  }, [data, preset, width]);

  return (
    <Panel
      title="Strategy builder"
      subtitle="Quick what-if payoff mapping for common neutral-volatility structures."
      className="h-full"
    >
      <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-4 rounded-2xl border border-white/8 bg-slate-950/45 p-4">
          <div>
            <div className="mb-2 text-xs uppercase tracking-[0.22em] text-slate-400">Preset</div>
            <div className="flex flex-wrap gap-2">
              {(["Straddle", "Strangle", "Iron Condor"] as StrategyPreset[]).map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setPreset(item)}
                  className={
                    preset === item
                      ? "rounded-full border border-cyan-300 bg-cyan-400/15 px-3 py-2 text-sm text-cyan-100"
                      : "rounded-full border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-300"
                  }
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
          <div>
            <div className="mb-2 flex items-center justify-between text-xs uppercase tracking-[0.22em] text-slate-400">
              <span>Wing width</span>
              <span>{width}</span>
            </div>
            <input
              type="range"
              min={50}
              max={400}
              step={50}
              value={width}
              onChange={(event) => setWidth(Number(event.target.value))}
              className="w-full accent-cyan-400"
            />
          </div>
          <div className="rounded-2xl border border-white/8 bg-white/5 p-4 text-sm text-slate-300">
            Built as a local simulation layer, so you can later plug in broker margin APIs, Greeks,
            and execution modeling without rewriting the dashboard.
          </div>
        </div>
        <div className="h-80 rounded-2xl border border-white/8 bg-slate-950/45 p-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={payoff}>
              <XAxis
                dataKey="spot"
                tick={{ fill: "#94a3b8", fontSize: 12 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis tick={{ fill: "#94a3b8", fontSize: 12 }} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{
                  background: "#07111f",
                  border: "1px solid rgba(148, 163, 184, 0.2)",
                  borderRadius: 16
                }}
              />
              <ReferenceLine y={0} stroke="rgba(248,184,62,0.8)" strokeDasharray="4 4" />
              <Line type="monotone" dataKey="pnl" stroke="#53c1ff" strokeWidth={3} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Panel>
  );
}
