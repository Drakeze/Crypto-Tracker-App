"use client"

import { useState, useEffect } from "react"
import { X, ArrowDownUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface CryptoConverterModalProps {
  isOpen: boolean
  onClose: () => void
  coins: Array<{ id: string; symbol: string; name: string; current_price: number }>
}

export function CryptoConverterModal({ isOpen, onClose, coins }: CryptoConverterModalProps) {
  const [fromCoin, setFromCoin] = useState("bitcoin")
  const [toCoin, setToCoin] = useState("usd")
  const [amount, setAmount] = useState("1")
  const [result, setResult] = useState<number | null>(null)

  useEffect(() => {
    if (isOpen && coins.length > 0) {
      calculateConversion()
    }
  }, [fromCoin, toCoin, amount, coins, isOpen])

  const calculateConversion = () => {
    const fromPrice = coins.find((c) => c.id === fromCoin)?.current_price || 0
    const toPrice = toCoin === "usd" ? 1 : coins.find((c) => c.id === toCoin)?.current_price || 1
    const amountNum = Number.parseFloat(amount) || 0
    setResult((amountNum * fromPrice) / toPrice)
  }

  const swapCurrencies = () => {
    if (toCoin !== "usd") {
      setFromCoin(toCoin)
      setToCoin(fromCoin)
    }
  }

  const setQuickAmount = (value: number) => {
    setAmount(value.toString())
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in" onClick={onClose}>
      <div
        className="bg-card rounded-2xl shadow-2xl w-full max-w-md mx-4 animate-scale-in border border-border"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-semibold text-foreground">Crypto Converter</h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors p-1 hover:bg-muted rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">From</label>
            <Select value={fromCoin} onValueChange={setFromCoin}>
              <SelectTrigger className="rounded-lg border-input">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="max-h-[300px]">
                {coins.slice(0, 50).map((coin) => (
                  <SelectItem key={coin.id} value={coin.id}>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{coin.symbol.toUpperCase()}</span>
                      <span className="text-muted-foreground text-sm">{coin.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Amount</label>
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="rounded-lg border-input text-lg font-semibold"
              placeholder="0.00"
            />
            <div className="flex gap-2">
              {[0.1, 1, 10, 100].map((value) => (
                <Button
                  key={value}
                  variant="outline"
                  size="sm"
                  className="rounded-lg text-xs bg-transparent"
                  onClick={() => setQuickAmount(value)}
                >
                  {value}
                </Button>
              ))}
            </div>
          </div>

          <div className="flex justify-center">
            <Button
              variant="outline"
              size="icon"
              className="rounded-full hover:bg-accent/15 hover:border-accent/40 transition-all bg-transparent"
              onClick={swapCurrencies}
              disabled={toCoin === "usd"}
            >
              <ArrowDownUp className="w-4 h-4 text-primary" />
            </Button>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">To</label>
            <Select value={toCoin} onValueChange={setToCoin}>
              <SelectTrigger className="rounded-lg border-input">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="max-h-[300px]">
                <SelectItem value="usd">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">USD</span>
                    <span className="text-muted-foreground text-sm">US Dollar</span>
                  </div>
                </SelectItem>
                {coins.slice(0, 50).map((coin) => (
                  <SelectItem key={coin.id} value={coin.id}>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{coin.symbol.toUpperCase()}</span>
                      <span className="text-muted-foreground text-sm">{coin.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {result !== null && (
            <div className="bg-accent/15 border border-accent/30 rounded-xl p-4 animate-fade-in">
              <p className="text-sm text-primary font-medium mb-1">Result</p>
              <p className="text-2xl font-bold text-foreground">
                {toCoin === "usd" ? "$" : ""}
                {result.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 8 })}
                {toCoin !== "usd" && ` ${coins.find((c) => c.id === toCoin)?.symbol.toUpperCase()}`}
              </p>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-border">
          <Button onClick={onClose} className="w-full rounded-lg">
            Close
          </Button>
        </div>
      </div>
    </div>
  )
}
