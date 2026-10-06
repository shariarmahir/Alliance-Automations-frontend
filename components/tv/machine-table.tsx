"use client"

import { motion } from "motion/react"
import { ExcessTime } from "@/components/plant/excess"
import { PrepBadge, StatusBadge } from "@/components/plant/status"
import { ShadeSwatch, StepReadout } from "@/components/plant/step-readout"
import type { MachineView } from "@/lib/domain/types"
import { formatClock, formatHm } from "@/lib/format"
import { usePlant } from "@/lib/store/plant"

const HEADERS = ["MC", "Batch prep", "Batch", "Buyer", "Order", "Qty kg", "GSM", "Shade", "Status", "Live step", "Start", "Target", "Running", "Excess", "Unload", "Remarks"]

function Row({ view }: { view: MachineView }) {
  const { machine, batch, order, buyer } = view
  const empty = <span className="text-muted-foreground">--</span>
  const unloadAt = view.state.phase === "complete" ? view.projectedEndAt : null
  return (
    <tr className="border-b border-border/60">
      <td className="py-1.5 pr-3 whitespace-nowrap">
        <span className="font-mono text-base font-semibold text-primary">{machine.id}</span>{" "}
        <span className="text-xs text-muted-foreground">{machine.name}</span>
      </td>
      <td className="pr-3">
        <PrepBadge prep={view.state.run ? "loaded" : (view.state.next?.prep ?? null)} />
      </td>
      <td className="pr-3 font-medium">{batch?.id ?? empty}</td>
      <td className="pr-3">{buyer?.name ?? empty}</td>
      <td className="pr-3 text-muted-foreground">{order?.id ?? empty}</td>
      <td className="pr-3 tabular">{batch ? batch.qtyKg.toLocaleString("en-US") : empty}</td>
      <td className="pr-3 tabular">{order?.gsm ?? empty}</td>
      <td className="pr-3">{order ? <ShadeSwatch hex={order.shade.hex} name={order.shade.name} /> : empty}</td>
      <td className="pr-3">
        <StatusBadge status={view.status} />
      </td>
      <td className="pr-3">{view.step ? <StepReadout view={view} /> : empty}</td>
      <td className="pr-3 font-mono tabular">{view.startedAt ? formatClock(view.startedAt) : empty}</td>
      <td className="pr-3 font-mono tabular">{view.targetEndAt ? formatClock(view.targetEndAt) : empty}</td>
      <td className="pr-3 font-mono tabular">{view.runningMin ? formatHm(view.runningMin) : empty}</td>
      <td className="pr-3">
        <ExcessTime minutes={view.excessMin} empty="--" />
      </td>
      <td className="pr-3 font-mono tabular">{unloadAt ? formatClock(unloadAt) : empty}</td>
      <td className="max-w-48 truncate text-sm text-muted-foreground">{view.remark}</td>
    </tr>
  )
}

export function MachineTable({ bay }: { bay: number }) {
  const views = usePlant((state) => state.views).filter((view) => view.machine.bay === bay)
  return (
    <motion.div key={bay} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="min-h-0 flex-1 px-8 pt-4">
      <div className="h-full overflow-hidden rounded-xl bg-card px-4 ring-1 ring-foreground/10">
        <table className="h-full w-full text-sm">
          <thead>
            <tr className="border-b text-left text-[11px] tracking-wider text-muted-foreground uppercase">
              {HEADERS.map((header) => (
                <th key={header} className="py-2.5 pr-3 font-medium whitespace-nowrap">
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
