"use client"

import { ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"

interface CryptoFiltersProps {
  sortBy: string
  sortOrder: "asc" | "desc"
  onSortChange: (sortBy: string, sortOrder: "asc" | "desc") => void
  totalResults: number
  showingFavorites: boolean
}

export function CryptoFilters({ sortBy, sortOrder, onSortChange, totalResults, showingFavorites }: CryptoFiltersProps) {
  const sortOptions = [
    { value: "market_cap_rank", label: "Rank" },
    { value: "current_price", label: "Price" },
    { value: "market_cap", label: "Market Cap" },
    { value: "name", label: "Name" },
    { value: "price_change_percentage_24h", label: "24h Change" },
  ]

  const currentSortLabel = sortOptions.find((option) => option.value === sortBy)?.label || "Rank"

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
      <div className="flex items-center gap-2">
        <Badge variant="secondary" className="text-xs sm:text-sm">
          {totalResults} {totalResults === 1 ? "crypto" : "cryptos"}
          {showingFavorites && " in favorites"}
        </Badge>
      </div>

      <div className="flex items-center gap-2 w-full sm:w-auto">
        <span className="text-sm text-muted-foreground hidden sm:inline">Sort by:</span>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2 w-full sm:w-auto justify-between bg-transparent">
              <span className="truncate">{currentSortLabel}</span>
              <div className="flex items-center gap-1">
                <span className="text-xs text-muted-foreground">{sortOrder === "asc" ? "↑" : "↓"}</span>
                <ChevronDown className="h-4 w-4" />
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            {sortOptions.map((option) => (
              <DropdownMenuItem
                key={option.value}
                onClick={() => {
                  const newOrder = sortBy === option.value && sortOrder === "asc" ? "desc" : "asc"
                  onSortChange(option.value, newOrder)
                }}
                className="flex items-center justify-between"
              >
                <span>{option.label}</span>
                {sortBy === option.value && (
                  <span className="text-xs text-muted-foreground">{sortOrder === "asc" ? "↑" : "↓"}</span>
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
