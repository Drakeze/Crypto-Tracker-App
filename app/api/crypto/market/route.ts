import { NextResponse } from "next/server"

import { fetchMarketCoins } from "@/lib/services/coingecko"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const perPageParam = Number(searchParams.get("perPage") ?? "300")
  const pageParam = Number(searchParams.get("page") ?? "1")
  const perPage = Number.isFinite(perPageParam) ? perPageParam : 300
  const page = Number.isFinite(pageParam) ? pageParam : 1
  const currency = (searchParams.get("currency") ?? "usd").toLowerCase()
  const includeSparkline = searchParams.get("sparkline") !== "false"

  try {
    const data = await fetchMarketCoins({ perPage, page, currency, includeSparkline })
    return NextResponse.json({ data })
  } catch (error) {
    console.error("[api] Failed to fetch market coins", error)
    return NextResponse.json({ error: "Unable to fetch market data" }, { status: 502 })
  }
}
