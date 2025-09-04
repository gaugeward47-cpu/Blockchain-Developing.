import { newMockEvent } from "matchstick-as"
import { ethereum, BigInt, Address } from "@graphprotocol/graph-ts"
import {
  DailyStatsUpdated,
  LiquidityAdded,
  LiquidityRemoved,
  Swap
} from "../generated/SimpleDEX/SimpleDEX"

export function createDailyStatsUpdatedEvent(
  day: BigInt,
  volumeA: BigInt,
  volumeB: BigInt,
  fees: BigInt,
  transactions: BigInt
): DailyStatsUpdated {
  let dailyStatsUpdatedEvent = changetype<DailyStatsUpdated>(newMockEvent())

  dailyStatsUpdatedEvent.parameters = new Array()

  dailyStatsUpdatedEvent.parameters.push(
    new ethereum.EventParam("day", ethereum.Value.fromUnsignedBigInt(day))
  )
  dailyStatsUpdatedEvent.parameters.push(
    new ethereum.EventParam(
      "volumeA",
      ethereum.Value.fromUnsignedBigInt(volumeA)
    )
  )
  dailyStatsUpdatedEvent.parameters.push(
    new ethereum.EventParam(
      "volumeB",
      ethereum.Value.fromUnsignedBigInt(volumeB)
    )
  )
  dailyStatsUpdatedEvent.parameters.push(
    new ethereum.EventParam("fees", ethereum.Value.fromUnsignedBigInt(fees))
  )
  dailyStatsUpdatedEvent.parameters.push(
    new ethereum.EventParam(
      "transactions",
      ethereum.Value.fromUnsignedBigInt(transactions)
    )
  )

  return dailyStatsUpdatedEvent
}

export function createLiquidityAddedEvent(
  provider: Address,
  amountA: BigInt,
  amountB: BigInt,
  liquidity: BigInt,
  timestamp: BigInt
): LiquidityAdded {
  let liquidityAddedEvent = changetype<LiquidityAdded>(newMockEvent())

  liquidityAddedEvent.parameters = new Array()

  liquidityAddedEvent.parameters.push(
    new ethereum.EventParam("provider", ethereum.Value.fromAddress(provider))
  )
  liquidityAddedEvent.parameters.push(
    new ethereum.EventParam(
      "amountA",
      ethereum.Value.fromUnsignedBigInt(amountA)
    )
  )
  liquidityAddedEvent.parameters.push(
    new ethereum.EventParam(
      "amountB",
      ethereum.Value.fromUnsignedBigInt(amountB)
    )
  )
  liquidityAddedEvent.parameters.push(
    new ethereum.EventParam(
      "liquidity",
      ethereum.Value.fromUnsignedBigInt(liquidity)
    )
  )
  liquidityAddedEvent.parameters.push(
    new ethereum.EventParam(
      "timestamp",
      ethereum.Value.fromUnsignedBigInt(timestamp)
    )
  )

  return liquidityAddedEvent
}

export function createLiquidityRemovedEvent(
  provider: Address,
  amountA: BigInt,
  amountB: BigInt,
  liquidity: BigInt,
  timestamp: BigInt
): LiquidityRemoved {
  let liquidityRemovedEvent = changetype<LiquidityRemoved>(newMockEvent())

  liquidityRemovedEvent.parameters = new Array()

  liquidityRemovedEvent.parameters.push(
    new ethereum.EventParam("provider", ethereum.Value.fromAddress(provider))
  )
  liquidityRemovedEvent.parameters.push(
    new ethereum.EventParam(
      "amountA",
      ethereum.Value.fromUnsignedBigInt(amountA)
    )
  )
  liquidityRemovedEvent.parameters.push(
    new ethereum.EventParam(
      "amountB",
      ethereum.Value.fromUnsignedBigInt(amountB)
    )
  )
  liquidityRemovedEvent.parameters.push(
    new ethereum.EventParam(
      "liquidity",
      ethereum.Value.fromUnsignedBigInt(liquidity)
    )
  )
  liquidityRemovedEvent.parameters.push(
    new ethereum.EventParam(
      "timestamp",
      ethereum.Value.fromUnsignedBigInt(timestamp)
    )
  )

  return liquidityRemovedEvent
}

export function createSwapEvent(
  user: Address,
  tokenIn: Address,
  tokenOut: Address,
  amountIn: BigInt,
  amountOut: BigInt,
  fee: BigInt,
  timestamp: BigInt
): Swap {
  let swapEvent = changetype<Swap>(newMockEvent())

  swapEvent.parameters = new Array()

  swapEvent.parameters.push(
    new ethereum.EventParam("user", ethereum.Value.fromAddress(user))
  )
  swapEvent.parameters.push(
    new ethereum.EventParam("tokenIn", ethereum.Value.fromAddress(tokenIn))
  )
  swapEvent.parameters.push(
    new ethereum.EventParam("tokenOut", ethereum.Value.fromAddress(tokenOut))
  )
  swapEvent.parameters.push(
    new ethereum.EventParam(
      "amountIn",
      ethereum.Value.fromUnsignedBigInt(amountIn)
    )
  )
  swapEvent.parameters.push(
    new ethereum.EventParam(
      "amountOut",
      ethereum.Value.fromUnsignedBigInt(amountOut)
    )
  )
  swapEvent.parameters.push(
    new ethereum.EventParam("fee", ethereum.Value.fromUnsignedBigInt(fee))
  )
  swapEvent.parameters.push(
    new ethereum.EventParam(
      "timestamp",
      ethereum.Value.fromUnsignedBigInt(timestamp)
    )
  )

  return swapEvent
}
