"use client"

import { AnimatePresence, motion } from "motion/react"
import { ArrowRight, Bot, Sparkles, User } from "lucide-react"
import { useState } from "react"
import { PlantGate } from "@/components/plant/plant-gate"
import { Reveal } from "@/components/reveal"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { AGENTS, ASSISTANT_QUESTIONS, agentInsights, type AgentStage } from "@/lib/ai/agents"
import { usePlant } from "@/lib/store/plant"
import { cn } from "@/lib/utils"

const STAGE: Record<AgentStage, { label: string; className: string }> = {
  live: { label: "Live", className: "bg-running/12 text-running ring-running/30" },
  shadow: { label: "Shadow mode", className: "bg-complete/12 text-complete ring-complete/30" },
  planned: { label: "Planned", className: "bg-muted text-muted-foreground ring-border" },
}

const PIPELINE = [
  { label: "Signals", detail: "PLC, sensors, operator tablets" },
  { label: "Plant data", detail: "Batches, steps, holds, ΔE" },
  { label: "Agents", detail: "Rules, models, solver, LLM" },
  { label: "Actions", detail: "Alerts, plans, answers" },
  { label: "People", detail: "Approve before anything changes" },
]

function AgentGrid() {
  const views = usePlant((state) => state.views)
  const snapshot = usePlant((state) => state.snapshot)!
  const kpis = usePlant((state) => state.kpis)!
  const alerts = usePlant((state) => state.alerts)
  const insights = agentInsights(views, snapshot, kpis, alerts)

  return (
    <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
      {AGENTS.map((agent, index) => (
        <Reveal key={agent.id} order={index}>
          <Card className="h-full">
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
          </Card>
        </Reveal>
      ))}
    </div>
  )
}

interface Exchange {
  id: number
  question: string
  lines: string[]
}

function Assistant() {
  const views = usePlant((state) => state.views)
  const snapshot = usePlant((state) => state.snapshot)!
  const kpis = usePlant((state) => state.kpis)!
  const dailyKg = usePlant((state) => state.history.at(-1)?.producedKg ?? 60_000)
  const [thread, setThread] = useState<Exchange[]>([])

  const ask = (id: string) => {
    const preset = ASSISTANT_QUESTIONS.find((q) => q.id === id)!
    const lines = preset.answer({ views, snapshot, kpis, dailyKg })
    setThread((current) => [...current, { id: current.length, question: preset.question, lines }].slice(-6))
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="size-4 text-primary" aria-hidden />
          Foreman assistant
        </CardTitle>
        <CardDescription>Answers are computed from the live plant feed. In phase 4 Claude takes over the wording through the same read-only API.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <ScrollArea className="h-80 rounded-lg bg-muted/30 p-3">
          {!thread.length && <p className="py-24 text-center text-sm text-muted-foreground">Pick a question below.</p>}
          <div className="flex flex-col gap-4">
            <AnimatePresence initial={false}>
              {thread.map((exchange) => (
                <motion.div key={exchange.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-2">
                  <div className="flex items-start gap-2 self-end">
                    <p className="rounded-lg bg-primary px-3 py-2 text-sm text-primary-foreground">{exchange.question}</p>
                    <User className="mt-2 size-4 text-muted-foreground" aria-hidden />
                  </div>
                  <div className="flex items-start gap-2">
                    <Bot className="mt-2 size-4 shrink-0 text-primary" aria-hidden />
                    <div className="flex flex-col gap-1 rounded-lg bg-card px-3 py-2 text-sm ring-1 ring-foreground/10">
                      {exchange.lines.map((line, i) => (
                        <motion.p key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 + i * 0.12 }} className="tabular">
                          {line}
                        </motion.p>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </ScrollArea>
        <div className="flex flex-wrap gap-2">
          {ASSISTANT_QUESTIONS.map((preset) => (
            <Button key={preset.id} variant="outline" size="sm" onClick={() => ask(preset.id)}>
              {preset.question}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function Pipeline() {
  return (
    <Card size="sm">
      <CardContent>
        <ol className="grid gap-3 sm:grid-cols-5">
          {PIPELINE.map((step, index) => (
            <li key={step.label} className="relative flex flex-col gap-0.5 rounded-lg bg-muted/40 p-3">
              <span className="font-mono text-[11px] text-primary">0{index + 1}</span>
              <span className="text-sm font-medium">{step.label}</span>
              <span className="text-xs text-muted-foreground">{step.detail}</span>
            </li>
          ))}
        </ol>
      </CardContent>
    </Card>
  )
}

export function AiView() {
  return (
    <PlantGate>
      <div className="flex flex-col gap-4">
        <Reveal>
          <Pipeline />
        </Reveal>
        <div className="grid gap-4 2xl:grid-cols-[1fr_440px]">
          <AgentGrid />
          <Reveal order={2} className="2xl:sticky 2xl:top-20 2xl:self-start">
            <Assistant />
          </Reveal>
        </div>
      </div>
    </PlantGate>
  )
}
