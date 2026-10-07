import type { ReactNode } from "react"
import { STATUS_META } from "@/components/plant/status"
import { plannedMinutes } from "@/lib/domain/catalog"
import type { MachineView } from "@/lib/domain/types"
import { cn } from "@/lib/utils"

const RADIUS = 42
const CIRCUMFERENCE = 2 * Math.PI * RADIUS
/** Gap between step arcs, as a share of the ring. */
const GAP = 0.006

/**
 * The batch's recipe as a ring: one arc per step, sized by its planned minutes. Done steps fill in the status
 * colour, the current step fills as far as it has run, and the rest wait in grey.
 */
export function CycleRing({ view, className, children }: { view: MachineView; className?: string; children?: ReactNode }) {
  const recipe = view.batch?.recipe ?? []
  const total = plannedMinutes(recipe)
  const color = STATUS_META[view.status].color
  const finished = view.state.phase === "complete"
  let offset = 0

  return (
    <div className={cn("relative grid place-items-center", className)}>
      <svg viewBox="0 0 100 100" className="size-full -rotate-90" aria-hidden>
        <circle cx={50} cy={50} r={RADIUS} fill="none" strokeWidth={7} className="stroke-muted/60" />
        {total > 0 &&
          recipe.map((step, index) => {
            const share = step.plannedMin / total
            const start = offset
            offset += share
            const length = Math.max(0, share - GAP) * CIRCUMFERENCE
            const fill = finished || index < (view.step?.index ?? (view.state.run ? 0 : -1)) ? 1 : index === view.step?.index ? view.step.progress : 0
            return (
              <g key={index}>
                <circle
                  cx={50}
                  cy={50}
                  r={RADIUS}
                  fill="none"
                  strokeWidth={7}
                  strokeDasharray={`${length} ${CIRCUMFERENCE}`}
                  strokeDashoffset={-start * CIRCUMFERENCE}
                  className="stroke-foreground/12"
                />
                {fill > 0 && (
                  <circle
                    cx={50}
                    cy={50}
                    r={RADIUS}
                    fill="none"
                    strokeWidth={7}
                    stroke={color}
                    strokeDasharray={`${length * fill} ${CIRCUMFERENCE}`}
                    strokeDashoffset={-start * CIRCUMFERENCE}
                    className="transition-[stroke-dasharray] duration-700"
                  />
                )}
              </g>
            )
          })}
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">{children}</div>
    </div>
  )
}
