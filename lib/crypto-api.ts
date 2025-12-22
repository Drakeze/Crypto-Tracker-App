import { FetchMarketParams, type GlobalMarketData, type MarketCoin } from "@/lib/types/crypto"

export async function getCryptoPrice(symbol: string): Promise<number> {
  try {
    const { price } = await fetchJson<{ price: number }>(`/api/crypto/price?symbol=${encodeURIComponent(symbol)}`)
    return price ?? 0
  } catch (error) {
    console.error("[v0] Error fetching crypto price:", error)
    return 0
  }
}

async function fetchJson<T>(endpoint: string): Promise<T> {
  const response = await fetch(endpoint, {
    cache: "no-store",
    headers: { Accept: "application/json" },
  })

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status} ${response.statusText}`)
  }

  const payload = await response.json()
  return payload.data ?? payload
}

export async function fetchMarketCoins(params: FetchMarketParams = {}): Promise<MarketCoin[]> {
  const { perPage = 300, page = 1, currency = "usd", includeSparkline = true } = params

  const query = new URLSearchParams({
    perPage: perPage.toString(),
    page: page.toString(),
    currency,
    sparkline: includeSparkline ? "true" : "false",
  })

  return fetchJson<MarketCoin[]>(`/api/crypto/market?${query.toString()}`)
}

export async function fetchGlobalMarketData(): Promise<GlobalMarketData> {
  return fetchJson<GlobalMarketData>("/api/crypto/global")
}

export type { GlobalMarketData, MarketCoin }
