"use client"

import { useState, useEffect } from "react"
import { GlobalStats } from "@/components/global-stats"
import { CryptoTable } from "@/components/crypto-table"
import { Header } from "@/components/header"
import { Attribution } from "@/components/attribution"
import { CryptoConverterModal } from "@/components/crypto-converter-modal"
import type { GlobalMarketData, MarketCoin } from "@/lib/types/crypto"

export function CryptoTracker() {
  const [searchQuery, setSearchQuery] = useState("")
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const globalData: GlobalMarketData | null = null
  const coins: MarketCoin[] = []
  const isLoading = false
  const isRefreshing = false
  const errorMessage: string | null = null

  const handleRefresh = () => {}

  useEffect(() => {
    const savedTheme = localStorage.getItem("crypto-theme")
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
    setIsDarkMode(savedTheme ? savedTheme === "dark" : prefersDark)
  }, [])

  useEffect(() => {
    const root = document.documentElement
    root.classList.toggle("dark", isDarkMode)
    localStorage.setItem("crypto-theme", isDarkMode ? "dark" : "light")
  }, [isDarkMode])

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors">
      <Header
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onRefresh={handleRefresh}
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
