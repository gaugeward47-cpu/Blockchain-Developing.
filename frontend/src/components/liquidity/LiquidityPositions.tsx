"use client";

import { DollarSign, Droplets, Percent, TrendingUp } from "lucide-react";
import { formatEther } from "viem";
import { useAccount, useReadContract } from "wagmi";
import { CONTRACT_ADDRESSES, ERC20_ABI } from "@/constants/contracts";
import { useDEX } from "@/hooks/useDEX";

export function LiquidityPositions() {
  const { address } = useAccount();
  const dex = useDEX();

  const { data: lpBalance } = useReadContract({
    address: CONTRACT_ADDRESSES.LP_TOKEN,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  const { data: totalSupply } = useReadContract({
    address: CONTRACT_ADDRESSES.LP_TOKEN,
    abi: ERC20_ABI,
    functionName: "totalSupply",
  });

  const lpTokenBalance = lpBalance ? formatEther(BigInt(lpBalance.toString() || "0")) : "0";
  const totalLpSupply = totalSupply ? formatEther(BigInt(totalSupply.toString() || "0")) : "0";

  const calculatePosition = () => {
    if (!dex.reserves || !lpBalance || !totalSupply || parseFloat(totalLpSupply) === 0) {
      return {
        shareOfPool: "0",
        tokenAAmount: "0",
        tokenBAmount: "0",
        totalValue: "0",
      };
    }

    const shareOfPool = (parseFloat(lpTokenBalance) / parseFloat(totalLpSupply)) * 100;
    const reserveA = parseFloat(dex.reserves.reserveA);
    const reserveB = parseFloat(dex.reserves.reserveB);

    const tokenAAmount = (reserveA * shareOfPool) / 100;
    const tokenBAmount = (reserveB * shareOfPool) / 100;

    const totalValue = tokenAAmount + tokenBAmount;

    return {
      shareOfPool: shareOfPool.toFixed(4),
      tokenAAmount: tokenAAmount.toFixed(6),
      tokenBAmount: tokenBAmount.toFixed(6),
      totalValue: totalValue.toFixed(2),
    };
  };

  const calculateAPR = () => {
    if (!dex.reserves) return "0";

    const reserveA = parseFloat(dex.reserves.reserveA);
    const reserveB = parseFloat(dex.reserves.reserveB);
    const totalLiquidity = reserveA + reserveB;

    // Higher liquidity = lower APR (more competition for fees)
    const baseAPR = Math.max(5, 50 - totalLiquidity / 1000);
    return baseAPR.toFixed(2);
  };

  const position = calculatePosition();
  const apr = calculateAPR();
  const hasPosition = parseFloat(lpTokenBalance) > 0;

  return (
    <div className="space-y-6">
      {/* Position Overview */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Droplets className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Your Position</h3>
        </div>

        {hasPosition ? (
          <div className="space-y-4">
            {/* Total Value */}
            <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Position Value</div>
              <div className="text-3xl font-bold text-gray-900 dark:text-white">${position.totalValue}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">{position.shareOfPool}% of pool</div>
            </div>

            {/* Token Breakdown */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 text-center">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <div className="w-4 h-4 rounded-full bg-gradient-to-br from-blue-400 to-purple-500"></div>
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">TKA</span>
                </div>
                <div className="text-lg font-semibold text-gray-900 dark:text-white">
                  {parseFloat(position.tokenAAmount).toFixed(4)}
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 text-center">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <div className="w-4 h-4 rounded-full bg-gradient-to-br from-purple-400 to-pink-500"></div>
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">TKB</span>
                </div>
                <div className="text-lg font-semibold text-gray-900 dark:text-white">
                  {parseFloat(position.tokenBAmount).toFixed(4)}
                </div>
              </div>
            </div>

            {/* LP Token Info */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">LP Tokens Owned</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {parseFloat(lpTokenBalance).toFixed(4)}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <Droplets className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <div className="text-gray-500 dark:text-gray-400 mb-2">No liquidity positions</div>
            <div className="text-sm text-gray-400 dark:text-gray-500">Add liquidity to start earning fees</div>
          </div>
        )}
      </div>

      {/* Earnings & Stats */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Pool Statistics</h3>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Percent className="h-4 w-4 text-green-500" />
              <span className="text-sm text-gray-600 dark:text-gray-400">Current APR</span>
            </div>
            <span className="font-semibold text-green-600 dark:text-green-400">{apr}%</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-4 w-4 text-blue-500" />
              <span className="text-sm text-gray-600 dark:text-gray-400">Total Pool Liquidity</span>
            </div>
            <span className="font-semibold text-gray-900 dark:text-white">
              $
              {dex.reserves
                ? (parseFloat(dex.reserves.reserveA) + parseFloat(dex.reserves.reserveB)).toFixed(2)
                : "0.00"}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-purple-500" />
              <span className="text-sm text-gray-600 dark:text-gray-400">24h Volume</span>
            </div>
            <span className="font-semibold text-gray-900 dark:text-white">
              ${(parseFloat(position.totalValue) * 0.003).toFixed(4)} {/* 0.3% fee */}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Droplets className="h-4 w-4 text-indigo-500" />
              <span className="text-sm text-gray-600 dark:text-gray-400">Total LP Tokens</span>
            </div>
            <span className="font-semibold text-gray-900 dark:text-white">{parseFloat(totalLpSupply).toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Fee Earnings</h3>

        {hasPosition ? (
          <div className="space-y-4">
            <div className="text-center p-4 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-xl">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Unclaimed Fees</div>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                ${(parseFloat(position.totalValue) * 0.003).toFixed(4)} {/* 0.3% fee */}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Earned from trading fees</div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">24h Fees:</span>
                  <span className="text-gray-900 dark:text-white">
                    ${(parseFloat(position.totalValue) * 0.001).toFixed(4)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">7d Fees:</span>
                  <span className="text-gray-900 dark:text-white">
                    ${(parseFloat(position.totalValue) * 0.007).toFixed(4)}
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">30d Fees:</span>
                  <span className="text-gray-900 dark:text-white">
                    ${(parseFloat(position.totalValue) * 0.03).toFixed(4)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">All Time:</span>
                  <span className="text-gray-900 dark:text-white">
                    ${(parseFloat(position.totalValue) * 0.15).toFixed(4)}
                  </span>
                </div>
              </div>
            </div>

            {/* Claim Button */}
            <button
              type="button"
              className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-xl font-semibold transition-colors"
            >
              Claim Fees
            </button>
          </div>
        ) : (
          <div className="text-center py-6 text-gray-500 dark:text-gray-400">
            <DollarSign className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <div className="text-sm">No fees to claim</div>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      {hasPosition && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h3>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-xl font-medium transition-colors"
            >
              Add More
            </button>
            <button
              type="button"
              className="bg-red-600 hover:bg-red-700 text-white py-3 px-4 rounded-xl font-medium transition-colors"
            >
              Remove All
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
