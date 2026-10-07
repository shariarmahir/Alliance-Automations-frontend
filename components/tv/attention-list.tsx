"use client"

import { ShieldCheck } from "lucide-react"
import { AnimatePresence, motion } from "motion/react"
import { URGENCY_META } from "@/components/control/action-chip"
import { GlowCard } from "@/components/glow-card"
import { ActionQueue } from "@/components/plant/icons/console-icons"
import { actionQueue } from "@/lib/domain/actions"
import { usePlantDerived } from "@/lib/store/plant"
import { cn } from "@/lib/utils"

/** Rows that fit beside a ten-machine bay on a 1080p screen. */
const ROWS = 5

/** The floor's to-do list for the wall: what a passing supervisor should walk to next. */
export function AttentionList() {
  const queue = usePlantDerived(({ views, snapshot }) => actionQueue(views, snapshot!.now))
  const critical = queue.filter((item) => item.urgency === "critical").length

  return (
    <GlowCard tone={critical ? "var(--status-delayed)" : undefined} className="flex min-h-0 flex-col bg-card/45 p-4">
      <div className="flex items-center gap-2.5">
        <span className="grid size-9 place-items-center rounded-lg bg-brand/10 text-brand ring-1 ring-brand/20">
          <ActionQueue className="size-6" />
        </span>
        <p className="text-lg font-semibold">Needs attention</p>
        <span className="ml-auto text-sm tabular">
          <span className="font-semibold">{queue.length}</span>
          {critical > 0 && <span className="ml-2 font-medium text-delayed">{critical} critical</span>}
        </span>
      </div>
      {queue.length ? (
        <ul className="mt-3 flex min-h-0 flex-col divide-y overflow-hidden">
          <AnimatePresence initial={false}>
            {queue.slice(0, ROWS).map((item) => {
              const meta = URGENCY_META[item.urgency]
              return (
                <motion.li key={item.machineId} layout="position" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-3 py-2">
                  <span className={cn("grid h-10 w-12 shrink-0 place-items-center rounded-lg font-mono text-sm font-semibold ring-1 ring-inset", meta.className)}>
                    {item.machineId}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate font-medium">{item.title}</p>
                    <p className="truncate text-xs text-muted-foreground">{item.detail}</p>
                  </div>
                </motion.li>
              )
            })}
          </AnimatePresence>
        </ul>
      ) : (
        <p className="flex flex-1 flex-col items-center justify-center gap-2 py-6 text-center text-muted-foreground">
          <ShieldCheck className="size-8 text-running" aria-hidden />
          Every machine on standard
        </p>
      )}
    </GlowCard>
  )
}
