"use client"

import NumberFlow from "@number-flow/react"
import { motion } from "motion/react"
import { BellRing } from "lucide-react"
import { useEffect, useState } from "react"
import { BRAND, LogoMark } from "@/components/brand/logo"
import { alertTitle } from "@/components/plant/alert-list"
import { PlantGate } from "@/components/plant/plant-gate"
import { PrepBadge, STATUS_META, StatusBadge } from "@/components/plant/status"
import { ShadeSwatch, StepReadout } from "@/components/plant/step-readout"
import { BAYS } from "@/lib/domain/catalog"
import type { MachineView } from "@/lib/domain/types"
import { formatClock, formatClockSeconds, formatHm, formatLongDate } from "@/lib/format"
import { usePlant } from "@/lib/store/plant"
import { cn } from "@/lib/utils"

const ROTATE_MS = 15_000

function Header() {
  const now = usePlant((state) => state.snapshot!.now)
  return (
    <header className="flex items-center gap-5 border-b px-8 py-4">
      <LogoMark className="size-11" />
      <div className="leading-tight">
        <p className="text-2xl font-semibold tracking-tight">
          Dyeing floor <span className="text-muted-foreground">·</span> <span className="text-primary">Live monitoring</span>
        </p>
        <p className="text-sm text-muted-foreground">
          {BRAND.company} · {BRAND.product}
        </p>
      </div>
      <div className="ml-auto text-right">
        <p className="font-mono text-4xl font-semibold text-held tabular">{formatClockSeconds(now)}</p>
        <p className="text-sm text-muted-foreground">{formatLongDate(now)}</p>
      </div>
    </header>
  )
}

function KpiStrip() {
  const kpis = usePlant((state) => state.kpis)!
  const tiles = [
    { label: "Total machines", value: kpis.total, tone: "text-primary" },
    { label: "Running", value: kpis.running, tone: STATUS_META.running.text },
    { label: "Delayed", value: kpis.delayed, tone: STATUS_META.delayed.text },
    { label: "On hold", value: kpis.held, tone: STATUS_META.held.text },
    { label: "Idle", value: kpis.idle, tone: STATUS_META.idle.text },
    { label: "Batch ready", value: kpis.batchesPrepared, tone: STATUS_META.ready.text },
    { label: "Not available", value: kpis.offline, tone: STATUS_META.offline.text },
    { label: "Today's production", value: kpis.producedKg, tone: "text-primary", suffix: " kg" },
    { label: "Completed today", value: kpis.batchesCompleted, tone: STATUS_META.running.text },
  ]
  return (
    <div className="grid grid-cols-9 gap-3 px-8 pt-5">
      {tiles.map((tile) => (
        <div key={tile.label} className="rounded-xl bg-card px-4 py-3 ring-1 ring-foreground/10">
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">{tile.label}</p>
          <NumberFlow value={tile.value} suffix={tile.suffix} className={cn("text-3xl font-semibold tabular", tile.tone)} />
        </div>
      ))}
    </div>
  )
}

const HEADERS = ["MC", "Batch prep", "Batch", "Buyer", "Order", "Qty kg", "GSM", "Shade", "Status", "Live step", "Start", "Target", "Running", "Excess", "Unload", "Remarks"]

function Row({ view }: { view: MachineView }) {
  const { machine, batch, order, buyer } = view
  const empty = <span className="text-muted-foreground">--</span>
  const unloadAt = view.state.phase === "complete" ? view.projectedEndAt : null
  return (
    <tr className="border-b border-border/60">
      <td className="py-2.5 pr-3">
        <p className="font-mono text-lg font-semibold text-primary">{machine.id}</p>
        <p className="text-xs text-muted-foreground">{machine.name}</p>
      </td>
      <td className="pr-3">
        <PrepBadge prep={view.state.next?.prep ?? null} />
      </td>
      <td className="pr-3 font-medium">{batch?.id ?? empty}</td>
      <td className="pr-3">{buyer?.name ?? empty}</td>
      <td className="pr-3 text-muted-foreground">{order?.id ?? empty}</td>
      <td className="pr-3 tabular">{batch ? batch.qtyKg.toLocaleString("en-US") : empty}</td>
      <td className="pr-3 tabular">{order?.gsm ?? empty}</td>
      <td className="pr-3">{order ? <ShadeSwatch hex={order.shade.hex} name={order.shade.name} /> : empty}</td>
      <td className="pr-3">
        <StatusBadge status={view.status} className="h-7 text-sm" />
      </td>
      <td className="pr-3">{view.step ? <StepReadout view={view} /> : empty}</td>
      <td className="pr-3 font-mono tabular">{view.startedAt ? formatClock(view.startedAt) : empty}</td>
      <td className="pr-3 font-mono tabular">{view.targetEndAt ? formatClock(view.targetEndAt) : empty}</td>
      <td className="pr-3 font-mono tabular">{view.runningMin ? formatHm(view.runningMin) : empty}</td>
      <td className={cn("pr-3 font-mono tabular", view.excessMin >= 15 ? "text-delayed" : view.excessMin > 0 ? "text-held" : "")}>
        {view.excessMin > 0 ? `+${formatHm(view.excessMin)}` : empty}
      </td>
      <td className="pr-3 font-mono tabular">{unloadAt ? formatClock(unloadAt) : empty}</td>
      <td className="max-w-48 truncate text-sm text-muted-foreground">{view.remark}</td>
    </tr>
  )
}

function MachineTable({ bay }: { bay: number }) {
  const views = usePlant((state) => state.views).filter((view) => view.machine.bay === bay)
  return (
    <motion.div key={bay} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="min-h-0 flex-1 px-8 pt-4">
      <div className="h-full overflow-hidden rounded-xl bg-card px-4 ring-1 ring-foreground/10">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-[11px] tracking-wider text-muted-foreground uppercase">
              {HEADERS.map((header) => (
                <th key={header} className="py-3 pr-3 font-medium">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {views.map((view) => (
              <Row key={view.machine.id} view={view} />
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  )
}

function BayTabs({ bay, onSelect }: { bay: number; onSelect: (bay: number) => void }) {
  return (
    <div className="grid grid-cols-5 gap-3 px-8 pt-4">
      {BAYS.map((option) => {
        const active = option.bay === bay
        return (
          <button
            key={option.bay}
            type="button"
            onClick={() => onSelect(option.bay)}
            className={cn(
              "relative overflow-hidden rounded-xl px-4 py-2.5 text-left ring-1 transition-colors",
              active ? "bg-primary/15 ring-primary" : "bg-card ring-foreground/10 hover:ring-foreground/25",
            )}
          >
            <p className={cn("font-semibold", active && "text-primary")}>Dyeing · {option.label}</p>
            <p className="text-xs text-muted-foreground">Machines {option.range}</p>
            {active && (
              <motion.span
                key={bay}
                className="absolute inset-x-0 bottom-0 h-0.5 origin-left bg-primary"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: ROTATE_MS / 1000, ease: "linear" }}
              />
            )}
          </button>
        )
      })}
    </div>
  )
}

function AlertTicker() {
  const alerts = usePlant((state) => state.alerts)
  const renderItems = (copy: string) =>
    alerts.length ? (
      alerts.map((alert) => (
        <span key={`${alert.id}${copy}`} className="inline-flex items-center gap-3 px-6">
          <span className={cn("font-mono font-semibold", alert.severity === "critical" ? "text-delayed" : "text-held")}>{alert.machineId}</span>
          <span>{alert.batchId}</span>
          <span className={cn("font-mono", alert.excessMin >= 15 ? "text-delayed" : "text-held")}>+{formatHm(alert.excessMin)}</span>
          <span className="text-muted-foreground">{alertTitle(alert)}</span>
          <span className="text-border">|</span>
        </span>
      ))
    ) : (
      <span className="px-6 text-running">All machines within standard</span>
    )

  return (
    <footer className="mx-8 mt-4 mb-5 flex items-center overflow-hidden rounded-xl bg-card ring-1 ring-delayed/40">
      <div className="z-10 flex shrink-0 items-center gap-2 bg-delayed px-5 py-3 font-semibold text-white">
        <BellRing className="size-5" aria-hidden />
        Alerts ({alerts.length})
      </div>
      <div className="min-w-0 flex-1 overflow-hidden">
        <div className="flex w-max animate-marquee text-lg whitespace-nowrap" style={{ ["--marquee-duration" as string]: `${Math.max(20, alerts.length * 7)}s` }}>
          <span className="inline-flex">{renderItems("")}</span>
          <span className="inline-flex" aria-hidden>
            {renderItems("-copy")}
          </span>
        </div>
      </div>
    </footer>
  )
}

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
    <div className="dark min-h-dvh bg-background text-foreground bg-blueprint">
      <PlantGate fallback={<div className="grid h-dvh place-items-center text-muted-foreground">Connecting to plant feed…</div>}>
        <Board />
      </PlantGate>
    </div>
  )
}
