"use client";

import { type Address, formatEther, parseEther } from "viem";
import { useAccount, useReadContract, useWriteContract } from "wagmi";
import { ERC20_ABI } from "@/constants/contracts";

export function useToken(tokenAddress: Address, spender?: Address) {
  const { address: userAddress } = useAccount();
  const { writeContract } = useWriteContract();

  // Read token balance
  const {
    data: balance,
    refetch: refetchBalance,
    error: balanceError,
  } = useReadContract({
    address: tokenAddress,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: userAddress ? [userAddress] : undefined,
    query: {
      enabled: !!userAddress,
    },
  });

  // Read token info
  const { data: name, error: nameError } = useReadContract({
    address: tokenAddress,
    abi: ERC20_ABI,
    functionName: "name",
  });

  const { data: symbol, error: symbolError } = useReadContract({
    address: tokenAddress,
    abi: ERC20_ABI,
    functionName: "symbol",
  });

  const { data: decimals, error: decimalsError } = useReadContract({
    address: tokenAddress,
    abi: ERC20_ABI,
    functionName: "decimals",
  });

  // Check allowance
  const { data: allowance, error: allowanceError } = useReadContract({
    address: tokenAddress,
    abi: ERC20_ABI,
    functionName: "allowance",
    args: userAddress && spender ? [userAddress, spender] : undefined,
    query: {
      enabled: !!userAddress && !!spender,
    },
  });

  // Debug logging
  console.log(`Token ${tokenAddress} debug:`, {
    balance: balance?.toString(),
    balanceError: balanceError?.message,
    name,
    nameError: nameError?.message,
    symbol,
    symbolError: symbolError?.message,
    decimals: decimals?.toString(),
    decimalsError: decimalsError?.message,
    userAddress,
  });

  const approve = async (approveSpender: Address, amount: string) => {
    // Use decimals from contract, fallback to 18
    const tokenDecimals = decimals || 18;
    const parsedAmount =
      tokenDecimals === 18 ? parseEther(amount) : BigInt(amount) * BigInt(10 ** Number(tokenDecimals));

    return writeContract({
      address: tokenAddress,
      abi: ERC20_ABI,
      functionName: "approve",
      args: [approveSpender, parsedAmount],
    });
  };

  return {
    // Token info
    name,
    symbol,
    decimals,

    // User data - format using actual decimals
    balance:
      balance && typeof balance === "bigint"
        ? formatEther(balance) // Most tokens use 18 decimals, formatEther handles this
        : "0",

    allowance:
      allowance && typeof allowance === "bigint"
        ? decimals
          ? (Number(allowance) / Math.pow(10, Number(decimals))).toString()
          : formatEther(allowance)
        : "0",

    // Actions
    approve,
    refetchBalance,

    // Error states for debugging
    errors: {
      balance: balanceError,
      name: nameError,
      symbol: symbolError,
      decimals: decimalsError,
      allowance: allowanceError,
    },
  };
}
