"use client"

import { useState, useMemo, useEffect } from "react"
import { CryptoHeader } from "@/components/crypto-header"
import { CryptoTable, type CryptoData } from "@/components/crypto-table"
import { CryptoFilters } from "@/components/crypto-filters"
import { CryptoCalculator } from "@/components/crypto-calculator"
import { CryptoPagination } from "@/components/crypto-pagination"
import { useFavorites } from "@/hooks/use-favorites"
import { Button } from "@/components/ui/button"
import { fetchCryptoData } from "@/lib/crypto-api"
import { AlertCircle, Wifi, WifiOff } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [showCalculator, setShowCalculator] = useState(false)
  const [showFavorites, setShowFavorites] = useState(false)
  const [cryptoData, setCryptoData] = useState<CryptoData[]>([])
  const [sortBy, setSortBy] = useState("market_cap_rank")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isOnline, setIsOnline] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(25)
  const { favorites, toggleFavorite, isLoaded } = useFavorites()

  useEffect(() => {
    loadCryptoData()

    // Set up online/offline detection
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  const loadCryptoData = async () => {
    try {
      setIsLoading(true)
      setError(null)
      console.log("[v0] Loading crypto data...")

      const data = await fetchCryptoData()
      setCryptoData(data)
      console.log("[v0] Crypto data loaded successfully:", data.length, "cryptocurrencies")
    } catch (err) {
      console.error("[v0] Error loading crypto data:", err)
      setError(err instanceof Error ? err.message : "Failed to load cryptocurrency data")
    } finally {
      setIsLoading(false)
    }
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    console.log("[v0] Refreshing crypto data...")

    try {
      await loadCryptoData()
      setError(null)
      console.log("[v0] Crypto data refreshed successfully")
    } catch (err) {
      console.error("[v0] Error refreshing crypto data:", err)
      setError(err instanceof Error ? err.message : "Failed to refresh cryptocurrency data")
    } finally {
      setIsRefreshing(false)
    }
  }

  const handleSortChange = (newSortBy: string, newSortOrder: "asc" | "desc") => {
    setSortBy(newSortBy)
    setSortOrder(newSortOrder)
  }

  const filteredAndSortedCryptos = useMemo(() => {
    let filtered = cryptoData.filter(
      (crypto) =>
        crypto.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        crypto.symbol.toLowerCase().includes(searchQuery.toLowerCase()),
    )

    if (showFavorites) {
      filtered = filtered.filter((crypto) => favorites.includes(crypto.id))
    }

    // Sort the filtered results
    filtered.sort((a, b) => {
      let aValue: number | string
      let bValue: number | string

      switch (sortBy) {
        case "name":
          aValue = a.name.toLowerCase()
          bValue = b.name.toLowerCase()
          break
        case "price":
        case "current_price":
          aValue = a.price
          bValue = b.price
          break
        case "change24h":
        case "price_change_percentage_24h":
          aValue = a.change24h
          bValue = b.change24h
          break
        case "marketCap":
        case "market_cap":
          aValue = a.marketCap
          bValue = b.marketCap
          break
        case "rank":
        case "market_cap_rank":
        default:
          aValue = a.rank
          bValue = b.rank
          break
      }

      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortOrder === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue)
      }

      return sortOrder === "asc" ? (aValue as number) - (bValue as number) : (bValue as number) - (aValue as number)
    })

    return filtered
  }, [cryptoData, searchQuery, showFavorites, favorites, sortBy, sortOrder])

  const paginatedCryptos = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return filteredAndSortedCryptos.slice(startIndex, endIndex)
  }, [filteredAndSortedCryptos, currentPage, itemsPerPage])

  const totalPages = Math.ceil(filteredAndSortedCryptos.length / itemsPerPage)

  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, showFavorites, sortBy, sortOrder])

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    // Scroll to top when page changes
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage)
    setCurrentPage(1)
  }

  if (!isLoaded || isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center mx-auto mb-4">
            <span className="text-primary-foreground font-bold text-sm">₿</span>
          </div>
          <p className="text-muted-foreground">
            {isLoading ? "Loading live cryptocurrency data..." : "Loading CryptoTracker Pro..."}
          </p>
          {isLoading && (
            <div className="mt-4 flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Wifi className="h-4 w-4 animate-pulse" />
              <span>Fetching real-time prices from CoinGecko</span>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <CryptoHeader
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onRefresh={handleRefresh}
        onCalculatorToggle={() => setShowCalculator(!showCalculator)}
        onFavoritesToggle={() => setShowFavorites(!showFavorites)}
        isRefreshing={isRefreshing}
        showingFavorites={showFavorites}
        showingCalculator={showCalculator}
      />

      <CryptoCalculator cryptos={cryptoData} isOpen={showCalculator} onClose={() => setShowCalculator(false)} />

      <main className="container mx-auto px-4 py-6">
        {!isOnline && (
          <Alert className="mb-6 border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950">
            <WifiOff className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-800 dark:text-orange-200">
              You're currently offline. Showing cached data. Connect to the internet to get live updates.
            </AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800 dark:text-red-200">
              {error}. Showing fallback data.
            </AlertDescription>
          </Alert>
        )}

        <div className="text-center py-6 sm:py-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-balance mb-4">
            {showFavorites ? "Your Favorite Cryptocurrencies" : "Real-time Cryptocurrency Market Data"}
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto text-pretty px-4">
            {showFavorites
              ? `Track your ${favorites.length} favorite cryptocurrencies and their performance.`
              : "Track the latest prices, market caps, and rankings of the top 200 cryptocurrencies. Stay informed with real-time data and powerful tools."}
          </p>
          <div className="mt-4 flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Wifi className={`h-4 w-4 ${isOnline ? "text-green-500" : "text-orange-500"}`} />
            <span>{isOnline ? "Live data from CoinGecko API" : "Offline - cached data"}</span>
          </div>
        </div>

        <CryptoFilters
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSortChange={handleSortChange}
          totalResults={filteredAndSortedCryptos.length}
          showingFavorites={showFavorites}
        />

        <CryptoTable cryptos={paginatedCryptos} favorites={favorites} onToggleFavorite={toggleFavorite} />

        <CryptoPagination
          currentPage={currentPage}
          totalPages={totalPages}
          itemsPerPage={itemsPerPage}
          totalItems={filteredAndSortedCryptos.length}
          onPageChange={handlePageChange}
          onItemsPerPageChange={handleItemsPerPageChange}
        />

        {filteredAndSortedCryptos.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-base sm:text-lg px-4">
              {showFavorites
                ? "No favorite cryptocurrencies yet. Click the heart icon to add some!"
                : searchQuery
                  ? `No cryptocurrencies found matching "${searchQuery}".`
                  : "No cryptocurrencies found."}
            </p>
            {searchQuery && (
              <Button variant="outline" onClick={() => setSearchQuery("")} className="mt-4">
                Clear search
              </Button>
            )}
          </div>
        )}
      </main>

      <footer className="border-t bg-muted/30 mt-16">
        <div className="container mx-auto px-4 py-6 sm:py-8">
          <div className="text-center">
            <p className="text-xs sm:text-sm text-muted-foreground">
              © 2025 CryptoTracker Pro. Built for portfolio showcase.
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Live data provided by CoinGecko API. Not financial advice.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
