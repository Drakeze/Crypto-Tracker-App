"use client"
import { Heart, TrendingUp, TrendingDown, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export interface CryptoData {
  id: number
  name: string
  symbol: string
  price: number
  marketCap: number
  change24h: number
  rank: number
  coinGeckoId: string
}

interface CryptoTableProps {
  cryptos: CryptoData[]
  favorites: number[]
  onToggleFavorite: (id: number) => void
}

export function CryptoTable({ cryptos, favorites, onToggleFavorite }: CryptoTableProps) {
  const formatPrice = (price: number) => {
    if (price < 1) {
      return `$${price.toFixed(4)}`
    }
    return `$${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  const formatMarketCap = (marketCap: number) => {
    if (marketCap >= 1e12) {
      return `$${(marketCap / 1e12).toFixed(2)}T`
    }
    if (marketCap >= 1e9) {
      return `$${(marketCap / 1e9).toFixed(2)}B`
    }
    if (marketCap >= 1e6) {
      return `$${(marketCap / 1e6).toFixed(2)}M`
    }
    return `$${marketCap.toLocaleString()}`
  }

  const formatChange = (change: number) => {
    const isPositive = change >= 0
    return (
      <div className={`flex items-center gap-1 ${isPositive ? "text-green-600" : "text-red-600"}`}>
        {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
        <span className="font-medium">
          {isPositive ? "+" : ""}
          {change.toFixed(2)}%
        </span>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Desktop Table View */}
      <div className="hidden md:block">
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr className="border-b">
                  <th className="text-left p-4 font-semibold text-sm">Rank</th>
                  <th className="text-left p-4 font-semibold text-sm">Name</th>
                  <th className="text-right p-4 font-semibold text-sm">Price</th>
                  <th className="text-right p-4 font-semibold text-sm">24h Change</th>
                  <th className="text-right p-4 font-semibold text-sm">Market Cap</th>
                  <th className="text-center p-4 font-semibold text-sm">Favorite</th>
                </tr>
              </thead>
              <tbody>
                {cryptos.map((crypto) => {
                  const isFavorited = favorites.includes(crypto.id)
                  return (
                    <tr key={crypto.id} className="border-b hover:bg-muted/30 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="font-mono">
                            #{crypto.rank}
                          </Badge>
                          {crypto.rank <= 3 && <Star className="h-3 w-3 text-primary fill-primary" />}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-xs font-bold text-primary">{crypto.symbol.slice(0, 2)}</span>
                          </div>
                          <div>
                            <div className="font-semibold flex items-center gap-2">
                              {crypto.name}
                              {isFavorited && <Heart className="h-3 w-3 text-red-500 fill-red-500" />}
                            </div>
                            <div className="text-sm text-muted-foreground font-mono">{crypto.symbol}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-right font-mono font-semibold">{formatPrice(crypto.price)}</td>
                      <td className="p-4 text-right">{formatChange(crypto.change24h)}</td>
                      <td className="p-4 text-right font-mono font-medium">{formatMarketCap(crypto.marketCap)}</td>
                      <td className="p-4 text-center">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onToggleFavorite(crypto.id)}
                          className={`h-8 w-8 transition-all ${
                            isFavorited ? "hover:bg-red-50 dark:hover:bg-red-950" : "hover:bg-muted"
                          }`}
                        >
                          <Heart
                            className={`h-4 w-4 transition-all ${
                              isFavorited
                                ? "fill-red-500 text-red-500 scale-110"
                                : "text-muted-foreground hover:text-red-500 hover:scale-110"
                            }`}
                          />
                        </Button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-3">
        {cryptos.map((crypto) => {
          const isFavorited = favorites.includes(crypto.id)
          return (
            <Card key={crypto.id} className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="font-mono text-xs">
                      #{crypto.rank}
                    </Badge>
                    {crypto.rank <= 3 && <Star className="h-3 w-3 text-primary fill-primary" />}
                  </div>
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-xs font-bold text-primary">{crypto.symbol.slice(0, 2)}</span>
                  </div>
                  <div>
                    <div className="font-semibold text-sm flex items-center gap-2">
                      {crypto.name}
                      {isFavorited && <Heart className="h-3 w-3 text-red-500 fill-red-500" />}
                    </div>
                    <div className="text-xs text-muted-foreground font-mono">{crypto.symbol}</div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onToggleFavorite(crypto.id)}
                  className={`h-8 w-8 transition-all ${
                    isFavorited ? "hover:bg-red-50 dark:hover:bg-red-950" : "hover:bg-muted"
                  }`}
                >
                  <Heart
                    className={`h-4 w-4 transition-all ${
                      isFavorited
                        ? "fill-red-500 text-red-500 scale-110"
                        : "text-muted-foreground hover:text-red-500 hover:scale-110"
                    }`}
                  />
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-muted-foreground text-xs mb-1">Price</div>
                  <div className="font-mono font-semibold">{formatPrice(crypto.price)}</div>
                </div>
                <div>
                  <div className="text-muted-foreground text-xs mb-1">24h Change</div>
                  {formatChange(crypto.change24h)}
                </div>
                <div className="col-span-2">
                  <div className="text-muted-foreground text-xs mb-1">Market Cap</div>
                  <div className="font-mono font-medium">{formatMarketCap(crypto.marketCap)}</div>
                </div>
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
