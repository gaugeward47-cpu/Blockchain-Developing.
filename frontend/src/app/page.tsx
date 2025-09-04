import { ArrowRight, Shield, TrendingUp, Zap } from "lucide-react";
import Link from "next/link";
import { Header } from "@/components/layout/Header";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <Header />

      <main className="container mx-auto px-4 py-16">
        <div className="text-center space-y-8">
          <h1 className="text-6xl font-bold text-gray-900 dark:text-white">
            Trade with
            <span className="text-blue-400"> Zero Slippage</span>
          </h1>

          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Experience the next generation of decentralized trading with our automated market maker protocol.
          </p>

          <div className="flex gap-4 justify-center">
            <Link
              href="/swap"
              className="bg-blue-400 hover:bg-blue-500 text-white px-8 py-4 rounded-lg font-semibold flex items-center gap-2 transition-colors"
            >
              Start Trading <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              href="/liquidity"
              className="border border-blue-300 text-blue-400 hover:bg-blue-50 hover:border-blue-50 px-8 py-4 rounded-lg font-semibold transition-colors"
            >
              Add Liquidity
            </Link>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mt-24">
          <FeatureCard
            icon={<Zap className="h-12 w-12 text-yellow-600" />}
            title="Lightning Fast"
            description="Execute trades instantly with our optimized smart contracts"
          />
          <FeatureCard
            icon={<Shield className="h-12 w-12 text-green-600" />}
            title="Secure & Audited"
            description="Battle-tested contracts with comprehensive security measures"
          />
          <FeatureCard
            icon={<TrendingUp className="h-12 w-12 text-purple-600" />}
            title="Earn Rewards"
            description="Provide liquidity and earn trading fees from every swap"
          />
        </div>
      </main>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg text-center">
      <div className="flex justify-center mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">{title}</h3>
      <p className="text-gray-600 dark:text-gray-300">{description}</p>
    </div>
  );
}
