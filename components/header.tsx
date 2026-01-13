"use client"

import { RefreshCw, Heart, Calculator, Sun, Moon, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface HeaderProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  onRefresh: () => void
  onCalculatorOpen: () => void
  isDarkMode: boolean
  onThemeToggle: () => void
  isRefreshing: boolean
}

export function Header({
  searchQuery,
  onSearchChange,
  onRefresh,
  onCalculatorOpen,
  isDarkMode,
  onThemeToggle,
  isRefreshing,
}: HeaderProps) {
  return (
    <header className="border-b border-border bg-background">
      <div className="max-w-[1400px] mx-auto px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-semibold text-foreground">CryptoTracker Pro</h1>
              <p className="text-sm text-muted-foreground">Real-time market data</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-lg hover:bg-muted transition-all cursor-pointer"
              onClick={onRefresh}
              disabled={isRefreshing}
              aria-busy={isRefreshing}
            >
              <RefreshCw className={`w-4 h-4 text-muted-foreground ${isRefreshing ? "animate-spin" : ""}`} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-lg hover:bg-muted transition-colors cursor-pointer"
            >
              <Heart className="w-4 h-4 text-muted-foreground hover:text-red-500 transition-colors" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-lg hover:bg-muted transition-colors cursor-pointer"
              onClick={onCalculatorOpen}
            >
              <Calculator className="w-4 h-4 text-muted-foreground" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={`rounded-lg transition-all cursor-pointer ${isDarkMode ? "bg-muted hover:bg-muted/80" : "hover:bg-muted"}`}
              onClick={onThemeToggle}
            >
              {isDarkMode ? (
                <Moon className="w-4 h-4 text-muted-foreground animate-theme-toggle" />
              ) : (
                <Sun className="w-4 h-4 text-muted-foreground animate-theme-toggle" />
              )}
            </Button>
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search cryptocurrencies..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 rounded-lg border-input focus:border-primary focus:ring-primary"
          />
        </div>
      </div>
    </header>
  )
}
