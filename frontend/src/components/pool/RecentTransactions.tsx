"use client";

import { ArrowUpDown, Clock, ExternalLink } from "lucide-react";
import { useSubgraphData } from "@/hooks/useSubgraph";

interface Transaction {
  id: string;
  type: "swap" | "add_liquidity" | "remove_liquidity";
  user: string;
  timestamp: number;
  transactionHash: string;
  tokenIn?: string;
  tokenOut?: string;
  tokenA?: string;
  tokenB?: string;
  amountIn?: string;
  amountOut?: string;
  amountA?: string;
  amountB?: string;
  fee?: string;
}

const getTransactionIcon = (type: Transaction["type"]) => {
  switch (type) {
    case "swap":
      return <ArrowUpDown className="h-4 w-4 text-blue-600" />;
    case "add_liquidity":
      return <ArrowUpDown className="h-4 w-4 text-green-600" />; // TODO: replace with Plus
    case "remove_liquidity":
      return <ArrowUpDown className="h-4 w-4 text-red-600" />; // TODO: replace with Minus
    default:
      return <ArrowUpDown className="h-4 w-4 text-gray-600" />;
  }
};

const getTransactionTitle = (tx: Transaction) => {
  switch (tx.type) {
    case "swap":
      return `Swap ${tx.tokenIn} → ${tx.tokenOut}`;
    case "add_liquidity":
      return "Add Liquidity";
    case "remove_liquidity":
      return "Remove Liquidity";
    default:
      return "Unknown Transaction";
  }
};

const getTransactionDetails = (tx: Transaction) => {
  switch (tx.type) {
    case "swap":
      return `${parseFloat(tx.amountIn ?? "0").toFixed(2)} ${tx.tokenIn} → ${parseFloat(tx.amountOut ?? "0").toFixed(2)} ${tx.tokenOut}`;
    case "add_liquidity":
      return `${parseFloat(tx.amountA ?? "0").toFixed(2)} ${tx.tokenA} + ${parseFloat(tx.amountB ?? "0").toFixed(2)} ${tx.tokenB}`;
    case "remove_liquidity":
      return `${parseFloat(tx.amountA ?? "0").toFixed(2)} ${tx.tokenA} + ${parseFloat(tx.amountB ?? "0").toFixed(2)} ${tx.tokenB}`;
    default:
      return "Unknown details";
  }
};

const getTypeColor = (type: Transaction["type"]) => {
  switch (type) {
    case "swap":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
    case "add_liquidity":
      return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
    case "remove_liquidity":
      return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400";
  }
};

const formatTypeLabel = (type: Transaction["type"]) => {
  switch (type) {
    case "add_liquidity":
      return "Add";
    case "remove_liquidity":
      return "Remove";
    default:
      return type.charAt(0).toUpperCase() + type.slice(1);
  }
};

export function RecentTransactions() {
  const { recentTransactions } = useSubgraphData();

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Clock className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Transactions</h3>
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400">Last 100 transactions</div>
      </div>

      <div className="space-y-4">
        {recentTransactions.map((tx) => (
          <div
            key={tx.id}
            className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
          >
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                <div className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm">{getTransactionIcon(tx.type)}</div>
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white">{getTransactionTitle(tx)}</h4>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(tx.type)}`}>
                    {formatTypeLabel(tx.type)}
                  </span>
                </div>

                <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                  <span>{getTransactionDetails(tx)}</span>
                  {tx.fee && parseFloat(tx.fee) > 0 && (
                    <span className="text-green-600 dark:text-green-400">Fee: ${tx.fee}</span>
                  )}
                </div>

                <div className="flex items-center space-x-2 mt-1 text-xs text-gray-500 dark:text-gray-400">
                  <span>by {tx.user}</span>
                  <span>•</span>
                  <span>{new Date(tx.timestamp * 1000).toLocaleTimeString()}</span>
                </div>
              </div>
            </div>

            <a
              href={`https://sepolia.etherscan.io/tx/${tx.transactionHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              title="View on Sepolia"
            >
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        ))}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{recentTransactions.length}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Swaps</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">0</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Liquidity Added</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-red-600 dark:text-red-400">0</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Liquidity Removed</div>
        </div>
      </div>
    </div>
  );
}
