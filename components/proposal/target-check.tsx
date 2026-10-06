import { format } from "date-fns"
import { CircleAlert, CircleCheck } from "lucide-react"
import type { TargetCheck as TargetCheckResult } from "@/components/proposal/use-timeline"
import { Button } from "@/components/ui/button"
import type { Schedule } from "@/lib/proposal/schedule"
import { cn } from "@/lib/utils"

const day = (date: Date) => format(date, "d MMMM yyyy")
const plural = (count: number, unit: string) => `${count} ${unit}${count === 1 ? "" : "s"}`

interface TargetCheckProps {
  check: TargetCheckResult
  schedule: Schedule
  onAccelerate: () => void
}

/** Tells the client whether the plan meets the go-live date they asked for, and what would change that. */
export function TargetCheck({ check, schedule, onAccelerate }: TargetCheckProps) {
  const { meets, weeksLate, target, acceleratedLive } = check
  const acceleratedMeets = acceleratedLive <= target
  const Icon = meets ? CircleCheck : CircleAlert

  return (
    <div className={cn("flex gap-3 rounded-xl p-4 text-sm ring-1", meets ? "bg-running/8 ring-running/30" : "bg-held/8 ring-held/30")} role="status">
      <Icon className={cn("mt-0.5 size-5 shrink-0", meets ? "text-running" : "text-held")} aria-hidden />
      <div className="flex flex-col gap-2">
        {meets ? (
          <p>
            Whole-floor go-live on <strong>{day(schedule.floorLive)}</strong> meets your target of {day(target)}
            {weeksLate < 0 && `, with ${plural(-weeksLate, "week")} to spare`}.
          </p>
        ) : (
          <>
            <p>
              Whole-floor go-live lands on <strong>{day(schedule.floorLive)}</strong>, {plural(weeksLate, "week")} after your target of {day(target)}.
            </p>
            <p className="text-muted-foreground">
              {acceleratedMeets
                ? `At the Accelerated pace it finishes on ${day(acceleratedLive)}, in time. That needs a larger team and earlier access to your machines; we confirm feasibility in Discovery.`
                : `Even at the Accelerated pace the earliest is ${day(acceleratedLive)}. Moving the start earlier or narrowing the first rollout would help.`}
            </p>
            {acceleratedMeets && (
              <Button size="sm" variant="outline" className="self-start" onClick={onAccelerate}>
                Apply Accelerated pace
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  )
}
