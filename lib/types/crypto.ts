export interface MarketCoin {
  id: string
  symbol: string
  name: string
  image: string
  current_price: number | null
  market_cap: number | null
  market_cap_rank: number | null
  total_volume: number | null
  price_change_percentage_24h: number | null
}

export type SortKey =
  | "market_cap_desc"
  | "market_cap_asc"
  | "price_desc"
  | "price_asc"
  | "name_asc"
  | "name_desc"
  | "change_desc"
  | "change_asc"
  | "liked"

export interface FetchState {
  isLoading: boolean
  errorMessage: string | null
}

export interface MarketFetchConfig {
  baseUrl: string
  vsCurrency: string
  pages: Array<{ page: number; perPage: number }>
  retryDelayMs: number
  maxRetries: number
}

export type LikedCoinSet = Set<string>
