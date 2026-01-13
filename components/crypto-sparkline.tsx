"use client"

import { Sparkline } from "@/components/sparkline"

interface CryptoSparklineProps {
  data: number[]
  isPositive: boolean
}

export function CryptoSparkline({ data, isPositive }: CryptoSparklineProps) {
  return <Sparkline data={data} positive={isPositive} />
}
