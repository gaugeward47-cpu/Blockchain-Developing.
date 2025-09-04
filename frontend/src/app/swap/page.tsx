"use client";

import { Header } from "@/components/layout/Header";
import { SwapCard } from "@/components/swap/SwapCard";
import { SwapStats } from "@/components/swap/SwapStats";

export default function SwapPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <SwapCard />
          </div>
          <div>
            <SwapStats />
          </div>
        </div>
      </main>
    </div>
  );
}
