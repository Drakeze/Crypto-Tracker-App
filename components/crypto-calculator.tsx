"use client"

import { useState, useEffect } from "react"
import { ArrowUpDown, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface CryptoData {
  id: number
  name: string
  symbol: string
  price: number
  marketCap: number
  change24h: number
  rank: number
  coinGeckoId: string
}

interface CryptoCalculatorProps {
  cryptos: CryptoData[]
  isOpen: boolean
  onClose: () => void
}

export function CryptoCalculator({ cryptos, isOpen, onClose }: CryptoCalculatorProps) {
  const [fromAmount, setFromAmount] = useState("1")
  const [fromCurrency, setFromCurrency] = useState("BTC")
  const [toCurrency, setToCurrency] = useState("USD")
  const [result, setResult] = useState("0")

  // Add USD as a fiat option
  const currencies = [
    { symbol: "USD", name: "US Dollar", price: 1 },
    ...cryptos.map((crypto) => ({
      symbol: crypto.symbol,
      name: crypto.name,
      price: crypto.price,
    })),
  ]

  const calculateConversion = () => {
    const amount = Number.parseFloat(fromAmount) || 0
    const fromPrice = currencies.find((c) => c.symbol === fromCurrency)?.price || 0
    const toPrice = currencies.find((c) => c.symbol === toCurrency)?.price || 1

    if (fromCurrency === "USD") {
      // Converting from USD to crypto
      const converted = amount / toPrice
      setResult(converted.toFixed(8))
    } else if (toCurrency === "USD") {
      // Converting from crypto to USD
      const converted = amount * fromPrice
      setResult(converted.toFixed(2))
    } else {
      // Converting between cryptos
      const usdValue = amount * fromPrice
      const converted = usdValue / toPrice
      setResult(converted.toFixed(8))
    }
  }

  const swapCurrencies = () => {
    const tempCurrency = fromCurrency
    setFromCurrency(toCurrency)
    setToCurrency(tempCurrency)
  }

  useEffect(() => {
    calculateConversion()
  }, [fromAmount, fromCurrency, toCurrency, cryptos])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-lg font-semibold">Crypto Calculator</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* From Section */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">From</label>
            <div className="flex flex-col sm:flex-row gap-2">
              <Input
                type="number"
                value={fromAmount}
                onChange={(e) => setFromAmount(e.target.value)}
                placeholder="Enter amount"
                className="flex-1"
                min="0"
                step="any"
              />
              <Select value={fromCurrency} onValueChange={setFromCurrency}>
                <SelectTrigger className="w-full sm:w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {currencies.map((currency) => (
                    <SelectItem key={currency.symbol} value={currency.symbol}>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs">{currency.symbol}</span>
                        <span className="text-xs text-muted-foreground truncate max-w-20">{currency.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Swap Button */}
          <div className="flex justify-center">
            <Button variant="outline" size="icon" onClick={swapCurrencies} className="h-10 w-10 bg-transparent">
              <ArrowUpDown className="h-4 w-4" />
            </Button>
          </div>

          {/* To Section */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">To</label>
            <div className="flex flex-col sm:flex-row gap-2">
              <Input type="text" value={result} readOnly className="flex-1 bg-muted/50 font-mono text-sm" />
              <Select value={toCurrency} onValueChange={setToCurrency}>
                <SelectTrigger className="w-full sm:w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {currencies.map((currency) => (
                    <SelectItem key={currency.symbol} value={currency.symbol}>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs">{currency.symbol}</span>
                        <span className="text-xs text-muted-foreground truncate max-w-20">{currency.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Exchange Rate Info */}
          <div className="text-center p-3 bg-muted/30 rounded-lg">
            <p className="text-xs sm:text-sm text-muted-foreground break-all">
              1 {fromCurrency} ={" "}
              {fromCurrency === "USD"
                ? (1 / (currencies.find((c) => c.symbol === toCurrency)?.price || 1)).toFixed(8)
                : toCurrency === "USD"
                  ? (currencies.find((c) => c.symbol === fromCurrency)?.price || 0).toFixed(2)
                  : (
                      (currencies.find((c) => c.symbol === fromCurrency)?.price || 0) /
                      (currencies.find((c) => c.symbol === toCurrency)?.price || 1)
                    ).toFixed(8)}{" "}
              {toCurrency}
            </p>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-4 gap-2">
            {["0.1", "1", "10", "100"].map((amount) => (
              <Button
                key={amount}
                variant="outline"
                size="sm"
                onClick={() => setFromAmount(amount)}
                className="text-xs h-8"
              >
                {amount}
              </Button>
            ))}
          </div>

          <div className="text-center pt-2 border-t">
            <p className="text-xs text-muted-foreground">💡 Prices updated in real-time from CoinGecko</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
