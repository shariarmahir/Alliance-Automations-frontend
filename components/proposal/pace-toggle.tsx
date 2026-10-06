import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { PACE_PRESETS, type PacePreset } from "@/lib/proposal/phases"
import { cn } from "@/lib/utils"

interface PaceToggleProps {
  active: PacePreset["id"] | "custom"
  onPick: (factor: number) => void
  labelledBy: string
  /** Stretches the three options across the available width. */
  fill?: boolean
}

/** Accelerated, Standard or Relaxed. Shows nothing selected while the durations are custom. */
export function PaceToggle({ active, onPick, labelledBy, fill }: PaceToggleProps) {
  return (
    <ToggleGroup
      type="single"
      variant="outline"
      value={active === "custom" ? "" : active}
      onValueChange={(id) => {
        const preset = PACE_PRESETS.find((candidate) => candidate.id === id)
        if (preset) onPick(preset.factor)
      }}
      aria-labelledby={labelledBy}
      className={fill ? "w-full" : undefined}
    >
      {PACE_PRESETS.map((preset) => (
        <ToggleGroupItem
          key={preset.id}
          value={preset.id}
          className={cn("px-3 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground", fill && "flex-1 px-1.5 text-[13px] sm:px-3 sm:text-sm")}
        >
          {preset.label}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  )
}
