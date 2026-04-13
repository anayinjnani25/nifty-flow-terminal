"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { Panel } from "@/components/ui/panel";
import type { OptionChainPayload } from "@/lib/market/types";

const tooltipStyle = {
  background: "#07111f",
  border: "1px solid rgba(148, 163, 184, 0.2)",
  borderRadius: 16
};

export function ChartsPanel({ data }: { data?: OptionChainPayload }) {
  if (!data) {
    return <div className="glass-panel h-[720px] animate-pulse rounded-3xl bg-slate-950/45" />;
  }

  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <Panel title="OI vs strike" subtitle="Open interest concentration across the selected strike range.">
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data.charts.oiByStrike}>
              <defs>
                <linearGradient id="callFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f25f5c" stopOpacity={0.65} />
                  <stop offset="95%" stopColor="#f25f5c" stopOpacity={0.05} />
                </linearGradient>
                <linearGradient id="putFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#15b36e" stopOpacity={0.65} />
                  <stop offset="95%" stopColor="#15b36e" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(148,163,184,0.12)" vertical={false} />
              <XAxis dataKey="strike" tick={{ fill: "#94a3b8", fontSize: 12 }} />
              <YAxis tick={{ fill: "#94a3b8", fontSize: 12 }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend />
              <Area type="monotone" dataKey="callOi" stroke="#f25f5c" fill="url(#callFill)" name="Call OI" />
              <Area type="monotone" dataKey="putOi" stroke="#15b36e" fill="url(#putFill)" name="Put OI" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Panel>

      <Panel title="Call vs put activity" subtitle="Volume comparison by strike for liquidity and positioning.">
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.charts.oiByStrike}>
              <CartesianGrid stroke="rgba(148,163,184,0.12)" vertical={false} />
              <XAxis dataKey="strike" tick={{ fill: "#94a3b8", fontSize: 12 }} />
              <YAxis tick={{ fill: "#94a3b8", fontSize: 12 }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend />
              <Bar dataKey="callVolume" fill="#53c1ff" name="Call volume" radius={[6, 6, 0, 0]} />
              <Bar dataKey="putVolume" fill="#15b36e" name="Put volume" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Panel>

      <Panel title="IV smile" subtitle="Implied volatility skew around the current spot.">
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data.charts.ivSmile}>
              <CartesianGrid stroke="rgba(148,163,184,0.12)" vertical={false} />
              <XAxis dataKey="strike" tick={{ fill: "#94a3b8", fontSize: 12 }} />
              <YAxis tick={{ fill: "#94a3b8", fontSize: 12 }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend />
              <Line type="monotone" dataKey="callIv" stroke="#53c1ff" strokeWidth={3} dot={false} name="Call IV" />
              <Line type="monotone" dataKey="putIv" stroke="#f8b73e" strokeWidth={3} dot={false} name="Put IV" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Panel>

      <Panel title="Data notes" subtitle="Operational transparency and platform roadmap.">
        <div className="grid gap-3">
          {data.notes.map((note) => (
            <div key={note} className="rounded-2xl border border-white/8 bg-slate-950/45 p-4 text-sm leading-6 text-slate-300">
              {note}
            </div>
          ))}
          <div className="rounded-2xl border border-dashed border-cyan-400/20 bg-cyan-400/5 p-4 text-sm leading-6 text-cyan-50">
            Suggested next upgrades: broker-auth alerts, historical option-chain snapshots, strategy
            Greeks, paper trading, news sentiment, and streaming WebSocket ingestion.
          </div>
        </div>
      </Panel>
    </div>
  );
}

