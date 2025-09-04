"use client";

import { Activity, DollarSign, Percent, TrendingDown, TrendingUp, Users } from "lucide-react";
import { useDEX } from "@/hooks/useDEX";
import { useSubgraphData } from "@/hooks/useSubgraph";

export function PoolOverview() {
  const dex = useDEX();
  const {
    totalLiquidityProviders = 0,
    volume24h = "0.00",
    fees24h = "0.00",
    transactions24h = 0,
    apr = "0.00",
  } = useSubgraphData();

  const poolStats = {
    totalLiquidity: dex.reserves
      ? (parseFloat(dex.reserves.reserveA) + parseFloat(dex.reserves.reserveB)).toFixed(2)
      : "0.00",
    volume24h,
    fees24h,
    providers: totalLiquidityProviders.toString(),
    transactions24h: transactions24h.toString(),
    apr,
  };

  // For now we just show 0 % so the UI renders without errors
  const priceChange24h = 0;
  const volumeChange24h = 0;
  const liquidityChange24h = 0;

  return (
    <div className="space-y-6">
      {/* Pool Header */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="flex -space-x-2">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center border-2 border-white dark:border-gray-800">
                <span className="text-sm font-bold text-white">TKA</span>
              </div>
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center border-2 border-white dark:border-gray-800">
                <span className="text-sm font-bold text-white">TKB</span>
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">TKA / TKB Pool</h1>
              <div className="flex items-center space-x-2 mt-1">
                <span className="text-gray-600 dark:text-gray-400">Current Price:</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {dex.reserves && dex.reserves.reserveA !== "0"
                    ? (parseFloat(dex.reserves.reserveB) / parseFloat(dex.reserves.reserveA)).toFixed(4)
                    : "0.0000"}{" "}
                  TKB per TKA
                </span>
                <div
                  className={`flex items-center space-x-1 text-sm ${
                    priceChange24h >= 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {priceChange24h >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                  <span>{Math.abs(priceChange24h).toFixed(2)}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-4">
            <div className="flex items-center space-x-2 mb-1">
              <DollarSign className="h-4 w-4 text-blue-600" />
              <span className="text-sm text-gray-600 dark:text-gray-400">Total Liquidity</span>
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">${poolStats.totalLiquidity}</div>
            <div
              className={`text-sm flex items-center space-x-1 ${
                liquidityChange24h >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              {liquidityChange24h >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              <span>{Math.abs(liquidityChange24h).toFixed(2)}% (24h)</span>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-4">
            <div className="flex items-center space-x-2 mb-1">
              <Activity className="h-4 w-4 text-green-600" />
              <span className="text-sm text-gray-600 dark:text-gray-400">24h Volume</span>
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">${poolStats.volume24h}</div>
            <div
              className={`text-sm flex items-center space-x-1 ${
                volumeChange24h >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              {volumeChange24h >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              <span>{Math.abs(volumeChange24h).toFixed(2)}%</span>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-4">
            <div className="flex items-center space-x-2 mb-1">
              <Percent className="h-4 w-4 text-purple-600" />
              <span className="text-sm text-gray-600 dark:text-gray-400">APR</span>
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{poolStats.apr}%</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">From trading fees</div>
          </div>
        </div>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
              <DollarSign className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400">24h Fees Collected</div>
              <div className="text-xl font-bold text-gray-900 dark:text-white">${poolStats.fees24h}</div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
              <Users className="h-5 w-5 text-indigo-600" />
            </div>
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Liquidity Providers</div>
              <div className="text-xl font-bold text-gray-900 dark:text-white">{poolStats.providers}</div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-cyan-100 dark:bg-cyan-900/30 rounded-lg">
              <Activity className="h-5 w-5 text-cyan-600" />
            </div>
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400">24h Transactions</div>
              <div className="text-xl font-bold text-gray-900 dark:text-white">{poolStats.transactions24h}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
