"use client";

import { BellRing, Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { Panel } from "@/components/ui/panel";
import type { OptionChainPayload } from "@/lib/market/types";

export type LocalAlert = {
  id: string;
  metric: "spotAbove" | "spotBelow" | "pcrAbove" | "pcrBelow";
  target: number;
};

const alertLabels: Record<LocalAlert["metric"], string> = {
  spotAbove: "Spot above",
  spotBelow: "Spot below",
  pcrAbove: "PCR above",
  pcrBelow: "PCR below"
};

export function AlertCenter({
  data,
  alerts,
  onCreate,
  onDelete
}: {
  data?: OptionChainPayload;
  alerts: LocalAlert[];
  onCreate: (alert: LocalAlert) => void;
  onDelete: (id: string) => void;
}) {
  const [metric, setMetric] = useState<LocalAlert["metric"]>("spotAbove");
  const [target, setTarget] = useState("");

  const evaluated = useMemo(
    () =>
      alerts.map((alert) => {
        const triggered =
          alert.metric === "spotAbove"
            ? (data?.underlyingPrice ?? 0) >= alert.target
            : alert.metric === "spotBelow"
              ? (data?.underlyingPrice ?? 0) <= alert.target
              : alert.metric === "pcrAbove"
                ? (data?.analytics.pcr ?? 0) >= alert.target
                : (data?.analytics.pcr ?? 0) <= alert.target;

        return { ...alert, triggered };
      }),
    [alerts, data]
  );

  return (
    <Panel
      title="Alert center"
      subtitle="Local browser alerts for spot and PCR thresholds. Ready to upgrade to push or webhook alerts."
      action={
        <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/20 bg-amber-400/10 px-3 py-1 text-xs text-amber-100">
          <BellRing className="h-3.5 w-3.5" />
          {evaluated.filter((item) => item.triggered).length} triggered
        </div>
      }
    >
      <div className="grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="rounded-2xl border border-white/8 bg-slate-950/45 p-4">
          <div className="grid gap-3">
            <select
              value={metric}
              onChange={(event) => setMetric(event.target.value as LocalAlert["metric"])}
              className="rounded-2xl border border-slate-700 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none"
            >
              {Object.entries(alertLabels).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
            <input
              value={target}
              onChange={(event) => setTarget(event.target.value)}
              placeholder="Target threshold"
              className="rounded-2xl border border-slate-700 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none"
            />
            <button
              type="button"
              onClick={() => {
                const parsed = Number(target);
                if (!Number.isFinite(parsed)) return;
                onCreate({
                  id: crypto.randomUUID(),
                  metric,
                  target: parsed
                });
                setTarget("");
              }}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-cyan-400/30 bg-cyan-400/10 px-4 py-3 text-sm text-cyan-100"
            >
              <Plus className="h-4 w-4" />
              Create alert
            </button>
          </div>
        </div>
        <div className="space-y-3">
          {evaluated.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-950/35 p-6 text-sm text-slate-400">
              Add spot or PCR triggers here. A natural next step is browser notifications, Telegram,
              or broker/webhook integrations.
            </div>
          ) : (
            evaluated.map((alert) => (
              <div
                key={alert.id}
                className="flex items-center justify-between rounded-2xl border border-white/8 bg-slate-950/45 px-4 py-3"
              >
                <div>
                  <div className="text-sm font-medium text-white">
                    {alertLabels[alert.metric]} {alert.target}
                  </div>
                  <div className={alert.triggered ? "text-xs text-amber-300" : "text-xs text-slate-500"}>
                    {alert.triggered ? "Triggered" : "Monitoring"}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onDelete(alert.id)}
                  className="rounded-full border border-slate-700 px-3 py-1 text-xs text-slate-300"
                >
                  Remove
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </Panel>
  );
}

