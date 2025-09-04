"use client";

import { LiquidityChart } from "@/components/charts/LiquidityChart";
import { VolumeChart } from "@/components/charts/VolumeChart";
import { Header } from "@/components/layout/Header";
import { PoolOverview } from "@/components/pool/PoolOverview";
import { RecentTransactions } from "@/components/pool/RecentTransactions";
import { useSubgraphData } from "@/hooks/useSubgraph";

export default function PoolPage() {
  const { chartData } = useSubgraphData();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <PoolOverview />

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            <LiquidityChart data={chartData.liquidity} />
            <VolumeChart data={chartData.volume} />
          </div>

          <RecentTransactions />
        </div>
      </main>
    </div>
  );
}
