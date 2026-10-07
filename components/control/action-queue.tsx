"use client"

import { ShieldCheck } from "lucide-react"
import { AnimatePresence, motion } from "motion/react"
import Link from "next/link"
import { ActionButton } from "@/components/control/action-button"
import { URGENCY_META } from "@/components/control/action-chip"
import { Panel } from "@/components/panel"
import { PanelTitle } from "@/components/panel-title"
import { ActionQueue as ActionQueueIcon, Shift } from "@/components/plant/icons/console-icons"
import { CardAction, CardContent, CardDescription, CardHeader } from "@/components/ui/card"
import type { NextAction } from "@/lib/domain/actions"
import { machineById } from "@/lib/domain/catalog"
import type { MachineView } from "@/lib/domain/types"
import { cn } from "@/lib/utils"

function QueueRow({ action, view }: { action: NextAction; view: MachineView | undefined }) {
  const meta = URGENCY_META[action.urgency]
  const Icon = meta.icon
  return (
    <motion.li
      layout="position"
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.25 }}
      className="flex flex-wrap items-center gap-x-4 gap-y-2 py-3 sm:flex-nowrap"
    >
      <span className={cn("grid h-11 w-14 shrink-0 place-items-center rounded-lg font-mono text-sm font-semibold ring-1 ring-inset", meta.className)}>
        {action.machineId}
      </span>
      <div className="min-w-0 flex-1">
        <p className="flex items-center gap-2 text-sm font-medium">
          <Icon className={cn("size-3.5 shrink-0", meta.text)} aria-hidden />
          <span className="truncate">{action.title}</span>
        </p>
        <p className="truncate text-xs text-muted-foreground">
          <Link href={`/control/${action.machineId}`} className="hover:text-foreground hover:underline">
            {machineById.get(action.machineId)?.name}
          </Link>
          {view?.buyer && ` · ${view.buyer.name}`} · {action.detail}
        </p>
      </div>
      <div className="flex w-full justify-end sm:w-auto">
        <ActionButton action={action} />
      </div>
    </motion.li>
  )
}

/** Efficiency mode: every machine waiting on a person, most urgent first, each with its one-tap command. */
export function ActionQueue({ actions, upcoming, views }: { actions: NextAction[]; upcoming: NextAction[]; views: MachineView[] }) {
  const byId = new Map(views.map((view) => [view.machine.id, view]))
  const critical = actions.filter((action) => action.urgency === "critical").length

  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
      <Panel>
        <CardHeader>
          <PanelTitle icon={ActionQueueIcon}>Action queue</PanelTitle>
          <CardDescription>Machines waiting on a person, most urgent first. One tap clears most of them.</CardDescription>
          <CardAction className="text-right text-sm tabular">
            <span className="font-semibold">{actions.length}</span> <span className="text-muted-foreground">to do</span>
            {critical > 0 && <span className="ml-2 font-medium text-delayed">{critical} critical</span>}
          </CardAction>
        </CardHeader>
        <CardContent>
          {actions.length ? (
            <ul className="flex flex-col divide-y">
              <AnimatePresence initial={false}>
                {actions.map((action) => (
                  <QueueRow key={`${action.machineId}-${action.title}`} action={action} view={byId.get(action.machineId)} />
                ))}
              </AnimatePresence>
            </ul>
          ) : (
            <div className="flex flex-col items-center gap-2 py-12 text-center text-sm text-muted-foreground">
              <ShieldCheck className="size-7 text-running" aria-hidden />
              Nothing needs you right now. Every machine in view is on standard.
            </div>
          )}
        </CardContent>
      </Panel>

      <Panel className="self-start">
        <CardHeader>
          <PanelTitle icon={Shift}>Coming up</PanelTitle>
          <CardDescription>Machines waiting on planning, the batch section or maintenance</CardDescription>
        </CardHeader>
        <CardContent>
          {upcoming.length ? (
            <ul className="flex flex-col divide-y text-sm">
              {upcoming.map((item) => (
                <li key={item.machineId} className="flex items-center gap-3 py-2.5">
                  <span className="w-10 shrink-0 font-mono text-xs text-muted-foreground">{item.machineId}</span>
                  <span className="min-w-0 flex-1 truncate">{item.title}</span>
                  <span className="shrink-0 text-xs text-muted-foreground tabular">{item.detail.split(" · ").at(-1)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="py-6 text-center text-sm text-muted-foreground">Every machine has its next batch.</p>
          )}
        </CardContent>
      </Panel>
    </div>
  )
}
