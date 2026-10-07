"use client"

import { BellOff, CirclePause, Layers, Play } from "lucide-react"
import { useState } from "react"
import { acknowledgeAll, holdBay, releaseBay } from "@/components/plant/operator-actions"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { BAYS, REASONS } from "@/lib/domain/catalog"
import type { ReasonCode } from "@/lib/domain/types"
import { usePlant } from "@/lib/store/plant"

/** Causes that hit a whole bay at once, because they come from shared utilities or supplies. */
const BAY_REASONS: ReasonCode[] = ["steam-pressure", "power-cut", "waiting-chemicals"]
const HOLD_MINUTES = ["15", "30", "60"]

/** Commands for a whole bay: hold every running machine for a shared cause, release them, or clear the alert list. */
export function BayActions() {
  const [bay, setBay] = useState("1")
  const [reason, setReason] = useState<ReasonCode>("steam-pressure")
  const [minutes, setMinutes] = useState("15")
  const views = usePlant((state) => state.views)
  const openAlerts = usePlant((state) => state.alerts.filter((alert) => !alert.acknowledged).length)

  const label = BAYS[Number(bay) - 1].label
  const inBay = views.filter((view) => view.machine.bay === Number(bay) && view.state.phase === "running")
  const running = inBay.filter((view) => !view.state.run?.hold).map((view) => view.machine.id)
  const held = inBay.filter((view) => view.state.run?.hold).map((view) => view.machine.id)

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Layers />
          Bay actions
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Bay actions</DialogTitle>
          <DialogDescription>For causes that stop a whole bay, such as low steam or a power cut. Every command is logged per machine.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-2">
              <Label htmlFor="bay-select">Bay</Label>
              <Select value={bay} onValueChange={setBay}>
                <SelectTrigger id="bay-select" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {BAYS.map((option) => (
                    <SelectItem key={option.bay} value={String(option.bay)}>
                      {option.label} · D{option.range}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="bay-reason">Cause</Label>
              <Select value={reason} onValueChange={(value) => setReason(value as ReasonCode)}>
                <SelectTrigger id="bay-reason" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {BAY_REASONS.map((code) => (
                    <SelectItem key={code} value={code}>
                      {REASONS[code].label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid gap-2">
            <Label>Expected duration</Label>
            <ToggleGroup type="single" variant="outline" value={minutes} onValueChange={(value) => value && setMinutes(value)} className="w-full">
              {HOLD_MINUTES.map((option) => (
                <ToggleGroupItem key={option} value={option} className="flex-1">
                  {option} min
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>
          <div className="grid gap-2 border-t pt-4">
            <Button disabled={!running.length} onClick={() => holdBay(label, running, reason, Number(minutes))}>
              <CirclePause />
              Hold {running.length} running {running.length === 1 ? "machine" : "machines"} in {label}
            </Button>
            <Button variant="outline" disabled={!held.length} onClick={() => releaseBay(label, held)}>
              <Play />
              Release {held.length} {held.length === 1 ? "hold" : "holds"} in {label}
            </Button>
            <Button variant="ghost" disabled={!openAlerts} onClick={acknowledgeAll}>
              <BellOff />
              Acknowledge all {openAlerts} open alerts
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
