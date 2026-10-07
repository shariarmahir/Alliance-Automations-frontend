"use client"

import { LayoutGrid, Rows3, Search, Zap } from "lucide-react"
import type { RefObject } from "react"
import { BayActions } from "@/components/control/bay-actions"
import { useControlPrefs, type ControlLayout, type ControlSort } from "@/components/control/control-prefs"
import { SORT_LABEL } from "@/components/control/control-sort"
import { STATUS_META, STATUS_ORDER } from "@/components/plant/status"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import { Kbd } from "@/components/ui/kbd"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { BAYS } from "@/lib/domain/catalog"
import type { MachineStatus } from "@/lib/domain/types"
import { cn } from "@/lib/utils"

interface ControlToolbarProps {
  counts: Record<MachineStatus | "all", number>
  query: string
  onQuery: (query: string) => void
  searchRef: RefObject<HTMLInputElement | null>
}

export function ControlToolbar({ counts, query, onQuery, searchRef }: ControlToolbarProps) {
  const { layout, sort, focus, status, bay, setLayout, setSort, setFocus, setStatus, setBay } = useControlPrefs()

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-2.5 rounded-lg px-3 py-1.5 ring-1 ring-brand/30 has-data-[state=checked]:bg-brand/10">
          <Zap className={cn("size-4", focus ? "text-brand" : "text-muted-foreground")} aria-hidden />
          <Label htmlFor="efficiency-mode" className="cursor-pointer text-sm font-medium">
            Efficiency mode
          </Label>
          <Switch id="efficiency-mode" checked={focus} onCheckedChange={setFocus} />
          <Kbd className="max-lg:hidden">E</Kbd>
        </div>

        <ToggleGroup
          type="single"
          variant="outline"
          size="sm"
          value={bay ? String(bay) : "all"}
          onValueChange={(value) => value && setBay(value === "all" ? null : Number(value))}
          aria-label="Bay"
        >
          <ToggleGroupItem value="all" className="px-3">
            All bays
          </ToggleGroupItem>
          {BAYS.map((option) => (
            <ToggleGroupItem key={option.bay} value={String(option.bay)} className="px-3" aria-label={option.label}>
              <span className="max-sm:hidden">Bay </span>
              {option.bay}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>

        <div className="flex w-full items-center gap-2 lg:ml-auto lg:w-auto">
          <InputGroup className="h-8 min-w-0 flex-1 lg:w-64 lg:flex-none">
            <InputGroupAddon>
              <Search aria-hidden />
            </InputGroupAddon>
            <InputGroupInput ref={searchRef} value={query} onChange={(event) => onQuery(event.target.value)} placeholder="Machine, batch, buyer, shade…" aria-label="Search machines" />
            <InputGroupAddon align="inline-end" className="max-lg:hidden">
              <Kbd>/</Kbd>
            </InputGroupAddon>
          </InputGroup>
          <BayActions />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {!focus && (
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
              All <span className="text-muted-foreground tabular">{counts.all}</span>
            </ToggleGroupItem>
            {STATUS_ORDER.map((option) => (
              <ToggleGroupItem key={option} value={option} className="gap-1.5 px-3" disabled={!counts[option]}>
                <span className={cn("size-1.5 rounded-full", STATUS_META[option].solid)} />
                {STATUS_META[option].label}
                <span className="text-muted-foreground tabular">{counts[option]}</span>
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        )}

        {!focus && (
          <div className="ml-auto flex items-center gap-2">
            <Select value={sort} onValueChange={(value) => setSort(value as ControlSort)}>
              <SelectTrigger size="sm" className="w-44" aria-label="Sort machines">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(SORT_LABEL).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <ToggleGroup type="single" variant="outline" size="sm" value={layout} onValueChange={(value) => value && setLayout(value as ControlLayout)} aria-label="Layout">
              <ToggleGroupItem value="grid" aria-label="Tiles" className="px-2.5">
                <LayoutGrid />
              </ToggleGroupItem>
              <ToggleGroupItem value="list" aria-label="List" className="px-2.5">
                <Rows3 />
              </ToggleGroupItem>
            </ToggleGroup>
            <Kbd className="max-lg:hidden">V</Kbd>
          </div>
        )}
      </div>
    </div>
  )
}
