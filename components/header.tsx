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
}

export function Header({
  searchQuery,
  onSearchChange,
  onRefresh,
  onCalculatorOpen,
  isDarkMode,
  onThemeToggle,
}: HeaderProps) {
  const handleRefresh = () => {
    const btn = document.getElementById("refresh-btn")
    btn?.classList.add("animate-spin")
    onRefresh()
    setTimeout(() => btn?.classList.remove("animate-spin"), 1000)
  }

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="max-w-[1400px] mx-auto px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">CryptoTracker Pro</h1>
              <p className="text-sm text-gray-500">Real-time market data</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              id="refresh-btn"
              variant="ghost"
              size="icon"
              className="rounded-lg hover:bg-gray-100 transition-all cursor-pointer"
              onClick={handleRefresh}
            >
              <RefreshCw className="w-4 h-4 text-gray-600" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <Heart className="w-4 h-4 text-gray-600 hover:text-red-500 transition-colors" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
              onClick={onCalculatorOpen}
            >
              <Calculator className="w-4 h-4 text-gray-600" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={`rounded-lg transition-all cursor-pointer ${isDarkMode ? "bg-gray-100 hover:bg-gray-200" : "hover:bg-gray-100"}`}
              onClick={onThemeToggle}
            >
              {isDarkMode ? (
                <Moon className="w-4 h-4 text-gray-600 animate-theme-toggle" />
              ) : (
                <Sun className="w-4 h-4 text-gray-600 animate-theme-toggle" />
              )}
            </Button>
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search cryptocurrencies..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 rounded-lg border-gray-200 focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
      </div>
    </header>
  )
}
