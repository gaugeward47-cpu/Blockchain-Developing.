"use client";

import { BarChart3 } from "lucide-react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

interface Props {
  data: Array<{ date: string; volume: number; swaps: number; fees: number }>;
}

// helper: tooltip component defined OUTSIDE to avoid nesting
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700">
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Date: {label}</p>
      <p className="text-sm">
        <span className="text-green-600 dark:text-green-400">Volume: </span>
        <span className="font-semibold">${d.volume.toLocaleString()}</span>
      </p>
      <p className="text-sm">
        <span className="text-blue-600 dark:text-blue-400">Swaps: </span>
        <span className="font-semibold">{d.swaps}</span>
      </p>
      <p className="text-sm">
        <span className="text-purple-600 dark:text-purple-400">Fees: </span>
        <span className="font-semibold">${d.fees.toFixed(2)}</span>
      </p>
    </div>
  );
};

const formatVolume = (value: number) => (value >= 1000 ? `$${(value / 1000).toFixed(1)}K` : `$${value}`);

export function VolumeChart({ data }: Props) {
  const totalVolume = data.reduce((sum, d) => sum + d.volume, 0);
  const totalSwaps = data.reduce((sum, d) => sum + d.swaps, 0);
  const totalFees = data.reduce((sum, d) => sum + d.fees, 0);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <BarChart3 className="h-5 w-5 text-green-600" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Trading Volume (24h)</h3>
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400">Last 24 hours</div>
      </div>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
            <XAxis dataKey="date" className="text-xs text-gray-600 dark:text-gray-400" />
            <YAxis tickFormatter={formatVolume} className="text-xs text-gray-600 dark:text-gray-400" />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="volume" fill="#10B981" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-4 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="text-center">
          <div className="text-sm text-gray-600 dark:text-gray-400">Total Volume</div>
          <div className="text-lg font-semibold text-green-600 dark:text-green-400">
            ${totalVolume.toLocaleString()}
          </div>
        </div>
        <div className="text-center">
          <div className="text-sm text-gray-600 dark:text-gray-400">Total Swaps</div>
          <div className="text-lg font-semibold text-blue-600 dark:text-blue-400">{totalSwaps}</div>
        </div>
        <div className="text-center">
          <div className="text-sm text-gray-600 dark:text-gray-400">Fees Generated</div>
          <div className="text-lg font-semibold text-purple-600 dark:text-purple-400">${totalFees.toFixed(2)}</div>
        </div>
      </div>

      {/* Performance indicators */}
      <div className="grid grid-cols-2 gap-4 mt-4">
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Avg. Swap Size</div>
          <div className="text-lg font-semibold text-gray-900 dark:text-white">
            {totalSwaps ? `$${(totalVolume / totalSwaps).toFixed(0)}` : "$0"}
          </div>
        </div>
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Fee Rate</div>
          <div className="text-lg font-semibold text-gray-900 dark:text-white">
            {totalVolume ? `${((totalFees / totalVolume) * 100).toFixed(2)}%` : "0.00%"}
          </div>
        </div>
      </div>
    </div>
  );
}
