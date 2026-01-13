import type { MarketCoin, MarketFetchConfig } from "@/lib/types/crypto"

const COINGECKO_API_KEY = process.env.NEXT_PUBLIC_COINGECKO_API_KEY ?? ""

const DEFAULT_CONFIG: MarketFetchConfig = {
  baseUrl: "https://api.coingecko.com/api/v3/coins/markets",
  vsCurrency: "usd",
  pages: [
    { page: 1, perPage: 250 },
    { page: 2, perPage: 50 },
  ],
  retryDelayMs: 60000,
  maxRetries: 3,
}

export function buildMarketUrl(page: number, perPage: number, config: MarketFetchConfig = DEFAULT_CONFIG) {
  const params = new URLSearchParams({
    vs_currency: config.vsCurrency,
    per_page: perPage.toString(),
    page: page.toString(),
    order: "market_cap_desc",
    sparkline: "false",
  })

  return `${config.baseUrl}?${params.toString()}`
}

export async function fetchWithRetry<T>(
  url: string,
  config: MarketFetchConfig = DEFAULT_CONFIG,
  onStatus?: (message: string) => void
): Promise<T> {
  for (let attempt = 1; attempt <= config.maxRetries; attempt += 1) {
    try {
      const apiKey = COINGECKO_API_KEY.trim()
      const response = await fetch(
        url,
        apiKey
          ? {
              headers: {
                "x-cg-demo-api-key": apiKey,
              },
            }
          : undefined
      )

      if (response.status === 429) {
        if (attempt < config.maxRetries) {
          const waitTime = config.retryDelayMs * attempt
          onStatus?.(`Rate limited. Waiting ${waitTime / 1000}s before retry (${attempt}/${config.maxRetries})...`)
          await sleep(waitTime)
          continue
        }
        throw new Error("API rate limit exceeded. Please try again in a few minutes.")
      }

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`)
      }

      return (await response.json()) as T
    } catch (error) {
      if (attempt === config.maxRetries) {
        throw error
      }

      const waitTime = 2000 * attempt
      onStatus?.(`Connection error. Retrying in ${waitTime / 1000}s (${attempt}/${config.maxRetries})...`)
      await sleep(waitTime)
    }
  }

  throw new Error("Unexpected fetch retry failure.")
}

export async function fetchMarketPage(
  page: number,
  perPage: number,
  config: MarketFetchConfig = DEFAULT_CONFIG,
  onStatus?: (message: string) => void
): Promise<MarketCoin[]> {
  const url = buildMarketUrl(page, perPage, config)
  const data = await fetchWithRetry<MarketCoin[]>(url, config, onStatus)

  if (page === 2) {
    return data.map((coin, index) => ({
      ...coin,
      market_cap_rank: 251 + index,
    }))
  }

  return data
}

export async function fetchAllMarkets(
  config: MarketFetchConfig = DEFAULT_CONFIG,
  onStatus?: (message: string) => void
): Promise<MarketCoin[]> {
  const allCoins: MarketCoin[] = []

  for (let i = 0; i < config.pages.length; i += 1) {
    const { page, perPage } = config.pages[i]
    onStatus?.(`Fetching page ${i + 1} of ${config.pages.length}...`)

    const data = await fetchMarketPage(page, perPage, config, onStatus)
    allCoins.push(...data)

    if (i < config.pages.length - 1) {
      await sleep(500)
    }
  }

  return allCoins
}

export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export { DEFAULT_CONFIG as COINGECKO_MARKET_CONFIG }
