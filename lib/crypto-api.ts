// CoinGecko API integration for real-time cryptocurrency data
export interface CryptoData {
  id: number
  name: string
  symbol: string
  price: number
  marketCap: number
  change24h: number
  rank: number
  coinGeckoId: string
}

export interface CoinGeckoResponse {
  id: string
  symbol: string
  name: string
  current_price: number
  market_cap: number
  market_cap_rank: number
  price_change_percentage_24h: number
}

const COINGECKO_API_BASE = "https://api.coingecko.com/api/v3"

// Map of crypto symbols to CoinGecko IDs for better API calls
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

export async function fetchCryptoData(): Promise<CryptoData[]> {
  try {
    console.log("[v0] Fetching crypto data from CoinGecko API...")

    const response = await fetch(
      `${COINGECKO_API_BASE}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=false&price_change_percentage=24h`,
      {
        headers: {
          Accept: "application/json",
        },
      },
    )

    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status} ${response.statusText}`)
    }

    const data: CoinGeckoResponse[] = await response.json()
    console.log("[v0] Successfully fetched crypto data:", data.length, "cryptocurrencies")

    // Transform CoinGecko data to our format
    const transformedData: CryptoData[] = data.map((coin, index) => ({
      id: index + 1, // Use index as ID for consistency with existing favorites system
      name: coin.name,
      symbol: coin.symbol.toUpperCase(),
      price: coin.current_price,
      marketCap: coin.market_cap,
      change24h: coin.price_change_percentage_24h || 0,
      rank: coin.market_cap_rank || index + 1,
      coinGeckoId: coin.id,
    }))

    return transformedData
  } catch (error) {
    console.error("[v0] Error fetching crypto data:", error)

    // Return fallback mock data if API fails
    console.log("[v0] Falling back to mock data due to API error")
    return getFallbackData()
  }
}

function getFallbackData(): CryptoData[] {
  return [
    {
      id: 1,
      name: "Bitcoin",
      symbol: "BTC",
      price: 67420.5,
      marketCap: 1330000000000,
      change24h: 2.45,
      rank: 1,
      coinGeckoId: "bitcoin",
    },
    {
      id: 2,
      name: "Ethereum",
      symbol: "ETH",
      price: 3890.25,
      marketCap: 467000000000,
      change24h: -1.23,
      rank: 2,
      coinGeckoId: "ethereum",
    },
    {
      id: 3,
      name: "Tether",
      symbol: "USDT",
      price: 1.0,
      marketCap: 118000000000,
      change24h: 0.01,
      rank: 3,
      coinGeckoId: "tether",
    },
    {
      id: 4,
      name: "BNB",
      symbol: "BNB",
      price: 635.8,
      marketCap: 92000000000,
      change24h: 3.67,
      rank: 4,
      coinGeckoId: "binancecoin",
    },
    {
      id: 5,
      name: "Solana",
      symbol: "SOL",
      price: 245.6,
      marketCap: 115000000000,
      change24h: 8.92,
      rank: 5,
      coinGeckoId: "solana",
    },
    {
      id: 6,
      name: "XRP",
      symbol: "XRP",
      price: 2.45,
      marketCap: 140000000000,
      change24h: -2.15,
      rank: 6,
      coinGeckoId: "ripple",
    },
    {
      id: 7,
      name: "USDC",
      symbol: "USDC",
      price: 1.0,
      marketCap: 38000000000,
      change24h: 0.0,
      rank: 7,
      coinGeckoId: "usd-coin",
    },
    {
      id: 8,
      name: "Cardano",
      symbol: "ADA",
      price: 1.08,
      marketCap: 38000000000,
      change24h: 4.23,
      rank: 8,
      coinGeckoId: "cardano",
    },
    {
      id: 9,
      name: "Dogecoin",
      symbol: "DOGE",
      price: 0.42,
      marketCap: 62000000000,
      change24h: 12.45,
      rank: 9,
      coinGeckoId: "dogecoin",
    },
    {
      id: 10,
      name: "TRON",
      symbol: "TRX",
      price: 0.28,
      marketCap: 24000000000,
      change24h: -0.89,
      rank: 10,
      coinGeckoId: "tron",
    },
    {
      id: 11,
      name: "Avalanche",
      symbol: "AVAX",
      price: 42.15,
      marketCap: 17000000000,
      change24h: 5.67,
      rank: 11,
      coinGeckoId: "avalanche-2",
    },
    {
      id: 12,
      name: "Chainlink",
      symbol: "LINK",
      price: 25.8,
      marketCap: 16000000000,
      change24h: -3.21,
      rank: 12,
      coinGeckoId: "chainlink",
    },
    {
      id: 13,
      name: "Polygon",
      symbol: "MATIC",
      price: 1.15,
      marketCap: 11000000000,
      change24h: 7.89,
      rank: 13,
      coinGeckoId: "matic-network",
    },
    {
      id: 14,
      name: "Litecoin",
      symbol: "LTC",
      price: 108.5,
      marketCap: 8100000000,
      change24h: 1.45,
      rank: 14,
      coinGeckoId: "litecoin",
    },
    {
      id: 15,
      name: "Uniswap",
      symbol: "UNI",
      price: 12.8,
      marketCap: 7600000000,
      change24h: -2.67,
      rank: 15,
      coinGeckoId: "uniswap",
    },
    {
      id: 16,
      name: "Internet Computer",
      symbol: "ICP",
      price: 12.45,
      marketCap: 5800000000,
      change24h: 3.21,
      rank: 16,
      coinGeckoId: "internet-computer",
    },
    {
      id: 17,
      name: "Pepe",
      symbol: "PEPE",
      price: 0.000021,
      marketCap: 8900000000,
      change24h: 15.67,
      rank: 17,
      coinGeckoId: "pepe",
    },
    {
      id: 18,
      name: "Ethereum Classic",
      symbol: "ETC",
      price: 28.9,
      marketCap: 4200000000,
      change24h: -1.89,
      rank: 18,
      coinGeckoId: "ethereum-classic",
    },
    {
      id: 19,
      name: "Stellar",
      symbol: "XLM",
      price: 0.45,
      marketCap: 13200000000,
      change24h: 6.78,
      rank: 19,
      coinGeckoId: "stellar",
    },
    {
      id: 20,
      name: "Monero",
      symbol: "XMR",
      price: 185.6,
      marketCap: 3400000000,
      change24h: -2.34,
      rank: 20,
      coinGeckoId: "monero",
    },
    {
      id: 21,
      name: "Render",
      symbol: "RNDR",
      price: 7.89,
      marketCap: 4100000000,
      change24h: 8.45,
      rank: 21,
      coinGeckoId: "render-token",
    },
    {
      id: 22,
      name: "Hedera",
      symbol: "HBAR",
      price: 0.28,
      marketCap: 10500000000,
      change24h: 4.56,
      rank: 22,
      coinGeckoId: "hedera-hashgraph",
    },
    {
      id: 23,
      name: "Cronos",
      symbol: "CRO",
      price: 0.18,
      marketCap: 4700000000,
      change24h: -0.89,
      rank: 23,
      coinGeckoId: "crypto-com-chain",
    },
    {
      id: 24,
      name: "Near Protocol",
      symbol: "NEAR",
      price: 6.78,
      marketCap: 7800000000,
      change24h: 12.34,
      rank: 24,
      coinGeckoId: "near",
    },
    {
      id: 25,
      name: "VeChain",
      symbol: "VET",
      price: 0.045,
      marketCap: 3300000000,
      change24h: 2.67,
      rank: 25,
      coinGeckoId: "vechain",
    },
  ]
}

// Function to get specific crypto price for calculator
export async function getCryptoPrice(symbol: string): Promise<number> {
  try {
    const coinGeckoId = CRYPTO_ID_MAP[symbol.toUpperCase()]
    if (!coinGeckoId) {
      throw new Error(`Unknown cryptocurrency symbol: ${symbol}`)
    }

    const response = await fetch(`${COINGECKO_API_BASE}/simple/price?ids=${coinGeckoId}&vs_currencies=usd`)

    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status}`)
    }

    const data = await response.json()
    return data[coinGeckoId]?.usd || 0
  } catch (error) {
    console.error("[v0] Error fetching crypto price:", error)
    // Return fallback price from mock data
    const fallbackData = getFallbackData()
    const crypto = fallbackData.find((c) => c.symbol === symbol.toUpperCase())
    return crypto?.price || 0
  }
}
