"use client"

import { useEffect, useState } from "react"
import { PlantGate } from "@/components/plant/plant-gate"
import { AlertTicker } from "@/components/tv/alert-ticker"
import { ROTATE_MS, BayTabs } from "@/components/tv/bay-tabs"
import { KpiStrip } from "@/components/tv/kpi-strip"
import { MachineTable } from "@/components/tv/machine-table"
import { Header } from "@/components/tv/tv-header"
import { BAYS } from "@/lib/domain/catalog"

function Board() {
  const [bay, setBay] = useState(1)

  useEffect(() => {
    const id = window.setTimeout(() => setBay((current) => (current % BAYS.length) + 1), ROTATE_MS)
    return () => window.clearTimeout(id)
  }, [bay])

  return (
    <div className="flex h-dvh flex-col overflow-hidden">
      <Header />
      <KpiStrip />
      <BayTabs bay={bay} onSelect={setBay} />
      <MachineTable bay={bay} />
      <AlertTicker />
    </div>
  )
}

export function TvBoard() {
  return (
    <div className="dark min-h-dvh bg-background text-foreground bg-ambient">
      <PlantGate fallback={<div className="grid h-dvh place-items-center text-muted-foreground">Connecting to plant feed…</div>}>
        <Board />
      </PlantGate>
    </div>
  )
}
