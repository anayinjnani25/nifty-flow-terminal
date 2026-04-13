"use client";

import { Panel } from "@/components/ui/panel";
import type { Candle } from "@/lib/market/types";

function CandleSvg({ candles }: { candles: Candle[] }) {
  const width = 920;
  const height = 260;
  const padding = 20;
  const high = Math.max(...candles.map((candle) => candle.high));
  const low = Math.min(...candles.map((candle) => candle.low));
  const range = Math.max(high - low, 1);
  const candleWidth = Math.max((width - padding * 2) / candles.length - 3, 4);

  const y = (value: number) => height - padding - ((value - low) / range) * (height - padding * 2);

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-full w-full">
      {candles.map((candle, index) => {
        const x = padding + index * ((width - padding * 2) / candles.length);
        const positive = candle.close >= candle.open;
        const bodyTop = y(Math.max(candle.open, candle.close));
        const bodyBottom = y(Math.min(candle.open, candle.close));
        return (
          <g key={`${candle.time}-${index}`}>
            <line
              x1={x + candleWidth / 2}
              x2={x + candleWidth / 2}
              y1={y(candle.high)}
              y2={y(candle.low)}
              stroke={positive ? "#15b36e" : "#f25f5c"}
              strokeWidth={1.5}
            />
            <rect
              x={x}
              y={bodyTop}
              width={candleWidth}
              height={Math.max(bodyBottom - bodyTop, 3)}
              rx={2}
              fill={positive ? "#15b36e" : "#f25f5c"}
              opacity={0.9}
            />
          </g>
        );
      })}
    </svg>
  );
}

export function CandlesPanel({ candles }: { candles?: Candle[] }) {
  return (
    <Panel
      title="NIFTY candlestick tape"
      subtitle="Intraday price action rendered from the live or delayed Yahoo chart feed."
      className="h-full"
    >
      {candles?.length ? (
        <div className="h-72 rounded-2xl border border-white/8 bg-slate-950/45 p-4">
          <CandleSvg candles={candles.slice(-48)} />
        </div>
      ) : (
        <div className="h-72 animate-pulse rounded-2xl bg-slate-950/45" />
      )}
    </Panel>
  );
}

