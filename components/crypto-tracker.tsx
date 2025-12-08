"use client"

import { useState, useEffect } from "react"
import { GlobalStats } from "@/components/global-stats"
import { CryptoTable } from "@/components/crypto-table"
import { Header } from "@/components/header"
import { Attribution } from "@/components/attribution"
import { CryptoConverterModal } from "@/components/crypto-converter-modal"

interface GlobalData {
  total_market_cap: { usd: number }
  total_volume: { usd: number }
  market_cap_percentage: { btc: number; eth: number }
}

interface Coin {
  id: string
  market_cap_rank: number
  name: string
  symbol: string
  current_price: number
  price_change_percentage_1h_in_currency: number
  price_change_percentage_24h: number
  price_change_percentage_7d_in_currency: number
  market_cap: number
  sparkline_in_7d: { price: number[] }
  image: string
}

export function CryptoTracker() {
  const [globalData, setGlobalData] = useState<GlobalData | null>(null)
  const [coins, setCoins] = useState<Coin[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(false)

  const fetchData = async () => {
    setIsLoading(true)
    try {
      const [globalResponse, coinsResponse] = await Promise.all([
        fetch("https://api.coingecko.com/api/v3/global"),
        fetch(
          "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=300&page=1&sparkline=true&price_change_percentage=1h,24h,7d",
        ),
      ])
      const globalData = await globalResponse.json()
      const coinsData = await coinsResponse.json()
      setGlobalData(globalData.data)
      setCoins(coinsData)
    } catch (error) {
      console.error("[v0] Failed to fetch data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  return (
    <div className="min-h-screen bg-white">
      <Header
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onRefresh={fetchData}
        onCalculatorOpen={() => setIsCalculatorOpen(true)}
        isDarkMode={isDarkMode}
        onThemeToggle={() => setIsDarkMode(!isDarkMode)}
      />
      <main className="max-w-[1400px] mx-auto px-6 py-10">
        <div className="mb-8">
          <GlobalStats data={globalData} isLoading={isLoading} />
        </div>
        <CryptoTable coins={coins} isLoading={isLoading} searchQuery={searchQuery} />
        <Attribution />
      </main>
      <CryptoConverterModal isOpen={isCalculatorOpen} onClose={() => setIsCalculatorOpen(false)} coins={coins} />
    </div>
  )
}
