import { cn } from "@/lib/utils"

interface ChipGroupProps {
  id: string
  label: string
  hint?: string
  options: string[]
  selected: string[]
  onToggle: (option: string) => void
}

/** A row of toggle chips: one question, several possible answers. */
export function ChipGroup({ id, label, hint, options, selected, onToggle }: ChipGroupProps) {
  return (
    <div className="grid gap-2.5" role="group" aria-labelledby={id}>
      <div>
        <p id={id} className="text-sm font-medium">
          {label}
        </p>
        {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      </div>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const on = selected.includes(option)
          return (
            <button
              key={option}
              type="button"
              aria-pressed={on}
              onClick={() => onToggle(option)}
              className={cn(
                "rounded-full border px-3.5 py-1.5 text-sm transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                on ? "border-primary bg-primary font-medium text-primary-foreground" : "border-input hover:border-primary/60 hover:bg-primary/10",
              )}
            >
              {option}
            </button>
          )
        })}
      </div>
    </div>
  )
}
