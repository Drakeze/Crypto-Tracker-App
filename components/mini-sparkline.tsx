"use client"

interface MiniSparklineProps {
  data: number[]
  width?: number
  height?: number
}

export function MiniSparkline({ data, width = 100, height = 40 }: MiniSparklineProps) {
  if (!data?.length) {
    return <div className="h-10" />
  }

  const min = Math.min(...data)
  const max = Math.max(...data)
  const step = width / (data.length - 1)

  const normalizeY = (value: number) =>
    height - ((value - min) / Math.max(max - min, 1)) * height

  const path = data
    .map((v, i) => `${i === 0 ? "M" : "L"} ${i * step} ${normalizeY(v)}`)
    .join(" ")

  const isUp = data[data.length - 1] >= data[0]
  const strokeColor = isUp ? "#22c55e" : "#ef4444" // green/red

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className="overflow-visible"
    >
      <path
        d={path}
        fill="none"
        stroke={strokeColor}
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  )
}