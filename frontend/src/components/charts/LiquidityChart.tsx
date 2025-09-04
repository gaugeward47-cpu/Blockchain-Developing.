"use client";

import { Droplets } from "lucide-react";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useSubgraphData } from "@/hooks/useSubgraph";

interface Props {
  data: Array<{ date: string; liquidity: number; tokenA: number; tokenB: number }>;
}

export function LiquidityChart({ data }: Props) {
  const { chartData } = useSubgraphData();

  const liquiditySeries = chartData.liquidity.map((d: any) => ({
    date: d.date,
    liquidity: d.totalLiquidity,
    tokenA: d.reserveA,
    tokenB: d.reserveB,
  }));

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
      <div className="flex items-center space-x-2 mb-6">
        <Droplets className="h-5 w-5 text-blue-600" />
        <h3 className="text-lg font-semibold">Pool Liquidity (24 h)</h3>
      </div>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={liquiditySeries}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" fontSize={12} />
            <YAxis tickFormatter={(v) => `$${(+v).toLocaleString()}`} />
            <Tooltip
              content={({ active, payload }) =>
                active && payload ? (
                  <div className="bg-white p-3 rounded shadow">
                    <p>Liquidity: ${payload[0]?.value?.toLocaleString()}</p>
                    <p>TKA: ${payload[0]?.payload?.tokenA}</p>
                    <p>TKB: ${payload[0]?.payload?.tokenB}</p>
                  </div>
                ) : null
              }
            />
            <Line type="monotone" dataKey="liquidity" stroke="#3B82F6" strokeWidth={3} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
