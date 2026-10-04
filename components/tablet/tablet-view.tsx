"use client"

import { Delete, Play, QrCode, ScanLine } from "lucide-react"
import { motion } from "motion/react"
import { useState } from "react"
import { toast } from "sonner"
import { LogoMark } from "@/components/brand/logo"
import { PlantGate } from "@/components/plant/plant-gate"
import { STATUS_META, StatusBadge, StatusDot } from "@/components/plant/status"
import { STEP_ICON, ShadeSwatch, stepValue } from "@/components/plant/step-readout"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { BAYS, HOLD_REASONS, REASONS } from "@/lib/domain/catalog"
import type { MachineView } from "@/lib/domain/types"
import { formatClock, formatClockSeconds, formatHm } from "@/lib/format"
import { SHADE_TOLERANCE_DE, usePlant } from "@/lib/store/plant"
import { cn } from "@/lib/utils"

const HOLD_MINUTES = 20
const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "0"]

function ShadeKeypad({ view }: { view: MachineView }) {
  const recordShadeCheck = usePlant((state) => state.recordShadeCheck)
  const [entry, setEntry] = useState("")
  const value = Number(entry)
  const valid = entry !== "" && entry !== "." && Number.isFinite(value)

  const press = (key: string) => setEntry((current) => (key === "." && current.includes(".") ? current : (current + key).slice(0, 4)))

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-baseline justify-between rounded-xl bg-muted/60 px-4 py-3">
        <span className="text-sm text-muted-foreground">ΔE</span>
        <span className={cn("font-mono text-3xl font-semibold tabular", valid && (value <= SHADE_TOLERANCE_DE ? "text-running" : "text-delayed"))}>
          {entry || "0.00"}
        </span>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {KEYS.map((key) => (
          <Button key={key} variant="secondary" className="h-14 text-xl" onClick={() => press(key)}>
            {key}
          </Button>
        ))}
        <Button variant="secondary" className="h-14" onClick={() => setEntry((current) => current.slice(0, -1))} aria-label="Delete">
          <Delete className="size-5" />
        </Button>
      </div>
      <Button
        className="h-14 text-base"
        disabled={!valid}
        onClick={() => {
          recordShadeCheck(view.machine.id, value)
          setEntry("")
          if (value <= SHADE_TOLERANCE_DE) toast.success(`Shade passed on ${view.machine.id}`)
          else toast.error(`Shade correction raised on ${view.machine.id}`)
        }}
      >
        Save shade check
      </Button>
    </div>
  )
}

function ScanDialog({ view, open, onOpenChange }: { view: MachineView; open: boolean; onOpenChange: (open: boolean) => void }) {
  const expected = view.state.next?.batchId ?? view.batch?.id
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Scan batch card</DialogTitle>
          <DialogDescription>Hold the QR code on the batch card inside the frame.</DialogDescription>
        </DialogHeader>
        <div className="relative grid aspect-square place-items-center overflow-hidden rounded-xl bg-muted">
          <QrCode className="size-24 text-muted-foreground/40" aria-hidden />
          <motion.span
            className="absolute inset-x-8 h-0.5 bg-primary shadow-[0_0_12px_var(--primary)]"
            animate={{ top: ["15%", "85%", "15%"] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
        <Button
          className="h-12"
          disabled={!expected}
          onClick={() => {
            onOpenChange(false)
            toast.success(`${expected} matches ${view.machine.id}`, { description: "Batch, recipe and machine verified" })
          }}
        >
          <ScanLine />
          Simulate scan of {expected ?? "batch"}
        </Button>
      </DialogContent>
    </Dialog>
  )
}

function MachinePanel({ view }: { view: MachineView }) {
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
                {view.excessMin > 0 && <span className={cn("ml-2", view.excessMin >= 15 ? "text-delayed" : "text-held")}>+{formatHm(view.excessMin)}</span>}
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

function Tablet() {
  const views = usePlant((state) => state.views)
  const now = usePlant((state) => state.snapshot!.now)
  const [bay, setBay] = useState(1)
  const [machineId, setMachineId] = useState("D01")
  const bayViews = views.filter((view) => view.machine.bay === bay)
  const selected = bayViews.find((view) => view.machine.id === machineId) ?? bayViews[0]

  return (
    <div className="flex h-dvh flex-col">
      <header className="flex items-center gap-4 border-b px-4 py-3">
        <LogoMark className="size-9" />
        <div className="flex gap-1.5">
          {BAYS.map((option) => (
            <Button
              key={option.bay}
              variant={option.bay === bay ? "default" : "outline"}
              size="lg"
              className="h-11 px-4 text-base"
              onClick={() => {
                setBay(option.bay)
                setMachineId(`D${String((option.bay - 1) * 10 + 1).padStart(2, "0")}`)
              }}
            >
              {option.label}
            </Button>
          ))}
        </div>
        <div className="ml-auto text-right">
          <p className="font-mono text-xl font-semibold tabular">{formatClockSeconds(now)}</p>
          <p className="text-xs text-muted-foreground">Shift A · Operator tablet</p>
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        <nav className="flex w-60 shrink-0 flex-col gap-1.5 overflow-y-auto border-r p-3" aria-label="Machines">
          {bayViews.map((view) => (
            <button
              key={view.machine.id}
              type="button"
              onClick={() => setMachineId(view.machine.id)}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-3 text-left ring-1 transition-colors",
                view.machine.id === selected.machine.id ? "bg-primary/12 ring-primary" : "ring-transparent hover:bg-muted",
              )}
              aria-current={view.machine.id === selected.machine.id}
            >
              <StatusDot status={view.status} />
              <div className="min-w-0">
                <p className="font-semibold">
                  <span className="font-mono text-sm text-muted-foreground">{view.machine.id}</span> {view.machine.name}
                </p>
                <p className="truncate text-xs text-muted-foreground">{view.step?.step.label ?? STATUS_META[view.status].label}</p>
              </div>
            </button>
          ))}
        </nav>
        <MachinePanel key={selected.machine.id} view={selected} />
      </div>
    </div>
  )
}

export function TabletView() {
  return (
    <PlantGate fallback={<div className="grid h-dvh place-items-center text-muted-foreground">Connecting to plant feed…</div>}>
      <Tablet />
    </PlantGate>
  )
}
