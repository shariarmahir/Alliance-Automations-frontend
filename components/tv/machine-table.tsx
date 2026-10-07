"use client"

import { motion } from "motion/react"
import { memo, type ReactNode } from "react"
import { ExcessTime } from "@/components/plant/excess"
import { PrepBadge, STATUS_META, StatusBadge } from "@/components/plant/status"
import { ShadeSwatch, StepReadout, stepValue } from "@/components/plant/step-readout"
import type { MachineView } from "@/lib/domain/types"
import { formatClock } from "@/lib/format"
import { usePlant } from "@/lib/store/plant"
import { cn } from "@/lib/utils"

const empty = <span className="text-muted-foreground">--</span>
const time = (at: number | null) => (at ? formatClock(at) : empty)

interface Column {
  header: string
  /** Container-query classes that drop the column as the board narrows. Least important columns go first. */
  hide?: string
  cell: (view: MachineView) => ReactNode
}

const COLUMNS: Column[] = [
  {
    header: "Machine",
    cell: ({ machine }) => (
      <span className="whitespace-nowrap">
        <span className="font-mono text-base font-semibold text-brand">{machine.id}</span> <span className="text-xs text-muted-foreground">{machine.name}</span>
      </span>
    ),
  },
  {
    header: "Batch",
    hide: "@max-[30rem]:hidden",
    cell: ({ batch, buyer }) =>
      batch ? (
        <span className="block leading-tight">
          <span className="font-medium">{batch.id}</span>
          <span className="block truncate text-xs text-muted-foreground">{buyer?.name}</span>
        </span>
      ) : (
        empty
      ),
  },
  {
    header: "Shade",
    hide: "@max-[62rem]:hidden",
    cell: ({ order }) =>
      order ? (
        <span className="block leading-tight">
          <ShadeSwatch hex={order.shade.hex} name={order.shade.name} />
          <span className="block text-xs text-muted-foreground tabular">{order.gsm} GSM</span>
        </span>
      ) : (
        empty
      ),
  },
  { header: "Kg", hide: "@max-[54rem]:hidden", cell: ({ batch }) => <span className="tabular">{batch ? batch.qtyKg.toLocaleString("en-US") : empty}</span> },
  { header: "Status", hide: "@max-[34rem]:hidden", cell: (view) => <StatusBadge status={view.status} /> },
  {
    header: "Live step",
    cell: (view) =>
      view.step ? (
        <div className="flex min-w-36 flex-col gap-1">
          <StepReadout view={view} />
          <div className="h-1 overflow-hidden rounded-full bg-muted">
            <div className={cn("h-full rounded-full transition-[width] duration-700", STATUS_META[view.status].solid)} style={{ width: `${view.step.progress * 100}%` }} />
          </div>
        </div>
      ) : (
        <span className="text-xs text-muted-foreground">{view.remark}</span>
      ),
  },
  { header: "Start", hide: "@max-[78rem]:hidden", cell: (view) => <span className="font-mono tabular">{time(view.startedAt)}</span> },
  { header: "Target", hide: "@max-[70rem]:hidden", cell: (view) => <span className="font-mono tabular">{time(view.targetEndAt)}</span> },
  {
    header: "Projected",
    hide: "@max-[46rem]:hidden",
    cell: (view) => <span className="font-mono tabular">{view.state.phase === "running" ? time(view.projectedEndAt) : empty}</span>,
  },
  { header: "Excess", cell: (view) => <ExcessTime minutes={view.excessMin} empty="--" /> },
  {
    header: "Next batch",
    hide: "@max-[86rem]:hidden",
    cell: (view) => <PrepBadge prep={view.state.next ? view.state.next.prep : view.state.run ? "loaded" : null} />,
  },
  { header: "Remarks", hide: "@max-[94rem]:hidden", cell: (view) => <span className="block max-w-56 truncate text-sm text-muted-foreground">{view.remark}</span> },
]

function Row({ view }: { view: MachineView }) {
  const attention = view.status === "delayed" || view.status === "held"
  return (
    <tr className={cn("relative border-b border-border/60 last:border-0", attention && STATUS_META[view.status].soft, view.status === "offline" && "bg-hatch")}>
      {COLUMNS.map((column, index) => (
        <td key={column.header} className={cn("py-1.5 pr-3 align-middle", index === 0 && "relative pl-3", column.hide)}>
          {index === 0 && <span className={cn("absolute inset-y-1.5 left-0 w-1 rounded-full", STATUS_META[view.status].solid)} aria-hidden />}
          {column.cell(view)}
        </td>
      ))}
    </tr>
  )
}

const signature = (view: MachineView) =>
  [view.status, view.batch?.id, view.step?.index, Math.round((view.step?.progress ?? 0) * 100), view.excessMin, view.remark, stepValue(view), view.state.next?.prep, view.projectedEndAt && formatClock(view.projectedEndAt)].join("|")

const MachineRow = memo(Row, (previous, next) => signature(previous.view) === signature(next.view))

export function MachineTable({ bay }: { bay: number }) {
  const views = usePlant((state) => state.views).filter((view) => view.machine.bay === bay)
  return (
    <motion.div key={bay} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="@container min-h-0 flex-1">
      <div className="h-full overflow-y-auto rounded-2xl bg-card/45 ring-1 ring-foreground/10">
        <table className="h-full w-full text-sm">
          <thead className="sticky top-0 z-10 bg-card">
            <tr className="border-b text-left text-[11px] tracking-wider text-muted-foreground uppercase">
              {COLUMNS.map((column, index) => (
                <th key={column.header} className={cn("py-2.5 pr-3 font-medium whitespace-nowrap", index === 0 && "pl-3", column.hide)}>
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {views.map((view) => (
              <MachineRow key={view.machine.id} view={view} />
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  )
}
