"use client"

import { CirclePause, Pipette, Play, ShieldAlert } from "lucide-react"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { HOLD_REASONS, REASONS } from "@/lib/domain/catalog"
import type { MachineView, ReasonCode } from "@/lib/domain/types"
import { SHADE_TOLERANCE_DE, usePlant } from "@/lib/store/plant"

const HOLD_MINUTES = ["15", "30", "45"]

function HoldDialog({ view }: { view: MachineView }) {
  const hold = usePlant((state) => state.hold)
  const [reason, setReason] = useState<ReasonCode>("waiting-chemicals")
  const [minutes, setMinutes] = useState("15")

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="justify-start">
          <CirclePause />
          Raise hold
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Raise hold on {view.machine.id} · {view.machine.name}
          </DialogTitle>
          <DialogDescription>
            The step timer pauses and the owner of the reason is notified. Hold time counts toward the batch overrun.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="hold-reason">Reason</Label>
            <Select value={reason} onValueChange={(value) => setReason(value as ReasonCode)}>
              <SelectTrigger id="hold-reason" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {HOLD_REASONS.map((code) => (
                  <SelectItem key={code} value={code}>
                    {REASONS[code].label} <span className="text-muted-foreground">· {REASONS[code].owner}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label>Expected duration</Label>
            <ToggleGroup type="single" variant="outline" value={minutes} onValueChange={(value) => value && setMinutes(value)}>
              {HOLD_MINUTES.map((option) => (
                <ToggleGroupItem key={option} value={option} className="px-4">
                  {option} min
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <DialogClose asChild>
            <Button
              onClick={() => {
                hold(view.machine.id, reason, Number(minutes))
                toast.warning(`${view.machine.id} on hold`, { description: `${REASONS[reason].label} · ${REASONS[reason].owner} notified` })
              }}
            >
              Raise hold
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function ShadeCheckDialog({ view }: { view: MachineView }) {
  const recordShadeCheck = usePlant((state) => state.recordShadeCheck)
  const [deltaE, setDeltaE] = useState("0.65")
  const value = Number(deltaE)
  const valid = deltaE.trim() !== "" && Number.isFinite(value) && value >= 0 && value < 20

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="justify-start">
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

export function MachineCommands({ view }: { view: MachineView }) {
  const release = usePlant((state) => state.release)
  const running = view.state.phase === "running"
  const held = Boolean(view.state.run?.hold)

  return (
    <div className="flex flex-col gap-2">
      {held ? (
        <Button
          onClick={() => {
            release(view.machine.id)
            toast.success(`${view.machine.id} resumed`)
          }}
          className="justify-start"
        >
          <Play />
          Release hold
        </Button>
      ) : (
        running && <HoldDialog view={view} />
      )}
      {running && <ShadeCheckDialog view={view} />}
      {!running && <p className="text-sm text-muted-foreground">Commands are available while a batch is running.</p>}
      <p className="mt-2 flex gap-2 rounded-lg bg-muted/60 p-3 text-xs text-muted-foreground">
        <ShieldAlert className="size-4 shrink-0 text-held" aria-hidden />
        Pilot mode is read-only toward the PLC. Commands update tracking and notify staff; no setpoints are written to the
        controller.
      </p>
    </div>
  )
}
