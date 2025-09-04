"use client";

import { useQuery } from "@apollo/client/react";
import { GET_DAILY_SNAPSHOTS, GET_RECENT_SWAPS } from "@/lib/apollo-client";

interface Swap {
  id: string;
  user: string;
  timestamp: string;
  transactionHash: string;
  tokenIn: string;
  tokenOut: string;
  amountIn: string;
  amountOut: string;
  fee: string;
}

interface DailySnapshot {
  date: number;
  reserveA: string;
  reserveB: string;
  volumeA: string;
  volumeB: string;
  fees: string;
  txCount: number;
  totalLiquidity: string;
}

export function useSubgraphData() {
  /* -------- Recent swaps -------- */
  const { data: swapsData } = useQuery<{ swaps: Swap[] }>(GET_RECENT_SWAPS, {
    variables: { first: 10 },
    pollInterval: 15_000,
  });

  /* -------- Daily snapshots -------- */
  const { data: dailyData } = useQuery<{ dailyPoolSnapshots: DailySnapshot[] }>(GET_DAILY_SNAPSHOTS, {
    variables: { first: 1 },
    pollInterval: 60_000,
  });

  /* ---- Process swaps ---- */
  const swaps = swapsData?.swaps ?? [];
  const recentTransactions = swaps
    .map((s) => ({
      id: s.id,
      type: "swap" as const,
      user: s.user,
      timestamp: Number(s.timestamp),
      transactionHash: s.transactionHash,
      tokenIn: s.tokenIn,
      tokenOut: s.tokenOut,
      amountIn: s.amountIn,
      amountOut: s.amountOut,
      fee: s.fee,
    }))
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 20);

  /* ---- Process daily snapshot ---- */
  const snapshot = dailyData?.dailyPoolSnapshots?.[0];
  const totalLiquidityProviders = 0; // TODO: fetch separately or aggregate
  const volume24h = snapshot ? (parseFloat(snapshot.volumeA) + parseFloat(snapshot.volumeB)).toFixed(2) : "0.00";
  const fees24h = snapshot ? parseFloat(snapshot.fees).toFixed(2) : "0.00";
  const transactions24h = snapshot?.txCount ?? 0;

  const totalLiquidity = snapshot ? parseFloat(snapshot.totalLiquidity) : 0;
  const apr = totalLiquidity > 0 ? ((parseFloat(fees24h) * 365 * 100) / totalLiquidity).toFixed(2) : "0.00";

  /* ---- Chart data (last 30 days) ---- */
  const chartData = {
    liquidity:
      dailyData?.dailyPoolSnapshots
        .map((d) => ({
          date: new Date(d.date * 86_400_000).toISOString().split("T")[0],
          liquidity: parseFloat(d.totalLiquidity),
          tokenA: parseFloat(d.reserveA),
          tokenB: parseFloat(d.reserveB),
        }))
        .reverse() ?? [],

    volume:
      dailyData?.dailyPoolSnapshots
        .map((d) => ({
          date: new Date(d.date * 86_400_000).toISOString().split("T")[0],
          volume: parseFloat(d.volumeA) + parseFloat(d.volumeB),
          swaps: d.txCount,
          fees: parseFloat(d.fees),
        }))
        .reverse() ?? [],
  };

  return {
    totalLiquidityProviders,
    volume24h,
    fees24h,
    transactions24h,
    apr,
    recentTransactions,
    chartData,
  };
}
