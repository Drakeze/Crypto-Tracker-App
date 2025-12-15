"use client"

import type React from "react"

import { useEffect, useMemo, useState } from "react"
import { ChevronUp, ChevronDown, Heart, ChevronLeft, ChevronRight } from "lucide-react"
import { Sparkline } from "@/components/sparkline"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useFavorites } from "@/hooks/use-favorites"
import type { MarketCoin } from "@/lib/crypto-api"

type Coin = MarketCoin

type SortKey =
  | "market_cap_rank"
  | "name"
  | "current_price"
  | "price_change_percentage_1h_in_currency"
  | "price_change_percentage_24h"
  | "price_change_percentage_7d_in_currency"
  | "market_cap"
type SortDirection = "asc" | "desc"

interface CryptoTableProps {
  coins: Coin[]
  isLoading: boolean
  searchQuery: string
}

export function CryptoTable({ coins, isLoading, searchQuery }: CryptoTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>("market_cap_rank")
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(50)
  const { favorites, toggleFavorite } = useFavorites()

  const favoritesSet = useMemo(() => new Set(favorites), [favorites])

  useEffect(() => {
    setCurrentPage(1)
  }, [itemsPerPage])

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortKey(key)
      setSortDirection("asc")
    }
  }

  const filteredCoins = useMemo(() => {
    if (!searchQuery.trim()) return coins
    const query = searchQuery.toLowerCase()
    return coins.filter(
      (coin) =>
        coin.name.toLowerCase().includes(query) ||
        coin.symbol.toLowerCase().includes(query) ||
        coin.id.toLowerCase().includes(query),
    )
  }, [coins, searchQuery])

  const sortedCoins = useMemo(() => {
    return [...filteredCoins].sort((a, b) => {
      let aValue: any = a[sortKey]
      let bValue: any = b[sortKey]

      if (sortKey === "name") {
        aValue = a.name.toLowerCase()
        bValue = b.name.toLowerCase()
      } else {
        aValue = aValue ?? 0
        bValue = bValue ?? 0
      }

      if (sortDirection === "asc") {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })
  }, [filteredCoins, sortKey, sortDirection])

  const totalPages = Math.ceil(sortedCoins.length / itemsPerPage)
  const paginatedCoins = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return sortedCoins.slice(startIndex, startIndex + itemsPerPage)
  }, [sortedCoins, currentPage, itemsPerPage])

  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(Number(value))
  }

  const handleToggleFavorite = (coinId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    toggleFavorite(coinId)
  }

  const SortIcon = ({ columnKey }: { columnKey: SortKey }) => {
    if (sortKey !== columnKey) return null
    return sortDirection === "asc" ? (
      <ChevronUp className="w-4 h-4 inline ml-1 transition-transform" />
    ) : (
      <ChevronDown className="w-4 h-4 inline ml-1 transition-transform" />
    )
  }

  const formatPrice = (price: number | null | undefined) => {
    if (price === null || price === undefined) return "-"
    if (price < 1) return `$${price.toFixed(6)}`
    if (price < 10) return `$${price.toFixed(4)}`
    return `$${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  const formatMarketCap = (cap: number | null | undefined) => {
    if (cap === null || cap === undefined) return "-"
    if (cap >= 1e12) return `$${(cap / 1e12).toFixed(2)}T`
    if (cap >= 1e9) return `$${(cap / 1e9).toFixed(2)}B`
    if (cap >= 1e6) return `$${(cap / 1e6).toFixed(2)}M`
    return `$${cap.toLocaleString()}`
  }

  const formatChange = (change: number | null) => {
    if (change === null || change === undefined) return "-"
    const formatted = change.toFixed(2)
    const color = change >= 0 ? "text-green-600" : "text-red-600"
    return (
      <span className={color}>
        {change >= 0 ? "+" : ""}
        {formatted}%
      </span>
    )
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {["Rank", "Name", "Price", "1h", "24h", "7d", "Market Cap", "7d Chart", ""].map((header, i) => (
                  <th
                    key={i}
                    className="px-4 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[...Array(10)].map((_, i) => (
                <tr key={i} className="border-b border-gray-100">
                  <td className="px-4 py-4">
                    <div className="h-4 bg-gray-200 rounded w-8 animate-pulse" />
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse" />
                      <div>
                        <div className="h-4 bg-gray-200 rounded w-24 mb-1 animate-pulse" />
                        <div className="h-3 bg-gray-200 rounded w-12 animate-pulse" />
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="h-4 bg-gray-200 rounded w-20 animate-pulse" />
                  </td>
                  <td className="px-4 py-4">
                    <div className="h-4 bg-gray-200 rounded w-12 animate-pulse" />
                  </td>
                  <td className="px-4 py-4">
                    <div className="h-4 bg-gray-200 rounded w-12 animate-pulse" />
                  </td>
                  <td className="px-4 py-4">
                    <div className="h-4 bg-gray-200 rounded w-12 animate-pulse" />
                  </td>
                  <td className="px-4 py-4">
                    <div className="h-4 bg-gray-200 rounded w-20 animate-pulse" />
                  </td>
                  <td className="px-4 py-4">
                    <div className="h-12 bg-gray-200 rounded w-24 animate-pulse" />
                  </td>
                  <td className="px-4 py-4">
                    <div className="h-4 bg-gray-200 rounded w-4 animate-pulse" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">Sort by:</span>
          <Select
            value={sortKey}
            onValueChange={(value) => {
              setSortKey(value as SortKey)
              setSortDirection("asc")
            }}
          >
            <SelectTrigger className="w-[180px] rounded-lg border-gray-200 cursor-pointer">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="market_cap_rank">Rank</SelectItem>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="current_price">Price</SelectItem>
              <SelectItem value="market_cap">Market Cap</SelectItem>
              <SelectItem value="price_change_percentage_1h_in_currency">1h Change</SelectItem>
              <SelectItem value="price_change_percentage_24h">24h Change</SelectItem>
              <SelectItem value="price_change_percentage_7d_in_currency">7d Change</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="text-sm text-gray-500">
          Showing {filteredCoins.length} {filteredCoins.length === 1 ? "cryptocurrency" : "cryptocurrencies"}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm animate-fade-in">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200 sticky top-0">
              <tr>
                <th
                  className="px-4 py-5 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:text-indigo-600 transition-colors"
                  onClick={() => handleSort("market_cap_rank")}
                >
                  Rank <SortIcon columnKey="market_cap_rank" />
                </th>
                <th
                  className="px-4 py-5 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:text-indigo-600 transition-colors"
                  onClick={() => handleSort("name")}
                >
                  Name <SortIcon columnKey="name" />
                </th>
                <th
                  className="px-4 py-5 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:text-indigo-600 transition-colors"
                  onClick={() => handleSort("current_price")}
                >
                  Price <SortIcon columnKey="current_price" />
                </th>
                <th
                  className="px-4 py-5 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:text-indigo-600 transition-colors"
                  onClick={() => handleSort("price_change_percentage_1h_in_currency")}
                >
                  1h <SortIcon columnKey="price_change_percentage_1h_in_currency" />
                </th>
                <th
                  className="px-4 py-5 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:text-indigo-600 transition-colors"
                  onClick={() => handleSort("price_change_percentage_24h")}
                >
                  24h <SortIcon columnKey="price_change_percentage_24h" />
                </th>
                <th
                  className="px-4 py-5 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:text-indigo-600 transition-colors"
                  onClick={() => handleSort("price_change_percentage_7d_in_currency")}
                >
                  7d <SortIcon columnKey="price_change_percentage_7d_in_currency" />
                </th>
                <th
                  className="px-4 py-5 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:text-indigo-600 transition-colors"
                  onClick={() => handleSort("market_cap")}
                >
                  Market Cap <SortIcon columnKey="market_cap" />
                </th>
                <th className="px-4 py-5 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Last 7 Days
                </th>
                <th className="px-4 py-5 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider"></th>
              </tr>
            </thead>
            <tbody>
              {paginatedCoins.map((coin, index) => (
                <tr
                  key={coin.id}
                  className="border-b border-gray-100 hover:bg-gray-50 transition-colors animate-fade-in"
                  style={{ animationDelay: `${index * 10}ms` }}
                >
                  <td className="px-4 py-5 text-sm text-gray-600 font-medium">{coin.market_cap_rank ?? "-"}</td>
                  <td className="px-4 py-5">
                    <div className="flex items-center gap-3">
                      <img src={coin.image || "/placeholder.svg"} alt={coin.name} className="w-8 h-8 rounded-full" />
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{coin.name}</p>
                        <p className="text-xs text-gray-500 uppercase">{coin.symbol}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-5 text-sm font-bold text-gray-900">{formatPrice(coin.current_price)}</td>
                  <td className="px-4 py-5 text-sm font-medium">
                    {formatChange(coin.price_change_percentage_1h_in_currency)}
                  </td>
                  <td className="px-4 py-5 text-sm font-medium">{formatChange(coin.price_change_percentage_24h)}</td>
                  <td className="px-4 py-5 text-sm font-medium">
                    {formatChange(coin.price_change_percentage_7d_in_currency)}
                  </td>
                  <td className="px-4 py-5 text-sm font-semibold text-gray-900">{formatMarketCap(coin.market_cap)}</td>
                  <td className="px-4 py-5">
                    <div className="bg-gray-50 rounded-lg px-2 py-1">
                      <Sparkline
                        data={coin.sparkline_in_7d?.price || []}
                        positive={(coin.price_change_percentage_7d_in_currency ?? 0) >= 0}
                      />
                    </div>
                  </td>
                  <td className="px-4 py-5">
                    <button
                      onClick={(e) => handleToggleFavorite(coin.id, e)}
                      className="hover:scale-125 transition-transform active:scale-95 cursor-pointer"
                    >
                      <Heart
                        className={`w-5 h-5 transition-all ${favoritesSet.has(coin.id) ? "fill-red-500 text-red-500 animate-heart-pop" : "text-gray-400 hover:text-red-400"}`}
                      />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex items-center justify-between bg-white rounded-xl border border-gray-200 px-6 py-4 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Rows per page:</span>
          <Select value={itemsPerPage.toString()} onValueChange={handleItemsPerPageChange}>
            <SelectTrigger className="w-[80px] rounded-lg border-gray-200 cursor-pointer">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="25">25</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
              <SelectItem value="200">200</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">
            Page {currentPage} of {totalPages}
          </span>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-lg bg-transparent cursor-pointer"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            {[...Array(Math.min(5, totalPages))].map((_, i) => {
              let pageNum
              if (totalPages <= 5) {
                pageNum = i + 1
              } else if (currentPage <= 3) {
                pageNum = i + 1
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i
              } else {
                pageNum = currentPage - 2 + i
              }

              return (
                <Button
                  key={i}
                  variant={currentPage === pageNum ? "default" : "outline"}
                  size="icon"
                  className={`h-8 w-8 rounded-lg cursor-pointer ${currentPage === pageNum ? "bg-indigo-600 hover:bg-indigo-700" : ""}`}
                  onClick={() => setCurrentPage(pageNum)}
                >
                  {pageNum}
                </Button>
              )
            })}
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-lg bg-transparent cursor-pointer"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
