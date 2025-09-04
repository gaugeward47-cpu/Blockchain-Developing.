import hre from "hardhat";
import { formatEther, parseEther } from "viem";

async function main() {
  console.log("Starting deployment...");

  // Get public and wallet clients
  const publicClient = await hre.viem.getPublicClient();
  const [deployer] = await hre.viem.getWalletClients();

  console.log("Deploying contracts with account:", deployer.account.address);

  // Check deployer balance
  const balance = await publicClient.getBalance({ address: deployer.account.address });
  console.log("Account balance:", formatEther(balance), "ETH");

  // Deploy TokenA with initial supply of 1 million tokens (18 decimals)
  console.log("\nDeploying TokenA...");
  const tokenA = await hre.viem.deployContract("TokenA", [parseEther("1000000")]);
  console.log("TokenA deployed to:", tokenA.address);

  // Deploy TokenB with initial supply of 1 million tokens (18 decimals)
  console.log("\nDeploying TokenB...");
  const tokenB = await hre.viem.deployContract("TokenB", [parseEther("1000000")]);
  console.log("TokenB deployed to:", tokenB.address);

  // Deploy SimpleDEX with TokenA and TokenB addresses
  console.log("\nDeploying SimpleDEX...");
  const simpleDEX = await hre.viem.deployContract("SimpleDEX", [tokenA.address, tokenB.address]);
  console.log("SimpleDEX deployed to:", simpleDEX.address);

  // Get the LP Token address (created automatically by SimpleDEX)
  const lpTokenAddress = await simpleDEX.read.lpToken();
  console.log("LP Token deployed to:", lpTokenAddress);

  // Verify token balances
  const tokenABalance = await tokenA.read.balanceOf([deployer.account.address]);
  const tokenBBalance = await tokenB.read.balanceOf([deployer.account.address]);
  console.log("\nToken balances for deployer:");
  console.log("TokenA balance:", formatEther(tokenABalance));
  console.log("TokenB balance:", formatEther(tokenBBalance));

  // Optional: Add some initial liquidity for testing
  console.log("\n--- Optional: Adding initial liquidity ---");

  // Approve DEX to spend tokens
  const approvalAmount = parseEther("100000"); // 100k tokens for testing
  console.log("Approving DEX to spend tokens...");

  // FIXED: Wait for approval transactions to be mined
  const approveAHash = await tokenA.write.approve([simpleDEX.address, approvalAmount]);
  await publicClient.waitForTransactionReceipt({ hash: approveAHash });
  console.log("TokenA approval confirmed");

  const approveBHash = await tokenB.write.approve([simpleDEX.address, approvalAmount]);
  await publicClient.waitForTransactionReceipt({ hash: approveBHash });
  console.log("TokenB approval confirmed");

  // Verify approvals (optional but good for debugging)
  const allowanceA = await tokenA.read.allowance([deployer.account.address, simpleDEX.address]);
  const allowanceB = await tokenB.read.allowance([deployer.account.address, simpleDEX.address]);
  console.log("TokenA allowance:", formatEther(allowanceA));
  console.log("TokenB allowance:", formatEther(allowanceB));

  // Add initial liquidity (10k of each token)
  const liquidityAmount = parseEther("10000");
  console.log("Adding initial liquidity...");

  const txHash = await simpleDEX.write.addLiquidity([liquidityAmount, liquidityAmount]);
  console.log("Transaction hash:", txHash);
  console.log("Waiting for confirmation...");

  try {
    await publicClient.waitForTransactionReceipt({
      hash: txHash,
      timeout: 60_000, // 60 seconds timeout
    });
    console.log("Liquidity addition confirmed");
  } catch (error: any) {
    if (error.name === "WaitForTransactionReceiptTimeoutError") {
      console.log(
        "Transaction timed out, but may still be pending. Check:",
        `https://sepolia.etherscan.io/tx/${txHash}`
      );
      console.log("Continuing with deployment...");
    } else {
      throw error;
    }
  }

  // Check reserves after adding liquidity
  console.log("Checking final state...");
  try {
    const reserves = await simpleDEX.read.getReserves();
    console.log("Reserves after adding liquidity:");
    console.log("Reserve A:", formatEther(reserves[0]));
    console.log("Reserve B:", formatEther(reserves[1]));

    // Check LP token balance
    const lpToken = await hre.viem.getContractAt("LPToken", lpTokenAddress);
    const lpBalance = await lpToken.read.balanceOf([deployer.account.address]);
    console.log("LP Token balance:", formatEther(lpBalance));
  } catch (error) {
    console.log(error, "Could not fetch reserves (transaction might still be pending)");
  }

  console.log("\n=== Deployment Summary ===");
  console.log("TokenA:", tokenA.address);
  console.log("TokenB:", tokenB.address);
  console.log("SimpleDEX:", simpleDEX.address);
  console.log("LP Token:", lpTokenAddress);
  console.log("Deployer:", deployer.account.address);

  // Save addresses to a JSON file for frontend use
  const addresses = {
    TokenA: tokenA.address,
    TokenB: tokenB.address,
    SimpleDEX: simpleDEX.address,
    LPToken: lpTokenAddress,
    deployer: deployer.account.address,
  };

  const fs = require("fs");
  fs.writeFileSync("deployed-addresses.json", JSON.stringify(addresses, null, 2));
  console.log("\nContract addresses saved to deployed-addresses.json");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
