export interface MarketCoin {
  id: string
  market_cap_rank: number | null
  name: string
  symbol: string
  current_price: number | null
  price_change_percentage_1h_in_currency: number | null
  price_change_percentage_24h: number | null
  price_change_percentage_7d_in_currency: number | null
  market_cap: number | null
  sparkline_in_7d?: { price: number[] }
  image: string
}

export interface GlobalMarketData {
  total_market_cap: { usd: number }
  total_volume: { usd: number }
  market_cap_percentage: { btc: number; eth: number }
}

export interface FetchMarketParams {
  perPage?: number
  page?: number
  currency?: string
  includeSparkline?: boolean
}
