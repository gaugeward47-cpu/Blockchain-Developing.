import {
  assert,
  describe,
  test,
  clearStore,
  beforeAll,
  afterAll
} from "matchstick-as/assembly/index"
import { BigInt, Address } from "@graphprotocol/graph-ts"
import { DailyStatsUpdated } from "../generated/schema"
import { DailyStatsUpdated as DailyStatsUpdatedEvent } from "../generated/SimpleDEX/SimpleDEX"
import { handleDailyStatsUpdated } from "../src/simple-dex"
import { createDailyStatsUpdatedEvent } from "./simple-dex-utils"

// Tests structure (matchstick-as >=0.5.0)
// https://thegraph.com/docs/en/subgraphs/developing/creating/unit-testing-framework/#tests-structure

describe("Describe entity assertions", () => {
  beforeAll(() => {
    let day = BigInt.fromI32(234)
    let volumeA = BigInt.fromI32(234)
    let volumeB = BigInt.fromI32(234)
    let fees = BigInt.fromI32(234)
    let transactions = BigInt.fromI32(234)
    let newDailyStatsUpdatedEvent = createDailyStatsUpdatedEvent(
      day,
      volumeA,
      volumeB,
      fees,
      transactions
    )
    handleDailyStatsUpdated(newDailyStatsUpdatedEvent)
  })

  afterAll(() => {
    clearStore()
  })

  // For more test scenarios, see:
  // https://thegraph.com/docs/en/subgraphs/developing/creating/unit-testing-framework/#write-a-unit-test

  test("DailyStatsUpdated created and stored", () => {
    assert.entityCount("DailyStatsUpdated", 1)

    // 0xa16081f360e3847006db660bae1c6d1b2e17ec2a is the default address used in newMockEvent() function
    assert.fieldEquals(
      "DailyStatsUpdated",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "day",
      "234"
    )
    assert.fieldEquals(
      "DailyStatsUpdated",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "volumeA",
      "234"
    )
    assert.fieldEquals(
      "DailyStatsUpdated",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "volumeB",
      "234"
    )
    assert.fieldEquals(
      "DailyStatsUpdated",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "fees",
      "234"
    )
    assert.fieldEquals(
      "DailyStatsUpdated",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "transactions",
      "234"
    )

    // More assert options:
    // https://thegraph.com/docs/en/subgraphs/developing/creating/unit-testing-framework/#asserts
  })
})
