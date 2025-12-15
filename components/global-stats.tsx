"use client"

import type { GlobalMarketData } from "@/lib/crypto-api"

interface GlobalStatsProps {
  data: GlobalMarketData | null
  isLoading: boolean
}

export function GlobalStats({ data, isLoading }: GlobalStatsProps) {
  const formatLargeNumber = (num: number) => {
    if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`
    if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`
    return `$${num.toLocaleString()}`
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-gray-50 rounded-xl p-5 border border-gray-200">
            <div className="h-4 bg-gray-200 rounded w-24 mb-3 animate-pulse" />
            <div className="h-7 bg-gray-200 rounded w-32 animate-pulse" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8 animate-fade-in">
      <div className="bg-gray-50 rounded-xl p-5 border border-gray-200 hover:shadow-md transition-shadow">
        <p className="text-sm font-medium text-gray-600 mb-1">Total Market Cap</p>
        <p className="text-2xl font-semibold text-gray-900">
          {data ? formatLargeNumber(data.total_market_cap.usd) : "-"}
        </p>
      </div>

      <div className="bg-gray-50 rounded-xl p-5 border border-gray-200 hover:shadow-md transition-shadow">
        <p className="text-sm font-medium text-gray-600 mb-1">24h Volume</p>
        <p className="text-2xl font-semibold text-gray-900">{data ? formatLargeNumber(data.total_volume.usd) : "-"}</p>
      </div>

      <div className="bg-gray-50 rounded-xl p-5 border border-gray-200 hover:shadow-md transition-shadow">
        <p className="text-sm font-medium text-gray-600 mb-1">BTC Dominance</p>
        <p className="text-2xl font-semibold text-gray-900">
          {data ? `${data.market_cap_percentage.btc.toFixed(1)}%` : "-"}
        </p>
      </div>

      <div className="bg-gray-50 rounded-xl p-5 border border-gray-200 hover:shadow-md transition-shadow">
        <p className="text-sm font-medium text-gray-600 mb-1">ETH Dominance</p>
        <p className="text-2xl font-semibold text-gray-900">
          {data ? `${data.market_cap_percentage.eth.toFixed(1)}%` : "-"}
        </p>
      </div>
    </div>
  )
}
