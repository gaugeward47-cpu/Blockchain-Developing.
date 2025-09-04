"use client";

import type { Address } from "viem";

interface TokenInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  token: string;
  balance: string;
  address: Address;
  readOnly?: boolean;
}

export function TokenInput({ label, value, onChange, token, balance, address, readOnly = false }: TokenInputProps) {
  const handleMaxClick = () => {
    if (!readOnly) {
      onChange(balance);
    }
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-gray-600 dark:text-gray-300">{label}</p>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Balance: {parseFloat(balance).toFixed(4)} {token}
        </div>
      </div>

      <div className="flex items-center space-x-3">
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="0.0"
          readOnly={readOnly}
          className="flex-1 bg-transparent text-2xl font-semibold text-gray-900 dark:text-white placeholder-gray-400 border-none outline-none"
        />
        {!readOnly && (
          <button
            type="button"
            onClick={handleMaxClick}
            className="text-blue-300 hover:text-blue-500 text-sm font-medium"
          >
            MAX
          </button>
        )}

        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-2 bg-white dark:bg-gray-600 rounded-lg px-3 py-2">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
              <span className="text-xs font-bold text-white">{token.slice(0, 2)}</span>
            </div>

            <span className="font-semibold text-gray-900 dark:text-white">{token}</span>
          </div>
        </div>
      </div>

      <div className="text-xs text-gray-400 dark:text-gray-500 truncate">{address}</div>
    </div>
  );
}
