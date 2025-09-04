"use client";

import { Info, Plus } from "lucide-react";
import { useEffect, useId, useState } from "react";
import { CONTRACT_ADDRESSES } from "@/constants/contracts";
import { useDEX } from "@/hooks/useDEX";
import { useToken } from "@/hooks/useToken";
import { TokenInput } from "../swap/TokenInput";

export function AddLiquidity() {
  const [amountA, setAmountA] = useState("");
  const [amountB, setAmountB] = useState("");
  const [isBalanced, setIsBalanced] = useState(true);
  const [lastEditedField, setLastEditedField] = useState<"A" | "B" | null>(null);
  const balancedCheckboxId = useId();

  const dex = useDEX();
  const tokenA = useToken(CONTRACT_ADDRESSES.TOKEN_A, CONTRACT_ADDRESSES.DEX);
  const tokenB = useToken(CONTRACT_ADDRESSES.TOKEN_B, CONTRACT_ADDRESSES.DEX);

  // Calculate proportional amounts based on pool ratio
  useEffect(() => {
    if (!dex.reserves || !isBalanced || !lastEditedField) return;

    const reserveA = parseFloat(dex.reserves.reserveA);
    const reserveB = parseFloat(dex.reserves.reserveB);

    // Skip if pool is empty
    if (reserveA === 0 || reserveB === 0) return;

    if (lastEditedField === "A" && amountA) {
      const ratio = reserveB / reserveA;
      const calculatedB = (parseFloat(amountA) * ratio).toFixed(2);
      if (calculatedB !== amountB) {
        setAmountB(calculatedB);
      }
    } else if (lastEditedField === "B" && amountB) {
      const ratio = reserveA / reserveB;
      const calculatedA = (parseFloat(amountB) * ratio).toFixed(2);
      if (calculatedA !== amountA) {
        setAmountA(calculatedA);
      }
    }
  }, [amountA, amountB, dex.reserves, isBalanced, lastEditedField]);

  const handleAmountAChange = (value: string) => {
    setAmountA(value);
    setLastEditedField("A");
  };

  const handleAmountBChange = (value: string) => {
    setAmountB(value);
    setLastEditedField("B");
  };

  const handleAddLiquidity = async () => {
    if (!amountA || !amountB) return;

    try {
      // Check if approvals are needed
      const needsApprovalA = parseFloat(tokenA.allowance) < parseFloat(amountA);
      const needsApprovalB = parseFloat(tokenB.allowance) < parseFloat(amountB);

      if (needsApprovalA) {
        console.log("Approving Token A...");
        await tokenA.approve(CONTRACT_ADDRESSES.DEX, amountA);
        return;
      }

      if (needsApprovalB) {
        console.log("Approving Token B...");
        await tokenB.approve(CONTRACT_ADDRESSES.DEX, amountB);
        return;
      }

      // Add liquidity
      console.log(`Adding liquidity: ${amountA} TKA, ${amountB} TKB`);
      await dex.addLiquidity(amountA, amountB);

      // Reset form on success
      if (dex.isConfirmed) {
        setAmountA("");
        setAmountB("");
        setLastEditedField(null);
      }
    } catch (error) {
      console.error("Add liquidity failed:", error);
    }
  };

  const calculateShareOfPool = () => {
    if (!dex.reserves || !amountA || !amountB) return "0";

    const reserveA = parseFloat(dex.reserves.reserveA);
    const reserveB = parseFloat(dex.reserves.reserveB);
    const inputA = parseFloat(amountA);
    const inputB = parseFloat(amountB);

    if (reserveA === 0 && reserveB === 0) return "100"; // First liquidity

    const shareA = (inputA / (reserveA + inputA)) * 100;
    const shareB = (inputB / (reserveB + inputB)) * 100;

    return Math.min(shareA, shareB).toFixed(2);
  };

  const getApprovalStatus = () => {
    const needsApprovalA = parseFloat(tokenA.allowance) < parseFloat(amountA || "0");
    const needsApprovalB = parseFloat(tokenB.allowance) < parseFloat(amountB || "0");

    if (needsApprovalA && needsApprovalB) return "Both tokens need approval";
    if (needsApprovalA) return "Token A needs approval";
    if (needsApprovalB) return "Token B needs approval";
    return "Ready to add liquidity";
  };

  const isReadyToAdd =
    amountA &&
    amountB &&
    parseFloat(tokenA.allowance) >= parseFloat(amountA) &&
    parseFloat(tokenB.allowance) >= parseFloat(amountB);

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <TokenInput
          label="Token A Amount"
          value={amountA}
          onChange={handleAmountAChange}
          token="TKA"
          balance={tokenA.balance}
          address={CONTRACT_ADDRESSES.TOKEN_A}
        />

        <div className="flex justify-center">
          <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
            <Plus className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          </div>
        </div>

        <TokenInput
          label="Token B Amount"
          value={amountB}
          onChange={handleAmountBChange}
          token="TKB"
          balance={tokenB.balance}
          address={CONTRACT_ADDRESSES.TOKEN_B}
        />
      </div>

      {/* Pool Information */}
      {dex.reserves && (
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 space-y-3">
          <div className="flex items-center space-x-2">
            <Info className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-600 dark:text-blue-400">Pool Information</span>
          </div>

          <div className="text-sm space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Current Ratio:</span>
              <span className="text-gray-900 dark:text-white">
                1 TKA ={" "}
                {dex.reserves.reserveA !== "0"
                  ? (parseFloat(dex.reserves.reserveB) / parseFloat(dex.reserves.reserveA)).toFixed(4)
                  : "0"}{" "}
                TKB
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Your Share:</span>
              <span className="text-gray-900 dark:text-white">{calculateShareOfPool()}%</span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Status:</span>
              <span
                className={`${
                  isReadyToAdd ? "text-green-600 dark:text-green-400" : "text-orange-600 dark:text-orange-400"
                }`}
              >
                {getApprovalStatus()}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Toggle for balanced/unbalanced liquidity */}
      <div className="flex items-center space-x-3">
        <input
          type="checkbox"
          id={balancedCheckboxId}
          checked={isBalanced}
          onChange={(e) => setIsBalanced(e.target.checked)}
          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
        <label htmlFor={balancedCheckboxId} className="text-sm text-gray-700 dark:text-gray-300">
          Maintain pool ratio automatically
        </label>
      </div>

      <button
        type="button"
        onClick={handleAddLiquidity}
        disabled={!amountA || !amountB || dex.isPending || dex.isConfirming}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-4 px-6 rounded-xl font-semibold text-lg transition-colors"
      >
        {dex.isPending
          ? "Confirming..."
          : dex.isConfirming
            ? "Adding Liquidity..."
            : !isReadyToAdd && (amountA || amountB)
              ? "Approve Tokens"
              : "Add Liquidity"}
      </button>

      {dex.error && <div className="text-red-500 text-sm text-center">Error: {dex.error.message}</div>}
    </div>
  );
}
