"use client"

import { Bot, Sparkles, User } from "lucide-react"
import { AnimatePresence, motion } from "motion/react"
import { useState } from "react"
import { Panel } from "@/components/panel"
import { Button } from "@/components/ui/button"
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ASSISTANT_QUESTIONS } from "@/lib/ai/agents"
import { useKpis, usePlant, useSnapshot } from "@/lib/store/plant"

interface Exchange {
  id: number
  question: string
  lines: string[]
}

export function Assistant() {
  const views = usePlant((state) => state.views)
  const snapshot = useSnapshot((snapshot) => snapshot)
  const kpis = useKpis()
  const dailyKg = usePlant((state) => state.history.at(-1)?.producedKg ?? 60_000)
  const [thread, setThread] = useState<Exchange[]>([])

  const ask = (id: string) => {
    const preset = ASSISTANT_QUESTIONS.find((q) => q.id === id)!
    const lines = preset.answer({ views, snapshot, kpis, dailyKg })
    setThread((current) => [...current, { id: current.length, question: preset.question, lines }].slice(-6))
  }

  return (
    <Panel className="h-full">
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
    </Panel>
  )
}
