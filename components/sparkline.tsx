"use client"

interface SparklineProps {
  data: number[]
  positive: boolean
}

export function Sparkline({ data, positive }: SparklineProps) {
  if (!data || data.length === 0) {
    return <div className="w-24 h-12" />
  }

  const width = 96
  const height = 48
  const padding = 2

  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min

  const points = data
    .map((value, index) => {
      const x = (index / (data.length - 1)) * (width - padding * 2) + padding
      const y = height - padding - ((value - min) / range) * (height - padding * 2)
      return `${x},${y}`
    })
    .join(" ")

  const color = positive ? "#10B981" : "#EF4444"

  return (
    <svg width={width} height={height} className="transition-all duration-300">
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="drop-shadow-sm"
      />
    </svg>
  )
}
