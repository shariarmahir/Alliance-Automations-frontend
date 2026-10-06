import { Minus, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { MAX_WEEKS, MIN_WEEKS, type Phase } from "@/lib/proposal/phases"

interface WeeksStepperProps {
  phase: Phase
  weeks: number
  disabled: boolean
  onChange: (weeks: number) => void
}

/** Shortens or extends one phase, within the allowed range. */
export function WeeksStepper({ phase, weeks, disabled, onChange }: WeeksStepperProps) {
  return (
    <div className="flex items-center gap-1.5" role="group" aria-label={`${phase.name} duration`}>
      <Button
        variant="outline"
        size="icon-sm"
        disabled={disabled || weeks <= MIN_WEEKS}
        onClick={() => onChange(weeks - 1)}
        aria-label={`Shorten ${phase.name}`}
      >
        <Minus />
      </Button>
      <span className="w-20 text-center text-sm font-medium whitespace-nowrap tabular" aria-live="polite">
        {weeks} {weeks === 1 ? "week" : "weeks"}
      </span>
      <Button
        variant="outline"
        size="icon-sm"
        disabled={disabled || weeks >= MAX_WEEKS}
        onClick={() => onChange(weeks + 1)}
        aria-label={`Extend ${phase.name}`}
      >
        <Plus />
      </Button>
    </div>
  )
}
