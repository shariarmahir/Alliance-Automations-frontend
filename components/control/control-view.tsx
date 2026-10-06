"use client"

import { Search } from "lucide-react"
import { useState } from "react"
import { MachineTile } from "@/components/control/machine-tile"
import { PlantGate } from "@/components/plant/plant-gate"
import { STATUS_META, STATUS_ORDER } from "@/components/plant/status"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { BAYS } from "@/lib/domain/catalog"
import type { MachineStatus } from "@/lib/domain/types"
import { usePlant } from "@/lib/store/plant"
import { cn } from "@/lib/utils"

export function ControlView() {
  const views = usePlant((state) => state.views)
  const [status, setStatus] = useState<MachineStatus | "all">("all")
  const [bay, setBay] = useState("all")
  const [query, setQuery] = useState("")

  const needle = query.trim().toLowerCase()
  const visible = views.filter(
    (view) =>
      (status === "all" || view.status === status) &&
      (bay === "all" || view.machine.bay === Number(bay)) &&
      (!needle ||
        [view.machine.id, view.machine.name, view.batch?.id, view.buyer?.name, view.order?.shade.name]
          .some((field) => field?.toLowerCase().includes(needle))),
  )

  return (
    <PlantGate>
      <div className="mb-5 flex flex-wrap items-center gap-2">
        <ToggleGroup
          type="single"
          variant="outline"
          size="sm"
          value={status}
          onValueChange={(value) => setStatus((value || "all") as MachineStatus | "all")}
          className="flex-wrap"
          aria-label="Filter by status"
        >
          <ToggleGroupItem value="all" className="px-3">
            All <span className="text-muted-foreground tabular">{views.length}</span>
          </ToggleGroupItem>
          {STATUS_ORDER.map((option) => {
            const count = views.filter((view) => view.status === option).length
            return (
              <ToggleGroupItem key={option} value={option} className="gap-1.5 px-3" disabled={!count}>
                <span className={cn("size-1.5 rounded-full", STATUS_META[option].solid)} />
                {STATUS_META[option].label}
                <span className="text-muted-foreground tabular">{count}</span>
              </ToggleGroupItem>
            )
          })}
        </ToggleGroup>

        <div className="flex w-full flex-wrap items-center gap-2 sm:ml-auto sm:w-auto">
          <Select value={bay} onValueChange={setBay}>
            <SelectTrigger size="sm" className="w-36" aria-label="Filter by bay">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All bays</SelectItem>
              {BAYS.map((option) => (
                <SelectItem key={option.bay} value={String(option.bay)}>
                  {option.label} · D{option.range}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <InputGroup className="h-7 min-w-0 flex-1 sm:w-56 sm:flex-none">
            <InputGroupAddon>
              <Search aria-hidden />
            </InputGroupAddon>
            <InputGroupInput value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Machine, batch, buyer…" aria-label="Search machines" />
          </InputGroup>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5">
        {visible.map((view) => (
          <MachineTile key={view.machine.id} view={view} />
        ))}
      </div>
      {!visible.length && <p className="py-16 text-center text-sm text-muted-foreground">No machines match these filters.</p>}
    </PlantGate>
  )
}
