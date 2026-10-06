import { Animate, AnimateMotion } from "@/components/landing/scene/anim"
import { SCENE, VATS } from "@/components/landing/scene/layout"

const SENSOR_TOP = SCENE.vatTopY - 62
const DASHBOARD = { x: 936, y: 6, width: 58, height: 44 }
const BARS = [10, 22, 15, 28]

/** Sensor readings travel from each vat up a data line to the live dashboard. */
export function DataBus() {
  const busEnd = DASHBOARD.x

  return (
    <g>
      {VATS.map((vat, index) => {
        const path = `M${vat.x} ${SENSOR_TOP} V${SCENE.busY} H${busEnd}`
        return (
          <g key={vat.x}>
            <path d={path} fill="none" strokeWidth={1.5} strokeDasharray="3 6" className="stroke-primary/30" />
            <circle r={3.5} className="fill-primary">
              <AnimateMotion path={path} dur="3.6s" begin={`${index * 1.2}s`} />
            </circle>
          </g>
        )
      })}

      <rect {...DASHBOARD} rx={8} className="fill-card stroke-primary/60" strokeWidth={2} />
      <g transform={`translate(${DASHBOARD.x + 12} ${DASHBOARD.y + DASHBOARD.height - 10})`}>
        {BARS.map((height, index) => (
          <rect key={index} x={index * 10} y={-height} width={6} height={height} rx={2} className="fill-primary">
            <Animate attributeName="height" values={`${height};${BARS[(index + 1) % BARS.length]};${height}`} dur="3s" begin={`${index * 0.4}s`} />
            <Animate attributeName="y" values={`${-height};${-BARS[(index + 1) % BARS.length]};${-height}`} dur="3s" begin={`${index * 0.4}s`} />
          </rect>
        ))}
      </g>
      <text x={DASHBOARD.x + DASHBOARD.width / 2} y={DASHBOARD.y + DASHBOARD.height + 14} textAnchor="middle" fontSize={10} letterSpacing={2} className="fill-muted-foreground font-mono">
        LIVE
      </text>
    </g>
  )
}
