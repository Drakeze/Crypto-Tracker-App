import type { CryptoData } from "@/components/crypto-table"

export type SortKey =
  | "name"
  | "price"
  | "current_price"
  | "change1h"
  | "price_change_percentage_1h_in_currency"
  | "change24h"
  | "price_change_percentage_24h"
  | "price_change_percentage_7d_in_currency"
  | "change7d"
  | "marketCap"
  | "market_cap"
  | "rank"
  | "market_cap_rank"

export function resolveSortValue(crypto: CryptoData, key: SortKey): number | string {
  const map: Record<SortKey, number | string> = {
    // Name
    name: crypto.name.toLowerCase(),

    // Price
    price: crypto.price,
    current_price: crypto.price,

    // 1h change
    change1h: crypto.change1h,
    price_change_percentage_1h_in_currency: crypto.change1h,

    // 24h change
    change24h: crypto.change24h,
    price_change_percentage_24h: crypto.change24h,

    // 7d change
    change7d: crypto.change7d,
    price_change_percentage_7d_in_currency: crypto.change7d,

    // Market cap
    marketCap: crypto.marketCap,
    market_cap: crypto.marketCap,

    // Rank
    rank: crypto.rank,
    market_cap_rank: crypto.rank,
  }

  return map[key] ?? crypto.rank
}
