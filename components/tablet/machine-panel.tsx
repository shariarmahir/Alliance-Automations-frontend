"use client"

import { useState } from "react"
import { GlowCard } from "@/components/glow-card"
import { ShadeSwatch } from "@/components/plant/step-readout"
import { ActionPad } from "@/components/tablet/action-pad"
import { RecentEvents } from "@/components/tablet/recent-events"
import { ScanDialog } from "@/components/tablet/scan-dialog"
import { SensorTiles } from "@/components/tablet/sensor-tiles"
import { ShadeKeypad } from "@/components/tablet/shade-keypad"
import { StepCard } from "@/components/tablet/step-card"
import type { MachineView } from "@/lib/domain/types"

export function MachinePanel({ view }: { view: MachineView }) {
  const [scanning, setScanning] = useState(false)
  const running = view.state.phase === "running"

  return (
    <div className="grid min-h-0 flex-1 grid-cols-1 content-start gap-4 overflow-y-auto p-4 lg:grid-cols-[minmax(0,1fr)_20rem]">
      <div className="flex min-w-0 flex-col gap-4">
        <StepCard view={view} />
        {running && <SensorTiles view={view} />}

        {view.batch && view.order && (
          <GlowCard quiet className="grid grid-cols-2 gap-4 bg-card/45 p-5 sm:grid-cols-4">
            <div>
              <p className="text-xs text-muted-foreground">Batch</p>
              <p className="text-lg font-semibold">{view.batch.id}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Buyer</p>
              <p className="truncate text-lg font-semibold">{view.buyer?.name}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Weight · GSM</p>
              <p className="text-lg font-semibold tabular">
                {view.batch.qtyKg} kg · {view.order.gsm}
              </p>
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">Shade</p>
              <ShadeSwatch hex={view.order.shade.hex} name={view.order.shade.name} className="text-lg font-semibold" />
            </div>
          </GlowCard>
        )}

        <ActionPad view={view} onScan={() => setScanning(true)} />
      </div>

      <div className="flex flex-col gap-4">
        <GlowCard className="bg-card/45 p-5">
          <p className="mb-3 font-medium">Shade check</p>
          {running ? <ShadeKeypad view={view} /> : <p className="text-sm text-muted-foreground">Available while a batch is in the machine.</p>}
        </GlowCard>
        <RecentEvents machineId={view.machine.id} />
      </div>
      <ScanDialog view={view} open={scanning} onOpenChange={setScanning} />
    </div>
  )
}
