"use client"

import { ShieldCheck } from "lucide-react"
import Link from "next/link"
import { ActionButton } from "@/components/control/action-button"
import { URGENCY_META } from "@/components/control/action-chip"
import { Panel } from "@/components/panel"
import { PanelTitle } from "@/components/panel-title"
import { ActionQueue } from "@/components/plant/icons/console-icons"
import { Button } from "@/components/ui/button"
import { CardAction, CardContent, CardDescription, CardHeader } from "@/components/ui/card"
import { actionQueue } from "@/lib/domain/actions"
import { usePlantDerived } from "@/lib/store/plant"
import { cn } from "@/lib/utils"

const ROWS = 5

/** The top of the operator action queue, so the overview says what to do next, not only what is wrong. */
export function ActionCard() {
  const queue = usePlantDerived(({ views, snapshot }) => actionQueue(views, snapshot!.now))

  return (
    <Panel className="h-full">
      <CardHeader>
        <PanelTitle icon={ActionQueue}>Needs you now</PanelTitle>
        <CardDescription>The next best action on each machine, most urgent first</CardDescription>
        <CardAction>
          <Button variant="outline" size="sm" asChild>
            <Link href="/control">All {queue.length}</Link>
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        {queue.length ? (
          <ul className="flex flex-col divide-y">
            {queue.slice(0, ROWS).map((action) => {
              const meta = URGENCY_META[action.urgency]
              return (
                <li key={action.machineId} className="flex items-center gap-3 py-2.5">
                  <span className={cn("grid h-9 w-11 shrink-0 place-items-center rounded-md font-mono text-xs font-semibold ring-1 ring-inset", meta.className)}>
                    {action.machineId}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{action.title}</p>
                    <p className="truncate text-xs text-muted-foreground">{action.detail}</p>
                  </div>
                  <ActionButton action={action} />
                </li>
              )
            })}
          </ul>
        ) : (
          <div className="flex flex-col items-center gap-2 py-10 text-center text-sm text-muted-foreground">
            <ShieldCheck className="size-6 text-running" aria-hidden />
            Nothing is waiting on an operator.
          </div>
        )}
      </CardContent>
    </Panel>
  )
}
