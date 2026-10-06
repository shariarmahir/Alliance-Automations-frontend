"use client"

import { Play, QrCode } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import { excessTone } from "@/components/plant/excess"
import { STATUS_META, StatusBadge } from "@/components/plant/status"
import { STEP_ICON, ShadeSwatch, stepValue } from "@/components/plant/step-readout"
import { ScanDialog } from "@/components/tablet/scan-dialog"
import { ShadeKeypad } from "@/components/tablet/shade-keypad"
import { Button } from "@/components/ui/button"
import { HOLD_REASONS, REASONS } from "@/lib/domain/catalog"
import type { MachineView } from "@/lib/domain/types"
import { formatClock, formatHm } from "@/lib/format"
import { usePlant } from "@/lib/store/plant"
import { cn } from "@/lib/utils"

const HOLD_MINUTES = 20

export function MachinePanel({ view }: { view: MachineView }) {
  const hold = usePlant((state) => state.hold)
  const release = usePlant((state) => state.release)
  const [scanning, setScanning] = useState(false)
  const running = view.state.phase === "running"
  const held = Boolean(view.state.run?.hold)
  const step = view.step
  const StepIcon = step ? STEP_ICON[step.step.kind] : null
  const nextStep = step && view.batch?.recipe[step.index + 1]

  return (
    <div className="grid min-h-0 flex-1 gap-4 overflow-y-auto p-4 lg:grid-cols-[1fr_320px]">
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-3 rounded-2xl bg-card p-5 ring-1 ring-foreground/10">
          <div className="mr-auto">
            <p className="font-mono text-sm text-muted-foreground">{view.machine.id}</p>
            <p className="text-3xl font-semibold tracking-tight">{view.machine.name}</p>
          </div>
          <StatusBadge status={view.status} className="h-9 px-3 text-base" />
        </div>

        {step && StepIcon ? (
          <div className="rounded-2xl bg-card p-5 ring-1 ring-foreground/10">
            <div className="flex items-center gap-4">
              <span className="grid size-16 place-items-center rounded-xl bg-primary/12 text-primary">
                <StepIcon className="size-8" aria-hidden />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm text-muted-foreground">
                  Step {step.index + 1} of {step.total}
                </p>
                <p className="text-2xl font-semibold">{step.step.label}</p>
              </div>
              <p className="font-mono text-4xl font-semibold tabular">{stepValue(view)}</p>
            </div>
            <div className="mt-4 h-3 overflow-hidden rounded-full bg-muted">
              <div className={cn("h-full rounded-full transition-[width] duration-700", STATUS_META[view.status].solid)} style={{ width: `${step.progress * 100}%` }} />
            </div>
            <div className="mt-3 flex justify-between text-sm text-muted-foreground">
              <span>{nextStep ? `Next: ${nextStep.label}` : "Last step"}</span>
              <span className="tabular">
                Target {view.targetEndAt ? formatClock(view.targetEndAt) : "--"}
                {view.excessMin > 0 && <span className={cn("ml-2", excessTone(view.excessMin))}>+{formatHm(view.excessMin)}</span>}
              </span>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl bg-card p-5 text-lg text-muted-foreground ring-1 ring-foreground/10">{view.remark}</div>
        )}

        {view.batch && view.order && (
          <div className="grid grid-cols-2 gap-3 rounded-2xl bg-card p-5 ring-1 ring-foreground/10 sm:grid-cols-4">
            <div>
              <p className="text-xs text-muted-foreground">Batch</p>
              <p className="text-lg font-semibold">{view.batch.id}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Buyer</p>
              <p className="text-lg font-semibold">{view.buyer?.name}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Weight</p>
              <p className="text-lg font-semibold tabular">{view.batch.qtyKg} kg</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Shade</p>
              <ShadeSwatch hex={view.order.shade.hex} name={view.order.shade.name} className="text-lg font-semibold" />
            </div>
          </div>
        )}

        <div className="rounded-2xl bg-card p-5 ring-1 ring-foreground/10">
          <div className="mb-3 flex items-center justify-between">
            <p className="font-medium">{held ? "Machine on hold" : "Raise a hold"}</p>
            <Button variant="outline" size="lg" onClick={() => setScanning(true)}>
              <QrCode />
              Scan batch
            </Button>
          </div>
          {held ? (
            <Button
              className="h-16 w-full text-lg"
              onClick={() => {
                release(view.machine.id)
                toast.success(`${view.machine.id} resumed`)
              }}
            >
              <Play className="size-5" />
              Resume · {REASONS[view.state.run!.hold!.reason].label}
            </Button>
          ) : (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {HOLD_REASONS.map((reason) => (
                <Button
                  key={reason}
                  variant="outline"
                  className="h-16 flex-col gap-0.5 text-base whitespace-normal"
                  disabled={!running}
                  onClick={() => {
                    hold(view.machine.id, reason, HOLD_MINUTES)
                    toast.warning(`${view.machine.id} on hold`, { description: `${REASONS[reason].owner} notified` })
                  }}
                >
                  {REASONS[reason].label}
                  <span className="text-xs font-normal text-muted-foreground">{REASONS[reason].owner}</span>
                </Button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="rounded-2xl bg-card p-5 ring-1 ring-foreground/10">
        <p className="mb-3 font-medium">Shade check</p>
        {running ? <ShadeKeypad view={view} /> : <p className="text-sm text-muted-foreground">Available while a batch is in the machine.</p>}
      </div>
      <ScanDialog view={view} open={scanning} onOpenChange={setScanning} />
    </div>
  )
}
