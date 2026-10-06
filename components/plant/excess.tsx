import { DELAY_THRESHOLD_MIN } from "@/lib/domain/rules"
import { formatHm } from "@/lib/format"
import { cn } from "@/lib/utils"

/** Text color for a projected overrun. Uses the same threshold that marks a machine as delayed. */
export const excessTone = (minutes: number) =>
  minutes >= DELAY_THRESHOLD_MIN ? "text-delayed" : minutes > 0 ? "text-held" : undefined

/** Projected overrun as +hh:mm, or `empty` while the batch is on standard. */
export function ExcessTime({ minutes, empty = "—", className }: { minutes: number; empty?: string; className?: string }) {
  return (
    <span className={cn("font-mono tabular", minutes > 0 ? excessTone(minutes) : "text-muted-foreground", className)}>
      {minutes > 0 ? `+${formatHm(minutes)}` : empty}
    </span>
  )
}
