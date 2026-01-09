import { formatCurrency } from "@/lib/utils"
import type { GlobalMarketData } from "@/lib/types/crypto"
import { ArrowUp, ArrowDown } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

interface GlobalStatsProps {
  data: GlobalMarketData | null
  isLoading?: boolean
}

export function GlobalStats({ data, isLoading = false }: GlobalStatsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-card rounded-xl p-6 border">
            <Skeleton className="h-4 w-32 mb-2" />
            <Skeleton className="h-8 w-48 mb-4" />
            <Skeleton className="h-4 w-24" />
          </div>
        ))}
      </div>
    )
  }

  if (!data) return null

  const marketCapChange = 2.4
  const volumeChange = -1.2
  const btcDominance = data.market_cap_percentage.btc

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div className="bg-card rounded-xl p-6 border">
        <h3 className="text-sm font-medium text-muted-foreground mb-2">Total Market Cap</h3>
        <p className="text-2xl font-bold mb-2">{formatCurrency(data.total_market_cap.usd)}</p>
        <div className={`flex items-center gap-1 text-sm ${marketCapChange >= 0 ? "text-emerald-600" : "text-red-600"}`}>
          {marketCapChange >= 0 ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
          {Math.abs(marketCapChange)}%
        </div>
      </div>

      <div className="bg-card rounded-xl p-6 border">
        <h3 className="text-sm font-medium text-muted-foreground mb-2">24h Volume</h3>
        <p className="text-2xl font-bold mb-2">{formatCurrency(data.total_volume.usd)}</p>
        <div className={`flex items-center gap-1 text-sm ${volumeChange >= 0 ? "text-emerald-600" : "text-red-600"}`}>
          {volumeChange >= 0 ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
          {Math.abs(volumeChange)}%
        </div>
      </div>

      <div className="bg-card rounded-xl p-6 border">
        <h3 className="text-sm font-medium text-muted-foreground mb-2">BTC Dominance</h3>
        <p className="text-2xl font-bold mb-2">{btcDominance.toFixed(1)}%</p>
        <p className="text-sm text-muted-foreground">Market share</p>
      </div>
    </div>
  )
}
