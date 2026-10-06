"use client"

import { FastForward } from "lucide-react"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { SIM_SPEEDS, usePlant, type SimSpeed } from "@/lib/store/plant"

export function SpeedControl() {
  const speed = usePlant((state) => state.speed)
  const setSpeed = usePlant((state) => state.setSpeed)
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="hidden items-center gap-1.5 lg:flex">
          <FastForward className="size-3.5 text-muted-foreground" aria-hidden />
          <ToggleGroup
            type="single"
            size="sm"
            variant="outline"
            value={String(speed)}
            onValueChange={(value) => value && setSpeed(Number(value) as SimSpeed)}
            aria-label="Simulation speed"
          >
            {SIM_SPEEDS.map((option) => (
              <ToggleGroupItem key={option} value={String(option)} className="px-2 font-mono text-xs">
                {option}×
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>
      </TooltipTrigger>
      <TooltipContent>Demo feed speed. Real deployments stream at 1×.</TooltipContent>
    </Tooltip>
  )
}
