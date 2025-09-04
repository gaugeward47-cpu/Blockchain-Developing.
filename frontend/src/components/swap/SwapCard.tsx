"use client";

import { ArrowDown, ArrowUp, Settings } from "lucide-react";
import { useState } from "react";
import { formatEther, parseEther } from "viem";
import { useReadContract } from "wagmi";
import { CONTRACT_ADDRESSES, DEX_ABI } from "@/constants/contracts";
import { useDEX } from "@/hooks/useDEX";
import { useToken } from "@/hooks/useToken";
import { TokenInput } from "./TokenInput";

export function SwapCard() {
  const [amountIn, setAmountIn] = useState("");
  const [tokenA, setTokenA] = useState(true); // true = A->B, false = B->A

  const dex = useDEX();
  const tokenInAddress = tokenA ? CONTRACT_ADDRESSES.TOKEN_A : CONTRACT_ADDRESSES.TOKEN_B;
  const tokenOutAddress = tokenA ? CONTRACT_ADDRESSES.TOKEN_B : CONTRACT_ADDRESSES.TOKEN_A;

  // Define isAForB based on tokenA state
  const isAForB = tokenA;

  const { data: amountOut } = useReadContract({
    address: CONTRACT_ADDRESSES.DEX,
    abi: DEX_ABI,
    functionName: "getAmountOut",
    args: [parseEther(amountIn || "0"), isAForB],
    query: {
      enabled: !!amountIn && amountIn !== "0",
    },
  });

  const tokenIn = useToken(tokenInAddress, CONTRACT_ADDRESSES.DEX);
  const tokenOut = useToken(tokenOutAddress, CONTRACT_ADDRESSES.DEX);

  const handleSwap = async () => {
    if (!amountIn || !amountOut) return;

    try {
      // First check if approval is needed
      const needsApproval = parseFloat(tokenIn.allowance) < parseFloat(amountIn);

      if (needsApproval) {
        console.log("Approving tokens...");
        await tokenIn.approve(CONTRACT_ADDRESSES.DEX, amountIn);
        // Note: In a real app, you'd want to wait for the approval transaction
        // to be confirmed before allowing the swap
        return;
      }

      // Execute swap
      console.log(`Swapping ${amountIn} tokens...`);
      if (tokenA) {
        await dex.swapAForB(amountIn);
      } else {
        await dex.swapBForA(amountIn);
      }
    } catch (error) {
      console.error("Swap failed:", error);
    }
  };

  const switchTokens = () => {
    setTokenA(!tokenA);
    setAmountIn("");
  };

  // Calculate slippage (you can make this configurable later)
  const slippage = "0.5";

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Swap</h2>
        <button type="button" className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
          <Settings className="h-5 w-5 text-gray-500" />
        </button>
      </div>

      <div className="space-y-4">
        <TokenInput
          label="From"
          value={amountIn}
          onChange={setAmountIn}
          token={tokenA ? "TKA" : "TKB"}
          balance={tokenIn.balance}
          address={tokenInAddress}
        />

        <div className="flex justify-center">
          <button
            type="button"
            onClick={switchTokens}
            className="flex p-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
          >
            <ArrowUp className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            <ArrowDown className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        <TokenInput
          label="To"
          value={amountOut ? formatEther(BigInt(amountOut.toString() || "0")) : "0"}
          onChange={() => {
            console.log("Read only");
          }}
          token={tokenA ? "TKB" : "TKA"}
          balance={tokenOut.balance}
          address={tokenOutAddress}
          readOnly
        />

        {dex.reserves && (
          <div className="text-sm text-gray-500 dark:text-gray-400 space-y-1">
            <div className="flex justify-between">
              <span>Price:</span>
              <span>
                1 {tokenA ? "TKA" : "TKB"} ={" "}
                {tokenA
                  ? (parseFloat(dex.reserves.reserveB) / parseFloat(dex.reserves.reserveA)).toFixed(4)
                  : (parseFloat(dex.reserves.reserveA) / parseFloat(dex.reserves.reserveB)).toFixed(4)}{" "}
                {tokenA ? "TKB" : "TKA"}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Slippage:</span>
              <span>{slippage}%</span>
            </div>
            {parseFloat(tokenIn.allowance) < parseFloat(amountIn || "0") && (
              <div className="flex justify-between text-orange-500">
                <span>Status:</span>
                <span>Approval needed</span>
              </div>
            )}
          </div>
        )}

        <button
          type="button"
          onClick={handleSwap}
          disabled={!amountIn || !amountOut || dex.isPending || dex.isConfirming}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-4 px-6 rounded-xl font-semibold text-lg transition-colors"
        >
          {dex.isPending
            ? "Confirming..."
            : dex.isConfirming
              ? "Swapping..."
              : parseFloat(tokenIn.allowance) < parseFloat(amountIn || "0") && amountIn
                ? "Approve Tokens"
                : "Swap"}
        </button>

        {dex.error && <div className="text-red-500 text-sm text-center">Error: {dex.error.message}</div>}
      </div>
    </div>
  );
}
