"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Activity } from "lucide-react";
import Link from "next/link";

export function Header() {
  return (
    <header className="border-b border-gray-200 dark:border-gray-800">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Activity className="h-8 w-8 text-blue-300" />
          <Link href="/" className="text-3xl font-bold">
            <h1>DEX One</h1>
          </Link>
        </div>

        <nav className="hidden md:flex md:text-lg items-center space-x-18">
          <Link
            href="/swap"
            className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors"
          >
            Swap
          </Link>
          <Link
            href="/liquidity"
            className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors"
          >
            Liquidity
          </Link>
          <Link
            href="/pool"
            className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors"
          >
            Pool
          </Link>
        </nav>

        <ConnectButton />
      </div>
    </header>
  );
}
