import {
  type BuildUpSignal,
  type MarketTrend,
  type OptionChainAnalytics,
  type OptionStrikeRow
} from "@/lib/market/types";

function getPayoutAtStrike(chain: OptionStrikeRow[], settlementStrike: number) {
  return chain.reduce((acc, row) => {
    const callLoss = row.call ? Math.max(0, settlementStrike - row.strike) * row.call.oi : 0;
    const putLoss = row.put ? Math.max(0, row.strike - settlementStrike) * row.put.oi : 0;
    return acc + callLoss + putLoss;
  }, 0);
}

export function buildUpFromMetrics(change: number, oiChange: number): BuildUpSignal {
  if (Math.abs(change) < 0.01 && Math.abs(oiChange) < 1) {
    return "Flat";
  }

  if (oiChange >= 0 && change >= 0) {
    return "Long Build-up";
  }

  if (oiChange >= 0 && change < 0) {
    return "Short Build-up";
  }

  if (oiChange < 0 && change < 0) {
    return "Long Unwinding";
  }

  return "Short Covering";
}

export function calculateOptionAnalytics(
  chain: OptionStrikeRow[],
  spot: number
): OptionChainAnalytics {
  const totalCallOi = chain.reduce((acc, row) => acc + (row.call?.oi ?? 0), 0);
  const totalPutOi = chain.reduce((acc, row) => acc + (row.put?.oi ?? 0), 0);
  const pcr = totalCallOi === 0 ? 0 : totalPutOi / totalCallOi;
  const maxPain =
    chain
      .map((row) => ({
        strike: row.strike,
        payout: getPayoutAtStrike(chain, row.strike)
      }))
      .sort((a, b) => a.payout - b.payout)[0]?.strike ?? spot;

  const support = chain
    .map((row) => ({ strike: row.strike, oi: row.put?.oi ?? 0 }))
    .sort((a, b) => b.oi - a.oi)
    .slice(0, 3)
    .map((row) => row.strike);

  const resistance = chain
    .map((row) => ({ strike: row.strike, oi: row.call?.oi ?? 0 }))
    .sort((a, b) => b.oi - a.oi)
    .slice(0, 3)
    .map((row) => row.strike);

  const atmStrike =
    chain.reduce(
      (closest, row) =>
        Math.abs(row.strike - spot) < Math.abs(closest.strike - spot) ? row : closest,
      chain[0]
    )?.strike ?? spot;

  const buildUpCounts = chain.reduce<Record<BuildUpSignal, number>>(
    (acc, row) => {
      if (row.call) acc[row.call.buildUp] += 1;
      if (row.put) acc[row.put.buildUp] += 1;
      return acc;
    },
    {
      Flat: 0,
      "Long Build-up": 0,
      "Short Build-up": 0,
      "Long Unwinding": 0,
      "Short Covering": 0
    }
  );

  const dominantBuildUp =
    (Object.entries(buildUpCounts).sort((a, b) => b[1] - a[1])[0]?.[0] as BuildUpSignal) ?? "Flat";

  return {
    pcr,
    maxPain,
    support,
    resistance,
    trend: deriveTrend(pcr, spot, support, resistance, maxPain),
    atmStrike,
    totalCallOi,
    totalPutOi,
    dominantBuildUp
  };
}

function deriveTrend(
  pcr: number,
  spot: number,
  support: number[],
  resistance: number[],
  maxPain: number
): MarketTrend {
  const nearestSupport = support[0] ?? spot;
  const nearestResistance = resistance[0] ?? spot;

  if (pcr > 1.1 && spot >= nearestSupport && spot >= maxPain * 0.995) {
    return "Bullish";
  }

  if (pcr < 0.9 && spot <= nearestResistance && spot <= maxPain * 1.005) {
    return "Bearish";
  }

  return "Neutral";
}
