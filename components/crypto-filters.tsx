"use client"

import { ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import type { SortKey } from "@/lib/sort-utils"

interface CryptoFiltersProps {
  sortBy: SortKey
  sortOrder: "asc" | "desc"
  onSortChange: (sortBy: SortKey, sortOrder: "asc" | "desc") => void
  totalResults: number
  showingFavorites: boolean
}

export function CryptoFilters({
  sortBy,
  sortOrder,
  onSortChange,
  totalResults,
  showingFavorites,
}: CryptoFiltersProps) {
  const sortOptions: { value: SortKey; label: string }[] = [
    { value: "market_cap_rank", label: "Rank" },
    { value: "name", label: "Name" },
    { value: "current_price", label: "Price" },
    { value: "price_change_percentage_1h_in_currency", label: "1h Change" },
    { value: "price_change_percentage_24h", label: "24h Change" },
    { value: "price_change_percentage_7d_in_currency", label: "7d Change" },
    { value: "market_cap", label: "Market Cap" },
  ]

  const currentSortLabel =
    sortOptions.find((option) => option.value === sortBy)?.label || "Rank"

  const handleSortChange = (selectedValue: SortKey) => {
    const newOrder =
      sortBy === selectedValue && sortOrder === "asc" ? "desc" : "asc"
    onSortChange(selectedValue, newOrder)
  }

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
      {/* Results Badge */}
      <div className="flex items-center gap-2">
        <Badge variant="secondary" className="text-xs sm:text-sm">
          {totalResults} {totalResults === 1 ? "crypto" : "cryptos"}
          {showingFavorites && " in favorites"}
        </Badge>
      </div>

      {/* Sort Dropdown */}
      <div className="flex items-center gap-2 w-full sm:w-auto">
        <span className="text-sm text-muted-foreground hidden sm:inline">
          Sort by:
        </span>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="gap-2 w-full sm:w-auto justify-between bg-transparent"
            >
              <span className="truncate">{currentSortLabel}</span>
              <div className="flex items-center gap-1">
                <span className="text-xs text-muted-foreground">
                  {sortOrder === "asc" ? "↑" : "↓"}
                </span>
                <ChevronDown className="h-4 w-4" />
              </div>
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-48">
            {sortOptions.map((option) => (
              <DropdownMenuItem
                key={option.value}
                onClick={() => handleSortChange(option.value)}
                className="flex items-center justify-between cursor-pointer hover:bg-muted/40"
              >
                <span>{option.label}</span>
                {sortBy === option.value && (
                  <span className="text-xs text-muted-foreground">
                    {sortOrder === "asc" ? "↑" : "↓"}
                  </span>
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}