import { NextResponse } from "next/server"

import { databaseDisabledReason, prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

export async function GET() {
  if (!prisma) {
    return NextResponse.json({ data: [], message: databaseDisabledReason }, { status: 503 })
  }

  try {
    const favorites = await prisma.favoriteCoin.findMany({ orderBy: { createdAt: "desc" } })
    return NextResponse.json({ data: favorites })
  } catch (error) {
    console.error("[api] Failed to fetch favorites", error)
    return NextResponse.json({ data: [], error: "Unable to fetch favorites" }, { status: 502 })
  }
}

export async function POST(request: Request) {
  if (!prisma) {
    return NextResponse.json({ data: null, message: databaseDisabledReason }, { status: 503 })
  }

  try {
    const body = await request.json()
    const { coinId, symbol } = body ?? {}

    if (!coinId || !symbol) {
      return NextResponse.json({ error: "coinId and symbol are required" }, { status: 400 })
    }

    const favorite = await prisma.favoriteCoin.create({ data: { coinId, symbol } })
    return NextResponse.json({ data: favorite }, { status: 201 })
  } catch (error) {
    console.error("[api] Failed to create favorite", error)
    return NextResponse.json({ data: null, error: "Unable to save favorite" }, { status: 502 })
  }
}

export async function DELETE(request: Request) {
  if (!prisma) {
    return NextResponse.json({ data: null, message: databaseDisabledReason }, { status: 503 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 })
    }

    await prisma.favoriteCoin.delete({ where: { id } })
    return NextResponse.json({ data: { id } })
  } catch (error) {
    console.error("[api] Failed to delete favorite", error)
    return NextResponse.json({ data: null, error: "Unable to delete favorite" }, { status: 502 })
  }
}

// TODO: Sync localStorage favorites with remote store when auth is available.
