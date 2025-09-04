import { expect } from "chai";
import { viem } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { parseEther, getAddress, formatEther } from "viem";

describe("SimpleDEX", function () {
  async function deployDEXFixture() {
    const publicClient = await viem.getPublicClient();
    const [owner, user1, user2] = await viem.getWalletClients();

    // Deploy tokens with initial supply to owner
    const tokenA = await viem.deployContract("TokenA", [parseEther("1000000")]);
    const tokenB = await viem.deployContract("TokenB", [parseEther("1000000")]);

    // Deploy DEX
    const dex = await viem.deployContract("SimpleDEX", [tokenA.address, tokenB.address]);

    // Get LP token contract
    const lpTokenAddress = await dex.read.lpToken();
    const lpToken = await viem.getContractAt("LPToken", lpTokenAddress);

    // Transfer some tokens to user1 for testing
    await tokenA.write.transfer([user1.account.address, parseEther("10000")], { account: owner.account });
    await tokenB.write.transfer([user1.account.address, parseEther("10000")], { account: owner.account });

    return { dex, tokenA, tokenB, lpToken, publicClient, owner, user1, user2 };
  }

  it("Should deploy correctly", async function () {
    const { dex, tokenA, tokenB } = await loadFixture(deployDEXFixture);

    expect(getAddress(await dex.read.tokenA())).to.equal(getAddress(tokenA.address));
    expect(getAddress(await dex.read.tokenB())).to.equal(getAddress(tokenB.address));

    // Check initial reserves are zero
    const [reserveA, reserveB] = await dex.read.getReserves();
    expect(reserveA).to.equal(0n);
    expect(reserveB).to.equal(0n);
  });

  it("Should add first liquidity correctly", async function () {
    const { dex, tokenA, tokenB, lpToken, owner } = await loadFixture(deployDEXFixture);

    const amountA = parseEther("100");
    const amountB = parseEther("200");

    // Approve tokens
    await tokenA.write.approve([dex.address, amountA], { account: owner.account });
    await tokenB.write.approve([dex.address, amountB], { account: owner.account });

    // Add liquidity
    await dex.write.addLiquidity([amountA, amountB], { account: owner.account });

    // Check reserves
    const [reserveA, reserveB] = await dex.read.getReserves();
    expect(reserveA).to.equal(amountA);
    expect(reserveB).to.equal(amountB);

    // Check LP token balance
    const lpBalance = await lpToken.read.balanceOf([owner.account.address]);

    console.log("LP Balance:", formatEther(lpBalance));

    // LP balance should be > 0 and approximately sqrt(100 * 200) = 141.42 tokens
    expect(lpBalance > 0n).to.be.true;
    expect(lpBalance > parseEther("141")).to.be.true; // Should be around 141.42
    expect(lpBalance < parseEther("142")).to.be.true;
  });

  it("Should perform swaps correctly", async function () {
    const { dex, tokenA, tokenB, owner, user1 } = await loadFixture(deployDEXFixture);

    // First, add liquidity
    const liquidityA = parseEther("1000");
    const liquidityB = parseEther("2000");

    await tokenA.write.approve([dex.address, liquidityA], { account: owner.account });
    await tokenB.write.approve([dex.address, liquidityB], { account: owner.account });
    await dex.write.addLiquidity([liquidityA, liquidityB], { account: owner.account });

    // Now user1 swaps TokenA for TokenB
    const swapAmount = parseEther("100");

    // Check user1's initial balance
    const initialBalanceB = await tokenB.read.balanceOf([user1.account.address]);
    console.log("User1 initial TokenB balance:", formatEther(initialBalanceB));

    // Approve and swap
    await tokenA.write.approve([dex.address, swapAmount], { account: user1.account });
    await dex.write.swapAForB([swapAmount], { account: user1.account });

    // Check user1's balance increased
    const finalBalanceB = await tokenB.read.balanceOf([user1.account.address]);
    console.log("User1 final TokenB balance:", formatEther(finalBalanceB));

    const tokensReceived = finalBalanceB - initialBalanceB;
    console.log("TokenB received:", formatEther(tokensReceived));

    // User should have received some TokenB
    expect(finalBalanceB > initialBalanceB).to.be.true;
    expect(tokensReceived > 0n).to.be.true;
  });

  it("Should maintain k invariant after swap", async function () {
    const { dex, tokenA, tokenB, owner, user1 } = await loadFixture(deployDEXFixture);

    // Add liquidity
    const liquidityA = parseEther("1000");
    const liquidityB = parseEther("1000");

    await tokenA.write.approve([dex.address, liquidityA], { account: owner.account });
    await tokenB.write.approve([dex.address, liquidityB], { account: owner.account });
    await dex.write.addLiquidity([liquidityA, liquidityB], { account: owner.account });

    // Get initial k value
    const [initialReserveA, initialReserveB] = await dex.read.getReserves();
    const initialK = initialReserveA * initialReserveB;

    console.log("Initial reserves - A:", formatEther(initialReserveA), "B:", formatEther(initialReserveB));
    console.log("Initial K:", initialK.toString());

    // Perform swap
    const swapAmount = parseEther("100");
    await tokenA.write.approve([dex.address, swapAmount], { account: user1.account });
    await dex.write.swapAForB([swapAmount], { account: user1.account });

    // Get final k value
    const [finalReserveA, finalReserveB] = await dex.read.getReserves();
    const finalK = finalReserveA * finalReserveB;

    console.log("Final reserves - A:", formatEther(finalReserveA), "B:", formatEther(finalReserveB));
    console.log("Final K:", finalK.toString());

    // K should increase slightly due to fees (0.3% fee means K grows)
    expect(finalK > initialK).to.be.true;

    // Calculate percentage increase
    const kIncrease = ((finalK - initialK) * 10000n) / initialK; // Basis points
    console.log("K increased by:", kIncrease.toString(), "basis points");
  });

  it("Should calculate swap amounts correctly", async function () {
    const { dex, tokenA, tokenB, owner } = await loadFixture(deployDEXFixture);

    // Add liquidity
    const liquidityA = parseEther("1000");
    const liquidityB = parseEther("1000");

    await tokenA.write.approve([dex.address, liquidityA], { account: owner.account });
    await tokenB.write.approve([dex.address, liquidityB], { account: owner.account });
    await dex.write.addLiquidity([liquidityA, liquidityB], { account: owner.account });

    // Test getAmountOut function
    const swapAmount = parseEther("100");

    // Get estimated output for A->B swap
    const estimatedOut = await dex.read.getAmountOut([swapAmount, true]);
    console.log("Estimated output for 100 A->B:", formatEther(estimatedOut));

    // Should be reasonable amount (less than 100 due to slippage and fees)
    expect(estimatedOut > 0n).to.be.true;
    expect(estimatedOut < swapAmount).to.be.true; // Should get less than input due to fees
  });
});
