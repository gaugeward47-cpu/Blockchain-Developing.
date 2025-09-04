// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./LPToken.sol";

contract SimpleDEX is ReentrancyGuard {
  IERC20 public immutable tokenA;
  IERC20 public immutable tokenB;
  LPToken public immutable lpToken;

  uint256 public reserveA;
  uint256 public reserveB;

  uint256 constant FEE_PERCENT = 3; // 0.3%
  uint256 constant FEE_DENOMINATOR = 1000;

  event LiquidityAdded(address indexed provider, uint256 amountA, uint256 amountB, uint256 liquidity);
  event LiquidityRemoved(address indexed provider, uint256 amountA, uint256 amountB, uint256 liquidity);
  event Swap(address indexed user, address tokenIn, address tokenOut, uint256 amountIn, uint256 amountOut);

  constructor(address _tokenA, address _tokenB) {
    tokenA = IERC20(_tokenA);
    tokenB = IERC20(_tokenB);
    lpToken = new LPToken();
  }

  function getReserves() external view returns (uint256, uint256) {
    return (reserveA, reserveB);
  }

  function addLiquidity(uint256 amountA, uint256 amountB) external nonReentrant {
    require(amountA > 0 && amountB > 0, "Amounts must be greater than 0");

    uint256 liquidityMinted;

    if (lpToken.totalSupply() == 0) {
      // First liquidity provision
      liquidityMinted = _sqrt(amountA * amountB);
    } else {
      // Subsequent liquidity provisions - maintain ratio
      liquidityMinted = _min(
        (amountA * lpToken.totalSupply()) / reserveA,
        (amountB * lpToken.totalSupply()) / reserveB
      );
    }

    require(liquidityMinted > 0, "Insufficient liquidity minted");

    // Transfer tokens from user
    tokenA.transferFrom(msg.sender, address(this), amountA);
    tokenB.transferFrom(msg.sender, address(this), amountB);

    // Update reserves
    reserveA += amountA;
    reserveB += amountB;

    // Mint LP tokens
    lpToken.mint(msg.sender, liquidityMinted);

    emit LiquidityAdded(msg.sender, amountA, amountB, liquidityMinted);
  }

  function removeLiquidity(uint256 liquidity) external nonReentrant {
    require(liquidity > 0, "Liquidity must be greater than 0");

    uint256 totalSupply = lpToken.totalSupply();
    uint256 amountA = (liquidity * reserveA) / totalSupply;
    uint256 amountB = (liquidity * reserveB) / totalSupply;

    require(amountA > 0 && amountB > 0, "Insufficient liquidity burned");

    // Burn LP tokens
    lpToken.burn(msg.sender, liquidity);

    // Update reserves
    reserveA -= amountA;
    reserveB -= amountB;

    // Transfer tokens to user
    tokenA.transfer(msg.sender, amountA);
    tokenB.transfer(msg.sender, amountB);

    emit LiquidityRemoved(msg.sender, amountA, amountB, liquidity);
  }

  function swapAForB(uint256 amountIn) external nonReentrant {
    require(amountIn > 0, "Amount must be greater than 0");
    require(reserveA > 0 && reserveB > 0, "Insufficient liquidity");

    uint256 amountInWithFee = amountIn * (FEE_DENOMINATOR - FEE_PERCENT);
    uint256 amountOut = (amountInWithFee * reserveB) / (reserveA * FEE_DENOMINATOR + amountInWithFee);

    require(amountOut > 0, "Insufficient output amount");
    require(amountOut < reserveB, "Insufficient liquidity");

    // Transfer tokens
    tokenA.transferFrom(msg.sender, address(this), amountIn);
    tokenB.transfer(msg.sender, amountOut);

    // Update reserves
    reserveA += amountIn;
    reserveB -= amountOut;

    emit Swap(msg.sender, address(tokenA), address(tokenB), amountIn, amountOut);
  }

  function swapBForA(uint256 amountIn) external nonReentrant {
    require(amountIn > 0, "Amount must be greater than 0");
    require(reserveA > 0 && reserveB > 0, "Insufficient liquidity");

    uint256 amountInWithFee = amountIn * (FEE_DENOMINATOR - FEE_PERCENT);
    uint256 amountOut = (amountInWithFee * reserveA) / (reserveB * FEE_DENOMINATOR + amountInWithFee);

    require(amountOut > 0, "Insufficient output amount");
    require(amountOut < reserveA, "Insufficient liquidity");

    // Transfer tokens
    tokenB.transferFrom(msg.sender, address(this), amountIn);
    tokenA.transfer(msg.sender, amountOut);

    // Update reserves
    reserveB += amountIn;
    reserveA -= amountOut;

    emit Swap(msg.sender, address(tokenB), address(tokenA), amountIn, amountOut);
  }

  function getAmountOut(uint256 amountIn, bool isAForB) external view returns (uint256) {
    if (reserveA == 0 || reserveB == 0) return 0;

    uint256 amountInWithFee = amountIn * (FEE_DENOMINATOR - FEE_PERCENT);

    if (isAForB) {
      return (amountInWithFee * reserveB) / (reserveA * FEE_DENOMINATOR + amountInWithFee);
    } else {
      return (amountInWithFee * reserveA) / (reserveB * FEE_DENOMINATOR + amountInWithFee);
    }
  }

  // Helper functions
  // Use for adding initial liquidity
  function _sqrt(uint256 y) internal pure returns (uint256 z) {
    if (y > 3) {
      z = y;
      uint256 x = y / 2 + 1;
      while (x < z) {
        z = x;
        x = (y / x + x) / 2;
      }
    } else if (y != 0) {
      z = 1;
    }
  }

  // Use for adding liquidity when already exists reserves
  function _min(uint256 a, uint256 b) internal pure returns (uint256) {
    return a < b ? a : b;
  }
}
