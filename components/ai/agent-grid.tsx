"use client"

import { ArrowRight, Bot } from "lucide-react"
import { Panel } from "@/components/panel"
import { Reveal } from "@/components/reveal"
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AGENTS, agentInsights, type AgentStage } from "@/lib/ai/agents"
import { useKpis, usePlant, useSnapshot } from "@/lib/store/plant"
import { cn } from "@/lib/utils"

const STAGE: Record<AgentStage, { label: string; className: string }> = {
  live: { label: "Live", className: "bg-running/12 text-running ring-running/30" },
  shadow: { label: "Shadow mode", className: "bg-complete/12 text-complete ring-complete/30" },
  planned: { label: "Planned", className: "bg-muted text-muted-foreground ring-border" },
}

export function AgentGrid() {
  const views = usePlant((state) => state.views)
  const snapshot = useSnapshot((snapshot) => snapshot)
  const kpis = useKpis()
  const alerts = usePlant((state) => state.alerts)
  const insights = agentInsights(views, snapshot, kpis, alerts)

  return (
    <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
      {AGENTS.map((agent, index) => (
        <Reveal key={agent.id} order={index}>
          <Panel className="h-full">
            <CardHeader>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="grid size-10 place-items-center rounded-lg bg-primary/12 text-primary">
                    <Bot className="size-5" aria-hidden />
                  </span>
                  <div>
                    <CardTitle>{agent.name}</CardTitle>
                    <CardDescription>{agent.role}</CardDescription>
                  </div>
                </div>
                <span className={cn("rounded-md px-2 py-0.5 text-xs font-medium whitespace-nowrap ring-1 ring-inset", STAGE[agent.stage].className)}>
                  {STAGE[agent.stage].label}
                </span>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 text-sm">
              <div className="rounded-lg bg-muted/50 p-3">
                <p className="font-medium tabular">{insights[agent.id].headline}</p>
                <p className="mt-0.5 text-xs text-muted-foreground text-pretty">{insights[agent.id].detail}</p>
              </div>
              <p className="text-xs text-muted-foreground text-pretty">{agent.method}</p>
              <div className="flex flex-wrap items-center gap-1.5 text-xs">
                {agent.inputs.map((input) => (
                  <span key={input} className="rounded-md bg-secondary px-1.5 py-0.5">
                    {input}
                  </span>
                ))}
                <ArrowRight className="size-3.5 text-muted-foreground" aria-hidden />
                {agent.actions.map((action) => (
                  <span key={action} className="rounded-md bg-primary/10 px-1.5 py-0.5 text-primary">
                    {action}
                  </span>
                ))}
              </div>
              <p className="mt-auto border-t pt-3 text-xs text-muted-foreground">
                Phase {agent.phase} · needs {agent.needs.toLowerCase()}
              </p>
            </CardContent>
          </Panel>
        </Reveal>
      ))}
    </div>
  )
}
