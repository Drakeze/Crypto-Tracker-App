import { useMemo } from "react"
import { formatCurrency, formatPercentage } from "@/lib/utils"
import { CryptoSparkline } from "@/components/crypto-sparkline"
import { Button } from "@/components/ui/button"
import { Star, TrendingUp, TrendingDown } from "lucide-react"
import { cn } from "@/lib/utils"
import type { MarketCoin } from "@/lib/types/crypto"
import { Skeleton } from "@/components/ui/skeleton"

interface CryptoTableProps {
  coins: MarketCoin[]
  isLoading?: boolean
  searchQuery?: string
}

export function CryptoTable({ coins, isLoading = false, searchQuery = "" }: CryptoTableProps) {
  const filteredCoins = useMemo(() => {
    return coins.filter((coin) =>
      coin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      coin.symbol.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [coins, searchQuery])

  if (isLoading) {
    return (
      <div className="bg-card rounded-xl border overflow-hidden">
        <div className="p-4">
          <Skeleton className="h-10 w-48" />
        </div>
        <div className="divide-y">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="p-4 grid grid-cols-12 gap-4 items-center">
              <Skeleton className="h-4 w-6 col-span-1" />
              <div className="col-span-4 flex items-center gap-3">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div>
                  <Skeleton className="h-4 w-24 mb-1" />
                  <Skeleton className="h-3 w-12" />
                </div>
              </div>
              <Skeleton className="h-4 w-20 col-span-2" />
              <Skeleton className="h-4 w-16 col-span-2" />
              <Skeleton className="h-4 w-16 col-span-1" />
              <Skeleton className="h-8 w-20 col-span-2" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-card rounded-xl border overflow-hidden">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold">Market Overview</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="text-left p-4 text-sm font-medium text-muted-foreground">#</th>
              <th className="text-left p-4 text-sm font-medium text-muted-foreground">Coin</th>
              <th className="text-right p-4 text-sm font-medium text-muted-foreground">Price</th>
              <th className="text-right p-4 text-sm font-medium text-muted-foreground">24h %</th>
              <th className="text-right p-4 text-sm font-medium text-muted-foreground">Market Cap</th>
              <th className="text-right p-4 text-sm font-medium text-muted-foreground">Last 7 Days</th>
              <th className="text-right p-4 text-sm font-medium text-muted-foreground"></th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filteredCoins.map((coin) => {
              const isPositive = (coin.price_change_percentage_24h ?? 0) >= 0

              return (
                <tr key={coin.id} className="hover:bg-muted/50 transition-colors">
                  <td className="p-4 text-sm text-muted-foreground">{coin.market_cap_rank}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <img src={coin.image} alt={coin.name} className="h-8 w-8" />
                      <div>
                        <div className="font-medium">{coin.name}</div>
                        <div className="text-sm text-muted-foreground uppercase">{coin.symbol}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-right font-medium">{formatCurrency(coin.current_price)}</td>
                  <td className={`p-4 text-right font-medium ${isPositive ? "text-emerald-600" : "text-red-600"}`}>
                    {formatPercentage(coin.price_change_percentage_24h)}
                  </td>
                  <td className="p-4 text-right text-sm text-muted-foreground">{formatCurrency(coin.market_cap)}</td>
                  <td className="p-4 text-right">
                    <CryptoSparkline data={coin.sparkline_in_7d?.price || []} isPositive={isPositive} />
                  </td>
                  <td className="p-4 text-right">
                    <Button variant="ghost" size="sm">
                      <Star className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
