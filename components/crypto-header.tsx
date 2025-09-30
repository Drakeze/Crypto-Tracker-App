"use client"

import { Calculator, Heart, RefreshCw, Search, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Calculator, Heart, RefreshCw, Search, X } from "lucide-react"
import { useState } from "react"

interface CryptoHeaderProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  onRefresh: () => void
  onCalculatorToggle: () => void
  onFavoritesToggle: () => void
  isRefreshing: boolean
  showingFavorites: boolean
  showingCalculator: boolean
}

export function CryptoHeader({
  searchQuery,
  onSearchChange,
  onRefresh,
  onCalculatorToggle,
  onFavoritesToggle,
  isRefreshing,
  showingFavorites,
  showingCalculator,
}: CryptoHeaderProps) {
  const [showMobileSearch, setShowMobileSearch] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">CT</span>
            </div>
            <h1 className="text-lg sm:text-xl font-bold text-balance">Crypto Tracker</h1>
          </div>

          {/* Desktop Search */}
          <div className="hidden md:flex items-center gap-2 flex-1 max-w-md">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search cryptocurrencies..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-10 pr-10"
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onSearchChange("")}
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6"
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
          </div>

          {/* Mobile Search Toggle */}
          <div className="md:hidden">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowMobileSearch(!showMobileSearch)}
              className="h-9 w-9"
            >
              {showMobileSearch ? <X className="h-4 w-4" /> : <Search className="h-4 w-4" />}
            </Button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1 sm:gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={onRefresh}
              disabled={isRefreshing}
              className="h-9 w-9 bg-transparent"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
              <span className="sr-only">Refresh data</span>
            </Button>

            <Button
              variant={showingFavorites ? "default" : "outline"}
              size="icon"
              onClick={onFavoritesToggle}
              className="h-9 w-9 bg-transparent"
            >
              <Heart className={`h-4 w-4 ${showingFavorites ? "fill-current" : ""}`} />
              <span className="sr-only">Toggle favorites</span>
            </Button>

            <Button
              variant={showingCalculator ? "default" : "outline"}
              size="icon"
              onClick={onCalculatorToggle}
              className="h-9 w-9 bg-transparent"
            >
              <Calculator className="h-4 w-4" />
              <span className="sr-only">Toggle calculator</span>
            </Button>

            <ThemeToggle />
          </div>
        </div>

        {/* Mobile Search Bar */}
        {showMobileSearch && (
          <div className="md:hidden mt-4 animate-in slide-in-from-top-2 duration-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search cryptocurrencies..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-10 pr-10"
                autoFocus
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onSearchChange("")}
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6"
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
