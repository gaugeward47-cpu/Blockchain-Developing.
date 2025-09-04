"use client";

import { formatEther, parseEther } from "viem";
import { useReadContract, useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { CONTRACT_ADDRESSES, DEX_ABI } from "@/constants/contracts";

export function useDEX() {
  const { writeContract, data: hash, error, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

  // Read contract data
  const { data: reserves, refetch: refetchReserves } = useReadContract({
    address: CONTRACT_ADDRESSES.DEX,
    abi: DEX_ABI,
    functionName: "getReserves",
  });

  const addLiquidity = async (amountA: string, amountB: string) => {
    return writeContract({
      address: CONTRACT_ADDRESSES.DEX,
      abi: DEX_ABI,
      functionName: "addLiquidity",
      args: [parseEther(amountA), parseEther(amountB)],
    });
  };

  const removeLiquidity = async (lpTokens: string) => {
    return writeContract({
      address: CONTRACT_ADDRESSES.DEX,
      abi: DEX_ABI,
      functionName: "removeLiquidity",
      args: [parseEther(lpTokens)],
    });
  };

  const swapAForB = async (amountIn: string) => {
    return writeContract({
      address: CONTRACT_ADDRESSES.DEX,
      abi: DEX_ABI,
      functionName: "swapAForB",
      args: [parseEther(amountIn)],
    });
  };

  const swapBForA = async (amountIn: string) => {
    return writeContract({
      address: CONTRACT_ADDRESSES.DEX,
      abi: DEX_ABI,
      functionName: "swapBForA",
      args: [parseEther(amountIn)],
    });
  };

  // Helper function to get amount out (call this from components, not as a hook)
  const calculateAmountOut = async (amountIn: string, isAForB: boolean) => {
    throw new Error("Use useReadContract directly in your component for getAmountOut");
  };

  return {
    // Write functions
    addLiquidity,
    removeLiquidity,
    swapAForB,
    swapBForA,
    calculateAmountOut,

    // Transaction states
    hash,
    isPending,
    isConfirming,
    isConfirmed,
    error,

    // Data
    reserves:
      reserves && Array.isArray(reserves) && reserves.length === 2
        ? {
            reserveA: formatEther(reserves[0]),
            reserveB: formatEther(reserves[1]),
          }
        : null,
    refetchReserves,
  };
}

/*
// Usage in component
const { data: amountOut } = useReadContract({
  address: CONTRACT_ADDRESSES.DEX,
  abi: DEX_ABI,
  functionName: "getAmountOut",
  args: [parseEther(amountIn || "0"), isAForB],
  query: {
    enabled: !!amountIn && amountIn !== "0",
  },
});
*/
