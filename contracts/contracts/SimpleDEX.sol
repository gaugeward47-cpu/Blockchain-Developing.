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

  // Gas-optimized: Pack multiple values into single storage slot
  struct DailyStats {
    uint128 volumeA; // 16 bytes
    uint128 volumeB; // 16 bytes
  }

  struct DailyMetrics {
    uint128 fees; // 16 bytes
    uint32 transactions; // 4 bytes
    uint32 day; // 4 bytes
    uint64 reserved; // 8 bytes (for future use)
  }

  // Only store current day stats in contract
  DailyStats public currentDayVolume;
  DailyMetrics public currentDayMetrics;

  // Minimal state tracking
  uint256 public totalFeesCollected;
  uint32 public totalLiquidityProviders;
  mapping(address => bool) public isLiquidityProvider;

  // Events for historical data (indexed by external services)
  event LiquidityAdded(
    address indexed provider,
    uint256 amountA,
    uint256 amountB,
    uint256 liquidity,
    uint256 timestamp
  );

  event LiquidityRemoved(
    address indexed provider,
    uint256 amountA,
    uint256 amountB,
    uint256 liquidity,
    uint256 timestamp
  );

  event Swap(
    address indexed user,
    address indexed tokenIn,
    address indexed tokenOut,
    uint256 amountIn,
    uint256 amountOut,
    uint256 fee,
    uint256 timestamp
  );

  // Daily stats event for indexing services
  event DailyStatsUpdated(uint256 indexed day, uint256 volumeA, uint256 volumeB, uint256 fees, uint256 transactions);

  constructor(address _tokenA, address _tokenB) {
    tokenA = IERC20(_tokenA);
    tokenB = IERC20(_tokenB);
    lpToken = new LPToken();

    // Initialize current day
    currentDayMetrics.day = uint32(getCurrentDay());
  }

  function getReserves() external view returns (uint256, uint256) {
    return (reserveA, reserveB);
  }

  function getCurrentDay() public view returns (uint256) {
    return block.timestamp / 86400;
  }

  // Gas-optimized: Only update daily stats when day changes
  function _updateDailyStats() internal {
    uint32 today = uint32(getCurrentDay());

    if (today != currentDayMetrics.day) {
      // Emit final stats for previous day
      emit DailyStatsUpdated(
        currentDayMetrics.day,
        currentDayVolume.volumeA,
        currentDayVolume.volumeB,
        currentDayMetrics.fees,
        currentDayMetrics.transactions
      );

      // Reset for new day
      currentDayVolume = DailyStats(0, 0);
      currentDayMetrics = DailyMetrics(0, 0, today, 0);
    }
  }

  function addLiquidity(uint256 amountA, uint256 amountB) external nonReentrant {
    require(amountA > 0 && amountB > 0, "Amounts must be greater than 0");

    uint256 liquidityMinted;

    if (lpToken.totalSupply() == 0) {
      liquidityMinted = _sqrt(amountA * amountB);
    } else {
      liquidityMinted = _min(
        (amountA * lpToken.totalSupply()) / reserveA,
        (amountB * lpToken.totalSupply()) / reserveB
      );
    }

    require(liquidityMinted > 0, "Insufficient liquidity minted");

    tokenA.transferFrom(msg.sender, address(this), amountA);
    tokenB.transferFrom(msg.sender, address(this), amountB);

    reserveA += amountA;
    reserveB += amountB;

    // Gas-optimized: Only update LP count if new provider
    if (!isLiquidityProvider[msg.sender]) {
      isLiquidityProvider[msg.sender] = true;
      totalLiquidityProviders++;
    }

    lpToken.mint(msg.sender, liquidityMinted);

    // Update daily stats (minimal gas cost)
    _updateDailyStats();
    currentDayMetrics.transactions++;

    emit LiquidityAdded(msg.sender, amountA, amountB, liquidityMinted, block.timestamp);
  }

  function removeLiquidity(uint256 liquidity) external nonReentrant {
    require(liquidity > 0, "Liquidity must be greater than 0");

    uint256 totalSupply = lpToken.totalSupply();
    uint256 amountA = (liquidity * reserveA) / totalSupply;
    uint256 amountB = (liquidity * reserveB) / totalSupply;

    require(amountA > 0 && amountB > 0, "Insufficient liquidity burned");

    lpToken.burn(msg.sender, liquidity);

    reserveA -= amountA;
    reserveB -= amountB;

    tokenA.transfer(msg.sender, amountA);
    tokenB.transfer(msg.sender, amountB);

    _updateDailyStats();
    currentDayMetrics.transactions++;

    emit LiquidityRemoved(msg.sender, amountA, amountB, liquidity, block.timestamp);
  }

  function swapAForB(uint256 amountIn) external nonReentrant {
    require(amountIn > 0, "Amount must be greater than 0");
    require(reserveA > 0 && reserveB > 0, "Insufficient liquidity");

    uint256 amountInWithFee = amountIn * (FEE_DENOMINATOR - FEE_PERCENT);
    uint256 amountOut = (amountInWithFee * reserveB) / (reserveA * FEE_DENOMINATOR + amountInWithFee);

    require(amountOut > 0, "Insufficient output amount");
    require(amountOut < reserveB, "Insufficient liquidity");

    uint256 fee = (amountIn * FEE_PERCENT) / FEE_DENOMINATOR;

    tokenA.transferFrom(msg.sender, address(this), amountIn);
    tokenB.transfer(msg.sender, amountOut);

    reserveA += amountIn;
    reserveB -= amountOut;

    // Gas-optimized updates
    totalFeesCollected += fee;
    _updateDailyStats();
    currentDayVolume.volumeA += uint128(amountIn);
    currentDayMetrics.fees += uint128(fee);
    currentDayMetrics.transactions++;

    emit Swap(msg.sender, address(tokenA), address(tokenB), amountIn, amountOut, fee, block.timestamp);
  }

  function swapBForA(uint256 amountIn) external nonReentrant {
    require(amountIn > 0, "Amount must be greater than 0");
    require(reserveA > 0 && reserveB > 0, "Insufficient liquidity");

    uint256 amountInWithFee = amountIn * (FEE_DENOMINATOR - FEE_PERCENT);
    uint256 amountOut = (amountInWithFee * reserveA) / (reserveB * FEE_DENOMINATOR + amountInWithFee);

    require(amountOut > 0, "Insufficient output amount");
    require(amountOut < reserveA, "Insufficient liquidity");

    uint256 fee = (amountIn * FEE_PERCENT) / FEE_DENOMINATOR;

    tokenB.transferFrom(msg.sender, address(this), amountIn);
    tokenA.transfer(msg.sender, amountOut);

    reserveB += amountIn;
    reserveA -= amountOut;

    totalFeesCollected += fee;
    _updateDailyStats();
    currentDayVolume.volumeB += uint128(amountIn);
    currentDayMetrics.fees += uint128(fee);
    currentDayMetrics.transactions++;

    emit Swap(msg.sender, address(tokenB), address(tokenA), amountIn, amountOut, fee, block.timestamp);
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

  // View functions for current day stats
  function getVolume24h() external view returns (uint256, uint256) {
    return (currentDayVolume.volumeA, currentDayVolume.volumeB);
  }

  function getFees24h() external view returns (uint256) {
    return currentDayMetrics.fees;
  }

  function getTransactions24h() external view returns (uint256) {
    return currentDayMetrics.transactions;
  }

  function getLiquidityProvidersCount() external view returns (uint256) {
    return totalLiquidityProviders;
  }

  function getTotalLiquidity() public view returns (uint256) {
    return reserveA + reserveB;
  }

  function getAPR() external view returns (uint256) {
    uint256 totalLiquidity = getTotalLiquidity();
    if (totalLiquidity == 0) return 0;

    uint256 fees24h = currentDayMetrics.fees;
    return (fees24h * 365 * 100) / totalLiquidity;
  }

  function getCurrentPrice() external view returns (uint256) {
    if (reserveA == 0) return 0;
    return (reserveB * 1e18) / reserveA;
  }

  // Helper functions
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

  function _min(uint256 a, uint256 b) internal pure returns (uint256) {
    return a < b ? a : b;
  }
}
