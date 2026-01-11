import type { FetchState, LikedCoinSet, MarketCoin, SortKey } from "@/lib/types/crypto"
import { filterCoins, sortCoins } from "@/lib/utils/sort"

export interface CryptoViewState extends FetchState {
  coins: MarketCoin[]
  likedCoins: LikedCoinSet
  currentSort: SortKey
  showLikedOnly: boolean
}

export const DEFAULT_VIEW_STATE: CryptoViewState = {
  coins: [],
  likedCoins: new Set(),
  currentSort: "market_cap_desc",
  showLikedOnly: false,
  isLoading: false,
  errorMessage: null,
}

export function loadLikedCoins(storage: Storage, storageKey = "likedCoins"): LikedCoinSet {
  try {
    const saved = storage.getItem(storageKey)
    if (!saved) return new Set()
    const parsed = JSON.parse(saved) as string[]
    return new Set(parsed)
  } catch (error) {
    console.error("Error loading liked coins:", error)
    return new Set()
  }
}

export function saveLikedCoins(storage: Storage, likedCoins: LikedCoinSet, storageKey = "likedCoins") {
  try {
    storage.setItem(storageKey, JSON.stringify([...likedCoins]))
  } catch (error) {
    console.error("Error saving liked coins:", error)
  }
}

export function toggleLike(coinId: string, likedCoins: LikedCoinSet) {
  const next = new Set(likedCoins)

  if (next.has(coinId)) {
    next.delete(coinId)
  } else {
    next.add(coinId)
  }

  return next
}

export function applySortAndFilter(
  coins: MarketCoin[],
  options: {
    likedCoins?: LikedCoinSet
    currentSort?: SortKey
    showLikedOnly?: boolean
  }
) {
  const likedCoins = options.likedCoins ?? new Set()
  const currentSort = options.currentSort ?? "market_cap_desc"
  const showLikedOnly = options.showLikedOnly ?? false

  const filtered = filterCoins(coins, showLikedOnly, likedCoins)
  return sortCoins(filtered, currentSort, likedCoins)
}

export function coinCountLabel(count: number) {
  return `${count} coin${count !== 1 ? "s" : ""}`
}

export function buildRefreshState(): FetchState {
  return {
    isLoading: true,
    errorMessage: null,
  }
}

export function buildErrorState(message: string): FetchState {
  return {
    isLoading: false,
    errorMessage: message,
  }
}
