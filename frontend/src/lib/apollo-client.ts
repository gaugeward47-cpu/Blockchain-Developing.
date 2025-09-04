import { ApolloClient, gql, HttpLink, InMemoryCache } from "@apollo/client";

const SUBGRAPH_URL = "https://api.studio.thegraph.com/query/119835/subgraph-dex/v0.0.1";

export const apolloClient = new ApolloClient({
  link: new HttpLink({ uri: SUBGRAPH_URL }),
  cache: new InMemoryCache(),
});

export const GET_RECENT_SWAPS = gql`
  query GetRecentSwaps($first: Int!) {
    swaps(
      first: $first
      orderBy: timestamp
      orderDirection: desc
    ) {
      id
      user
      tokenIn
      tokenOut
      amountIn
      amountOut
      fee
      timestamp
      transactionHash
    }
  }
`;

export const GET_RECENT_LIQUIDITY = gql`
  query GetRecentLiquidity($first: Int!) {
    liquidityAddeds(first: $first, orderBy: timestamp, orderDirection: desc) {
      id
      provider
      amountA
      amountB
      liquidity
      timestamp
      transactionHash
    }
    liquidityRemoveds(first: $first, orderBy: timestamp, orderDirection: desc) {
      id
      provider
      amountA
      amountB
      liquidity
      timestamp
      transactionHash
    }
  }
`;

export const GET_DAILY_SNAPSHOTS = gql`
  query GetDailySnapshots($first: Int!) {
    dailyPoolSnapshots(
      first: $first
      orderBy: date
      orderDirection: desc
    ) {
      id
      date
      reserveA
      reserveB
      volumeA
      volumeB
      fees
      txCount
      totalLiquidity
    }
  }
`;
