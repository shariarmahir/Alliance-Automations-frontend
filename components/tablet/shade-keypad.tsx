"use client"

import { Delete } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import type { MachineView } from "@/lib/domain/types"
import { SHADE_TOLERANCE_DE, usePlant } from "@/lib/store/plant"
import { cn } from "@/lib/utils"

const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "0"]

export function ShadeKeypad({ view }: { view: MachineView }) {
  const recordShadeCheck = usePlant((state) => state.recordShadeCheck)
  const [entry, setEntry] = useState("")
  const value = Number(entry)
  const valid = entry !== "" && entry !== "." && Number.isFinite(value)

  const press = (key: string) => setEntry((current) => (key === "." && current.includes(".") ? current : (current + key).slice(0, 4)))

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-baseline justify-between rounded-xl bg-muted/60 px-4 py-3">
        <span className="text-sm text-muted-foreground">ΔE</span>
        <span className={cn("font-mono text-3xl font-semibold tabular", valid && (value <= SHADE_TOLERANCE_DE ? "text-running" : "text-delayed"))}>
          {entry || "0.00"}
        </span>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {KEYS.map((key) => (
          <Button key={key} variant="secondary" className="h-14 text-xl" onClick={() => press(key)}>
            {key}
          </Button>
        ))}
        <Button variant="secondary" className="h-14" onClick={() => setEntry((current) => current.slice(0, -1))} aria-label="Delete">
          <Delete className="size-5" />
        </Button>
      </div>
      <Button
        className="h-14 text-base"
        disabled={!valid}
        onClick={() => {
          recordShadeCheck(view.machine.id, value)
          setEntry("")
          if (value <= SHADE_TOLERANCE_DE) toast.success(`Shade passed on ${view.machine.id}`)
          else toast.error(`Shade correction raised on ${view.machine.id}`)
        }}
      >
        Save shade check
      </Button>
    </div>
  )
}
