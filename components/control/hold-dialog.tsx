"use client"

import { CirclePause } from "lucide-react"
import { useState } from "react"
import { raiseHold } from "@/components/plant/operator-actions"
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
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { HOLD_REASONS, REASONS } from "@/lib/domain/catalog"
import type { MachineView, ReasonCode } from "@/lib/domain/types"

const HOLD_MINUTES = ["15", "30", "45"]

/** Raise a hold with its reason and expected length. The step timer pauses and the reason's owner is notified. */
export function HoldDialog({ view }: { view: MachineView }) {
  const [reason, setReason] = useState<ReasonCode>("waiting-chemicals")
  const [minutes, setMinutes] = useState("15")

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="h-11 justify-start">
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
              onClick={() => raiseHold(view.machine.id, reason, Number(minutes))}
            >
              Raise hold
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
