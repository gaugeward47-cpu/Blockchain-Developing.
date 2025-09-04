"use client";

import { Info } from "lucide-react";
import { useId, useState } from "react";
import { formatEther } from "viem";
import { useAccount, useReadContract } from "wagmi";
import { CONTRACT_ADDRESSES, ERC20_ABI } from "@/constants/contracts";
import { useDEX } from "@/hooks/useDEX";

export function RemoveLiquidity() {
  const [percentage, setPercentage] = useState("25");
  const [customAmount, setCustomAmount] = useState("");
  const [usePercentage, setUsePercentage] = useState(true);
  const customAmountId = useId();

  const { address } = useAccount();
  const dex = useDEX();

  // Get LP token balance
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

  const calculateRemovalAmounts = () => {
    if (!dex.reserves || !lpBalance || !totalSupply) {
      return { amountA: "0", amountB: "0", lpTokens: "0" };
    }

    const lpToRemove = usePercentage
      ? (parseFloat(lpTokenBalance) * parseFloat(percentage)) / 100
      : parseFloat(customAmount || "0");

    if (lpToRemove <= 0) {
      return { amountA: "0", amountB: "0", lpTokens: "0" };
    }

    const shareOfPool = lpToRemove / parseFloat(totalLpSupply);
    const reserveA = parseFloat(dex.reserves.reserveA);
    const reserveB = parseFloat(dex.reserves.reserveB);

    return {
      amountA: (reserveA * shareOfPool).toFixed(6),
      amountB: (reserveB * shareOfPool).toFixed(6),
      lpTokens: lpToRemove.toFixed(6),
    };
  };

  const { amountA, amountB, lpTokens } = calculateRemovalAmounts();

  const handleRemoveLiquidity = async () => {
    if (!lpTokens || parseFloat(lpTokens) <= 0) return;

    try {
      console.log(`Removing ${lpTokens} LP tokens`);
      await dex.removeLiquidity(lpTokens);

      // Reset form on success
      if (dex.isConfirmed) {
        setPercentage("25");
        setCustomAmount("");
      }
    } catch (error) {
      console.error("Remove liquidity failed:", error);
    }
  };

  const percentageOptions = ["25", "50", "75", "100"];

  return (
    <div className="space-y-6">
      {/* LP Token Balance Display */}
      <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
        <div className="text-center space-y-2">
          <div className="text-sm text-gray-600 dark:text-gray-400">Your LP Tokens</div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {parseFloat(lpTokenBalance).toFixed(4)}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {totalLpSupply !== "0"
              ? `${((parseFloat(lpTokenBalance) / parseFloat(totalLpSupply)) * 100).toFixed(2)}% of pool`
              : "0% of pool"}
          </div>
        </div>
      </div>

      {/* Removal Amount Selection */}
      <div className="space-y-4">
        <div className="flex items-center space-x-4">
          <label className="flex items-center space-x-2">
            <input
              type="radio"
              checked={usePercentage}
              onChange={() => setUsePercentage(true)}
              className="text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">By Percentage</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="radio"
              checked={!usePercentage}
              onChange={() => setUsePercentage(false)}
              className="text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">Custom Amount</span>
          </label>
        </div>

        {usePercentage ? (
          <div className="space-y-3">
            <div className="grid grid-cols-4 gap-2">
              {percentageOptions.map((pct) => (
                <button
                  key={pct}
                  type="button"
                  onClick={() => setPercentage(pct)}
                  className={`py-2 px-4 rounded-lg font-medium transition-colors ${
                    percentage === pct
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-500"
                  }`}
                >
                  {pct}%
                </button>
              ))}
            </div>
            <div className="relative">
              <input
                type="range"
                min="0"
                max="100"
                value={percentage}
                onChange={(e) => setPercentage(e.target.value)}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
              />
              <div className="text-center mt-2 text-lg font-semibold text-gray-900 dark:text-white">{percentage}%</div>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <label htmlFor={customAmountId} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              LP Tokens to Remove
            </label>
            <input
              id={customAmountId}
              type="number"
              value={customAmount}
              onChange={(e) => setCustomAmount(e.target.value)}
              placeholder="0.0"
              max={lpTokenBalance}
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Max: {parseFloat(lpTokenBalance).toFixed(4)} LP tokens
            </div>
          </div>
        )}
      </div>

      {/* Preview of tokens to receive */}
      {(parseFloat(amountA) > 0 || parseFloat(amountB) > 0) && (
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 space-y-3">
          <div className="flex items-center space-x-2">
            <Info className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-600 dark:text-blue-400">You will receive</span>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                  <span className="text-xs font-bold text-white">TK</span>
                </div>
                <span className="font-medium text-gray-900 dark:text-white">TKA</span>
              </div>
              <span className="text-lg font-semibold text-gray-900 dark:text-white">
                {parseFloat(amountA).toFixed(4)}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center">
                  <span className="text-xs font-bold text-white">TK</span>
                </div>
                <span className="font-medium text-gray-900 dark:text-white">TKB</span>
              </div>
              <span className="text-lg font-semibold text-gray-900 dark:text-white">
                {parseFloat(amountB).toFixed(4)}
              </span>
            </div>

            <div className="pt-2 border-t border-blue-200 dark:border-blue-700">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">LP Tokens to burn:</span>
                <span className="text-gray-900 dark:text-white font-medium">{parseFloat(lpTokens).toFixed(4)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={handleRemoveLiquidity}
        disabled={
          !lpTokens ||
          parseFloat(lpTokens) <= 0 ||
          parseFloat(lpTokens) > parseFloat(lpTokenBalance) ||
          dex.isPending ||
          dex.isConfirming
        }
        className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-4 px-6 rounded-xl font-semibold text-lg transition-colors"
      >
        {dex.isPending ? "Confirming..." : dex.isConfirming ? "Removing Liquidity..." : "Remove Liquidity"}
      </button>

      {dex.error && <div className="text-red-500 text-sm text-center">Error: {dex.error.message}</div>}

      {parseFloat(lpTokenBalance) === 0 && (
        <div className="text-center text-gray-500 dark:text-gray-400 text-sm">
          You don't have any liquidity positions to remove
        </div>
      )}
    </div>
  );
}
