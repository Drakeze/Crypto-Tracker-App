import { NextResponse } from "next/server"

import { fetchCoinPriceBySymbol } from "@/lib/services/coingecko"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const symbol = searchParams.get("symbol")

  if (!symbol) {
    return NextResponse.json({ error: "Missing symbol" }, { status: 400 })
  }

  try {
    const price = await fetchCoinPriceBySymbol(symbol)
    return NextResponse.json({ data: { price } })
  } catch (error) {
    console.error("[api] Failed to fetch coin price", error)
    return NextResponse.json({ error: "Unable to fetch coin price" }, { status: 502 })
  }
}
