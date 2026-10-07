"use client"

import { Pipette } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { MachineView } from "@/lib/domain/types"
import { SHADE_TOLERANCE_DE, usePlant } from "@/lib/store/plant"

/** Record a spectrophotometer reading. A fail adds correction dosing to the recipe through a shade-correction hold. */
export function ShadeCheckDialog({ view }: { view: MachineView }) {
  const recordShadeCheck = usePlant((state) => state.recordShadeCheck)
  const [deltaE, setDeltaE] = useState("0.65")
  const value = Number(deltaE)
  const valid = deltaE.trim() !== "" && Number.isFinite(value) && value >= 0 && value < 20

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="h-11 justify-start">
          <Pipette />
          Record shade check
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Shade check · {view.batch?.id}</DialogTitle>
          <DialogDescription>
            Enter the spectrophotometer ΔE (CIE2000) against the approved {view.order?.shade.name} standard. Above{" "}
            {SHADE_TOLERANCE_DE.toFixed(1)} raises a shade correction.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-2">
          <Label htmlFor="delta-e">ΔE measured</Label>
          <Input id="delta-e" inputMode="decimal" value={deltaE} onChange={(event) => setDeltaE(event.target.value)} aria-invalid={!valid} />
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <DialogClose asChild>
            <Button
              disabled={!valid}
              onClick={() => {
                recordShadeCheck(view.machine.id, value)
                if (value <= SHADE_TOLERANCE_DE) toast.success(`Shade passed · ΔE ${value.toFixed(2)}`)
                else toast.error(`Shade failed · ΔE ${value.toFixed(2)}`, { description: "Correction dosing added to the recipe" })
              }}
            >
              Save result
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
