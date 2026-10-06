import type { ComponentType } from "react"
import { FROM_BOTTOM, IconFrame, PIVOT, type IconProps } from "@/components/landing/icons/frame"
import { cn } from "@/lib/utils"

const TEETH = [0, 45, 90, 135, 180, 225, 270, 315]
const BAR_HEIGHTS = [10, 16, 12, 18]

/** Machines: a gear that keeps turning, with a pulsing core. */
function MachineIcon({ className }: IconProps) {
  return (
    <IconFrame className={className}>
      <g className={cn(PIVOT, "animate-layer-gear")}>
        <circle cx={24} cy={24} r={11} />
        {TEETH.map((angle) => (
          <path key={angle} d="M24 13V6" strokeWidth={4} transform={`rotate(${angle} 24 24)`} />
        ))}
      </g>
      <circle cx={24} cy={24} r={4} fill="currentColor" stroke="none" className={cn(PIVOT, "animate-layer-blink")} />
    </IconFrame>
  )
}

/** Edge: a gateway chip sending signal rings outward. */
function EdgeIcon({ className }: IconProps) {
  return (
    <IconFrame className={className}>
      {[0, 0.8, 1.6].map((delay) => (
        <circle key={delay} cx={24} cy={24} r={21} strokeWidth={1.5} className={cn(PIVOT, "animate-layer-ring")} style={{ animationDelay: `${delay}s` }} />
      ))}
      <rect x={16} y={16} width={16} height={16} rx={3} fill="var(--card)" />
      <path d="M21 16v-3M27 16v-3M21 35v-3M27 35v-3M16 21h-3M16 27h-3M35 21h-3M35 27h-3" />
      <circle cx={24} cy={24} r={2.5} fill="currentColor" stroke="none" className="animate-layer-blink" />
    </IconFrame>
  )
}

/** Platform: three stacked layers that light up in turn, fed by a flowing line. */
function PlatformIcon({ className }: IconProps) {
  return (
    <IconFrame className={className}>
      {[9, 20, 31].map((y, index) => (
        <g key={y}>
          <rect x={7} y={y} width={30} height={9} rx={3} />
          <circle
            cx={13}
            cy={y + 4.5}
            r={1.8}
            fill="currentColor"
            stroke="none"
            className="animate-layer-blink"
            style={{ animationDelay: `${index * 0.5}s` }}
          />
        </g>
      ))}
      <path d="M43 7v34" strokeWidth={1.5} strokeDasharray="3 7" className="animate-layer-flow" />
    </IconFrame>
  )
}

/** Screens: a wall display whose bars rise and fall. */
function ScreenIcon({ className }: IconProps) {
  return (
    <IconFrame className={className}>
      <rect x={5} y={7} width={38} height={26} rx={3} />
      <path d="M18 41h12M24 33v8" />
      {BAR_HEIGHTS.map((height, index) => (
        <rect
          key={index}
          x={12 + index * 6.5}
          y={27 - height}
          width={4}
          height={height}
          rx={1}
          fill="currentColor"
          stroke="none"
          className={cn(FROM_BOTTOM, "animate-layer-bar")}
          style={{ animationDelay: `${index * 0.25}s` }}
        />
      ))}
    </IconFrame>
  )
}

export const LAYER_ICONS = {
  Machines: MachineIcon,
  Edge: EdgeIcon,
  Platform: PlatformIcon,
  Screens: ScreenIcon,
} satisfies Record<string, ComponentType<IconProps>>
