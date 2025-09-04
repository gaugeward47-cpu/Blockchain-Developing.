"use client";

import { Activity, DollarSign, TrendingDown, TrendingUp } from "lucide-react";
import { CONTRACT_ADDRESSES } from "@/constants/contracts";
import { useDEX } from "@/hooks/useDEX";
import { useToken } from "@/hooks/useToken";

export function SwapStats() {
  const dex = useDEX();
  const tokenA = useToken(CONTRACT_ADDRESSES.TOKEN_A);
  const tokenB = useToken(CONTRACT_ADDRESSES.TOKEN_B);

  const calculateTotalLiquidity = () => {
    if (!dex.reserves) return "0";

    const reserveA = parseFloat(dex.reserves.reserveA);
    const reserveB = parseFloat(dex.reserves.reserveB);

    // Assuming 1:1 price for simplicity, you might want to get actual prices
    return (reserveA + reserveB).toFixed(2);
  };

  const calculatePrice = () => {
    if (!dex.reserves) return { aToB: "0", bToA: "0" };

    const reserveA = parseFloat(dex.reserves.reserveA);
    const reserveB = parseFloat(dex.reserves.reserveB);

    if (reserveA === 0 || reserveB === 0) return { aToB: "0", bToA: "0" };

    return {
      aToB: (reserveB / reserveA).toFixed(4),
      bToA: (reserveA / reserveB).toFixed(4),
    };
  };

  const prices = calculatePrice();
  const totalLiquidity = calculateTotalLiquidity();

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Pool Statistics</h3>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-4 w-4 text-green-500" />
              <span className="text-sm text-gray-600 dark:text-gray-400">Total Liquidity</span>
            </div>
            <span className="font-semibold text-gray-900 dark:text-white">${totalLiquidity}</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Activity className="h-4 w-4 text-blue-500" />
              <span className="text-sm text-gray-600 dark:text-gray-400">TKA Reserve</span>
            </div>
            <span className="font-semibold text-gray-900 dark:text-white">
              {dex.reserves ? parseFloat(dex.reserves.reserveA).toFixed(2) : "0"}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Activity className="h-4 w-4 text-purple-500" />
              <span className="text-sm text-gray-600 dark:text-gray-400">TKB Reserve</span>
            </div>
            <span className="font-semibold text-gray-900 dark:text-white">
              {dex.reserves ? parseFloat(dex.reserves.reserveB).toFixed(2) : "0"}
            </span>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Current Prices</h3>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <span className="text-sm text-gray-600 dark:text-gray-400">TKA → TKB</span>
            </div>
            <span className="font-semibold text-gray-900 dark:text-white">{prices.aToB}</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <TrendingDown className="h-4 w-4 text-red-500" />
              <span className="text-sm text-gray-600 dark:text-gray-400">TKB → TKA</span>
            </div>
            <span className="font-semibold text-gray-900 dark:text-white">{prices.bToA}</span>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Your Balances</h3>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 rounded-full bg-gradient-to-br from-blue-400 to-purple-500"></div>
              <span className="text-sm text-gray-600 dark:text-gray-400">TKA Balance</span>
            </div>
            <span className="font-semibold text-gray-900 dark:text-white">{parseFloat(tokenA.balance).toFixed(4)}</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 rounded-full bg-gradient-to-br from-purple-400 to-pink-500"></div>
              <span className="text-sm text-gray-600 dark:text-gray-400">TKB Balance</span>
            </div>
            <span className="font-semibold text-gray-900 dark:text-white">{parseFloat(tokenB.balance).toFixed(4)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
