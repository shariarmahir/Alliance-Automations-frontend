import { memo, useId } from "react"

const WIDTH = 100
const HEIGHT = 30

/** A tiny trend line with a soft fill, in the current text colour. Plain SVG, so it costs nothing next to a chart. */
function Line({ values, className }: { values: number[]; className?: string }) {
  const id = useId()
  const max = Math.max(...values)
  const min = Math.min(...values)
  const span = max - min || 1
  const points = values.map((value, index) => [(index / (values.length - 1)) * WIDTH, HEIGHT - 2 - ((value - min) / span) * (HEIGHT - 4)])
  const path = points.map(([x, y], index) => `${index ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`).join("")

  return (
    <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} preserveAspectRatio="none" className={className} aria-hidden>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="currentColor" stopOpacity={0.3} />
          <stop offset="1" stopColor="currentColor" stopOpacity={0} />
        </linearGradient>
      </defs>
      <path d={`${path}L${WIDTH} ${HEIGHT}L0 ${HEIGHT}Z`} fill={`url(#${id})`} />
      <path d={path} fill="none" stroke="currentColor" strokeWidth={1.5} vectorEffect="non-scaling-stroke" strokeLinejoin="round" />
    </svg>
  )
}

export const Sparkline = memo(Line, (a, b) => a.className === b.className && a.values.join() === b.values.join())
