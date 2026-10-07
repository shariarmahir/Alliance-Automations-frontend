"use client"

import { ROTATION_TICK_MS } from "@/components/tv/use-rotation"
import { bayLoad } from "@/lib/domain/analytics"
import { usePlantDerived } from "@/lib/store/plant"
import { cn } from "@/lib/utils"

interface BayTabsProps {
  bay: number
  progress: number
  paused: boolean
  onSelect: (bay: number) => void
}

/** One tab per bay with its live load, and a bar that fills until the board turns to the next bay. */
export function BayTabs({ bay, progress, paused, onSelect }: BayTabsProps) {
  const bays = usePlantDerived((state) => bayLoad(state.views))

  return (
    <div className="grid grid-cols-5 gap-2 px-4 pt-4 md:gap-3 md:px-8" role="tablist" aria-label="Bays">
      {bays.map((option) => {
        const active = option.bay === bay
        return (
          <button
            key={option.bay}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onSelect(option.bay)}
            className={cn(
              "relative overflow-hidden rounded-xl px-2 py-2 text-left ring-1 transition-colors md:px-4 md:py-2.5",
              active ? "bg-brand/12 ring-brand" : "bg-card/45 ring-foreground/10 hover:ring-foreground/25",
            )}
          >
            <div className="flex items-baseline justify-between gap-2">
              <p className={cn("truncate font-semibold", active && "text-brand")}>
                <span className="max-md:hidden">Dyeing · </span>
                <span className="max-sm:hidden">Bay </span>
                {option.bay}
              </p>
              {option.alerts > 0 && <span className="shrink-0 rounded-full bg-delayed/15 px-1.5 text-xs font-semibold text-delayed tabular">{option.alerts}</span>}
            </div>
            <p className="truncate text-xs text-muted-foreground max-sm:hidden [@media(max-height:50rem)]:hidden">
              D{option.range} · {option.processing}/{option.available} running
            </p>
            {active && (
              <span
                className={cn("absolute inset-x-0 bottom-0 h-0.5 origin-left bg-brand transition-transform ease-linear", paused && "bg-muted-foreground")}
                style={{ transform: `scaleX(${progress})`, transitionDuration: `${ROTATION_TICK_MS}ms` }}
              />
            )}
          </button>
        )
      })}
    </div>
  )
}
