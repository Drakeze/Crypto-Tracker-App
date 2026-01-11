export function formatPrice(price: number | null | undefined) {
  if (price === null || price === undefined) return "N/A"

  if (price >= 1) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price)
  }

  if (price >= 0.01) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 4,
      maximumFractionDigits: 4,
    }).format(price)
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 6,
    maximumFractionDigits: 8,
  }).format(price)
}

export function formatMarketCap(value: number | null | undefined) {
  if (value === null || value === undefined) return "N/A"

  if (value >= 1e12) {
    return `$${(value / 1e12).toFixed(2)}T`
  }

  if (value >= 1e9) {
    return `$${(value / 1e9).toFixed(2)}B`
  }

  if (value >= 1e6) {
    return `$${(value / 1e6).toFixed(2)}M`
  }

  if (value >= 1e3) {
    return `$${(value / 1e3).toFixed(2)}K`
  }

  return `$${value.toFixed(2)}`
}
