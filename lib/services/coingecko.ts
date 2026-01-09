import "server-only"

import { FetchMarketParams, GlobalMarketData, type MarketCoin } from "@/lib/crypto-api"

const COINGECKO_BASE_URL = "https://api.coingecko.com/api/v3"

// Data provided by CoinGecko (https://www.coingecko.com/). Please respect their attribution and rate limits.
// TODO: Add rate limiting and caching layers to protect against API quotas and overuse.

const CRYPTO_ID_MAP: Record<string, string> = {
  BTC: "bitcoin",
  ETH: "ethereum",
  USDT: "tether",
  BNB: "binancecoin",
  SOL: "solana",
  XRP: "ripple",
  USDC: "usd-coin",
  ADA: "cardano",
  DOGE: "dogecoin",
  TRX: "tron",
  AVAX: "avalanche-2",
  LINK: "chainlink",
  MATIC: "matic-network",
  LTC: "litecoin",
  UNI: "uniswap",
}

export async function fetchMarketCoins({
  perPage = 300,
  page = 1,
  currency = "usd",
  includeSparkline = true,
}: FetchMarketParams = {}): Promise<MarketCoin[]> {
  const params = new URLSearchParams({
    vs_currency: currency,
    order: "market_cap_desc",
    per_page: perPage.toString(),
    page: page.toString(),
    sparkline: includeSparkline ? "true" : "false",
    price_change_percentage: "1h,24h,7d",
  })

  const response = await fetch(`${COINGECKO_BASE_URL}/coins/markets?${params.toString()}`, {
    cache: "no-store",
    headers: { Accept: "application/json" },
  })

  if (!response.ok) {
    throw new Error(`CoinGecko market API error: ${response.status} ${response.statusText}`)
  }

  return response.json()
}

export async function fetchGlobalMarketData(): Promise<GlobalMarketData> {
  const response = await fetch(`${COINGECKO_BASE_URL}/global`, {
    cache: "no-store",
    headers: { Accept: "application/json" },
  })

  if (!response.ok) {
    throw new Error(`CoinGecko global API error: ${response.status} ${response.statusText}`)
  }

  const data = await response.json()
  return data.data
}

export async function fetchCoinPriceBySymbol(symbol: string): Promise<number> {
  const coinGeckoId = CRYPTO_ID_MAP[symbol.toUpperCase()]
  if (!coinGeckoId) {
    throw new Error(`Unknown cryptocurrency symbol: ${symbol}`)
  }

  const response = await fetch(`${COINGECKO_BASE_URL}/simple/price?ids=${coinGeckoId}&vs_currencies=usd`, {
    cache: "no-store",
    headers: { Accept: "application/json" },
  })

  if (!response.ok) {
    throw new Error(`CoinGecko price API error: ${response.status} ${response.statusText}`)
  }

  const data = await response.json()
  return data[coinGeckoId]?.usd ?? 0
}
