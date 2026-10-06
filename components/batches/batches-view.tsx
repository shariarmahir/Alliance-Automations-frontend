"use client"

import { BatchesTable } from "@/components/batches/batches-table"
import { PlantGate } from "@/components/plant/plant-gate"

export function BatchesView() {
  return (
    <PlantGate>
      <BatchesTable />
    </PlantGate>
  )
}
