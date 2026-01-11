import type { LikedCoinSet, MarketCoin, SortKey } from "@/lib/types/crypto"

export function sortCoins(coins: MarketCoin[], sortKey: SortKey, likedCoins: LikedCoinSet = new Set()) {
  const sorted = [...coins]

  switch (sortKey) {
    case "market_cap_desc":
      return sorted.sort((a, b) => (b.market_cap || 0) - (a.market_cap || 0))
    case "market_cap_asc":
      return sorted.sort((a, b) => (a.market_cap || 0) - (b.market_cap || 0))
    case "price_desc":
      return sorted.sort((a, b) => (b.current_price || 0) - (a.current_price || 0))
    case "price_asc":
      return sorted.sort((a, b) => (a.current_price || 0) - (b.current_price || 0))
    case "name_asc":
      return sorted.sort((a, b) => a.name.localeCompare(b.name))
    case "name_desc":
      return sorted.sort((a, b) => b.name.localeCompare(a.name))
    case "change_desc":
      return sorted.sort((a, b) => (b.price_change_percentage_24h || 0) - (a.price_change_percentage_24h || 0))
    case "change_asc":
      return sorted.sort((a, b) => (a.price_change_percentage_24h || 0) - (b.price_change_percentage_24h || 0))
    case "liked":
      return sorted.sort((a, b) => {
        const aLiked = likedCoins.has(a.id) ? 1 : 0
        const bLiked = likedCoins.has(b.id) ? 1 : 0
        if (bLiked !== aLiked) return bLiked - aLiked
        return (b.market_cap || 0) - (a.market_cap || 0)
      })
    default:
      return sorted
  }
}

export function filterCoins(coins: MarketCoin[], showLikedOnly: boolean, likedCoins: LikedCoinSet = new Set()) {
  if (!showLikedOnly) return coins
  return coins.filter((coin) => likedCoins.has(coin.id))
}
