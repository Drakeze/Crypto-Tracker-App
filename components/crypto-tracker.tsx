"use client"

import { useState, useEffect } from "react"
import { GlobalStats } from "@/components/global-stats"
import { CryptoTable } from "@/components/crypto-table"
import { Header } from "@/components/header"
import { Attribution } from "@/components/attribution"
import { CryptoConverterModal } from "@/components/crypto-converter-modal"
import { fetchGlobalMarketData, fetchMarketCoins, type GlobalMarketData, type MarketCoin } from "@/lib/crypto-api"

export function CryptoTracker() {
  const [globalData, setGlobalData] = useState<GlobalMarketData | null>(null)
  const [coins, setCoins] = useState<MarketCoin[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const fetchData = async () => {
    setErrorMessage(null)
    const isInitialLoad = coins.length === 0 && !globalData
    setIsLoading(isInitialLoad)
    setIsRefreshing(!isInitialLoad)
    try {
      const [globalResponse, coinsResponse] = await Promise.all([fetchGlobalMarketData(), fetchMarketCoins()])
      setGlobalData(globalResponse)
      setCoins(coinsResponse)
    } catch (error) {
      console.error("[v0] Failed to fetch data:", error)
      setErrorMessage("Unable to load market data right now. Please try again.")
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
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
        isRefreshing={isRefreshing}
      />
      <main className="max-w-[1400px] mx-auto px-6 py-10">
        {errorMessage && (
          <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900" role="alert">
            {errorMessage}
          </div>
        )}
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
