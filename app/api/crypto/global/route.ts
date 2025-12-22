import { NextResponse } from "next/server"

import { fetchGlobalMarketData } from "@/lib/services/coingecko"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const data = await fetchGlobalMarketData()
    return NextResponse.json({ data })
  } catch (error) {
    console.error("[api] Failed to fetch global market data", error)
    return NextResponse.json({ error: "Unable to fetch global market data" }, { status: 502 })
  }
}
