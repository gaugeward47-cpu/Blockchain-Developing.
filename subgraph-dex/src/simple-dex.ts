import {
  DailyStatsUpdated as DailyStatsUpdatedEvent,
  LiquidityAdded as LiquidityAddedEvent,
  LiquidityRemoved as LiquidityRemovedEvent,
  Swap as SwapEvent
} from "../generated/SimpleDEX/SimpleDEX"
import {
  DailyStatsUpdated,
  LiquidityAdded,
  LiquidityRemoved,
  Swap
} from "../generated/schema"

export function handleDailyStatsUpdated(event: DailyStatsUpdatedEvent): void {
  let entity = new DailyStatsUpdated(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.day = event.params.day
  entity.volumeA = event.params.volumeA
  entity.volumeB = event.params.volumeB
  entity.fees = event.params.fees
  entity.transactions = event.params.transactions

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleLiquidityAdded(event: LiquidityAddedEvent): void {
  let entity = new LiquidityAdded(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.provider = event.params.provider
  entity.amountA = event.params.amountA
  entity.amountB = event.params.amountB
  entity.liquidity = event.params.liquidity
  entity.timestamp = event.params.timestamp

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleLiquidityRemoved(event: LiquidityRemovedEvent): void {
  let entity = new LiquidityRemoved(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.provider = event.params.provider
  entity.amountA = event.params.amountA
  entity.amountB = event.params.amountB
  entity.liquidity = event.params.liquidity
  entity.timestamp = event.params.timestamp

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleSwap(event: SwapEvent): void {
  let entity = new Swap(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.user = event.params.user
  entity.tokenIn = event.params.tokenIn
  entity.tokenOut = event.params.tokenOut
  entity.amountIn = event.params.amountIn
  entity.amountOut = event.params.amountOut
  entity.fee = event.params.fee
  entity.timestamp = event.params.timestamp

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}
