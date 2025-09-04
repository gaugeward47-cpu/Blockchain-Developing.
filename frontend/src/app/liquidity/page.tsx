"use client";

import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { AddLiquidity } from "@/components/liquidity/AddLiquidity";
import { LiquidityPositions } from "@/components/liquidity/LiquidityPositions";
import { RemoveLiquidity } from "@/components/liquidity/RemoveLiquidity";

export default function LiquidityPage() {
  const [activeTab, setActiveTab] = useState<"add" | "remove">("add");

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Liquidity Pool</h1>
            <p className="text-gray-600 dark:text-gray-400">Add liquidity to earn fees from trades</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-8">
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl">
                <div className="flex border-b border-gray-200 dark:border-gray-700">
                  <button
                    type="button"
                    onClick={() => setActiveTab("add")}
                    className={`flex-1 py-4 px-6 font-semibold transition-colors ${
                      activeTab === "add"
                        ? "text-blue-600 border-b-2 border-blue-600"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    Add Liquidity
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("remove")}
                    className={`flex-1 py-4 px-6 font-semibold transition-colors ${
                      activeTab === "remove"
                        ? "text-blue-600 border-b-2 border-blue-600"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    Remove Liquidity
                  </button>
                </div>

                <div className="p-6">{activeTab === "add" ? <AddLiquidity /> : <RemoveLiquidity />}</div>
              </div>
            </div>

            <div>
              <LiquidityPositions />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
