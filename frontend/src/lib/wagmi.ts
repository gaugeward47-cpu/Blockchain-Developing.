import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { hardhat, localhost, sepolia } from "wagmi/chains";

export const config = getDefaultConfig({
  appName: "DEX One",
  projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || "fallback-project-id",
  chains: [sepolia, localhost, hardhat],
  ssr: true,
});
