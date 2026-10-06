"use client"

import { motion } from "motion/react"
import { BAYS } from "@/lib/domain/catalog"
import { cn } from "@/lib/utils"

export const ROTATE_MS = 15_000

export function BayTabs({ bay, onSelect }: { bay: number; onSelect: (bay: number) => void }) {
  return (
    <div className="grid grid-cols-5 gap-3 px-8 pt-4">
      {BAYS.map((option) => {
        const active = option.bay === bay
        return (
          <button
            key={option.bay}
            type="button"
            onClick={() => onSelect(option.bay)}
            className={cn(
              "relative overflow-hidden rounded-xl px-4 py-2.5 text-left ring-1 transition-colors",
              active ? "bg-primary/15 ring-primary" : "bg-card ring-foreground/10 hover:ring-foreground/25",
            )}
          >
            <p className={cn("font-semibold", active && "text-primary")}>Dyeing · {option.label}</p>
            <p className="text-xs text-muted-foreground">Machines {option.range}</p>
            {active && (
              <motion.span
                key={bay}
                className="absolute inset-x-0 bottom-0 h-0.5 origin-left bg-primary"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: ROTATE_MS / 1000, ease: "linear" }}
              />
            )}
          </button>
        )
      })}
    </div>
  )
}
