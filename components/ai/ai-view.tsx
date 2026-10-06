"use client"

import { AgentGrid } from "@/components/ai/agent-grid"
import { Assistant } from "@/components/ai/assistant"
import { DataFlow } from "@/components/ai/data-flow"
import { PlantGate } from "@/components/plant/plant-gate"
import { Reveal } from "@/components/reveal"

export function AiView() {
  return (
    <PlantGate>
      <div className="flex flex-col gap-4">
        <Reveal>
          <DataFlow />
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
