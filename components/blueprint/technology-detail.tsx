"use client"

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { GlowCard } from "@/components/glow-card"
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import { LazyMount } from "@/components/blueprint/lazy-mount"
import { ResponsiveTable } from "@/components/blueprint/responsive-table"
import { LAYER_META } from "@/lib/blueprint/build"
import { TECH_REASONS, UTILISATION_CURVE } from "@/lib/blueprint/content"

const curveConfig = {
  baseline: { label: "Today", color: "var(--chart-2)" },
  withSystem: { label: "With the live system", color: "var(--primary)" },
} satisfies ChartConfig

const OUTCOMES = [
  { title: "Efficiency", body: "Less idle time between batches and fewer re-dyes, because problems are seen while they can still be fixed." },
  { title: "Production", body: "More batches per machine per day from the same floor, with no new machines." },
  { title: "Control", body: "One live source, explainable rules and one-tap commands, so the team trusts the numbers and acts fast." },
]

const layerName = (id: string) => LAYER_META.find((layer) => layer.id === id)?.name ?? id

export function TechnologyDetail() {
  return (
    <div className="flex flex-col gap-6">
      <GlowCard className="flex flex-col gap-4 p-6">
        <h3 className="font-medium">Why each technology earns its place</h3>
        <ResponsiveTable
          rows={TECH_REASONS}
          rowKey={(row) => row.tech}
          columns={[
            { label: "Technology", get: (row) => row.tech },
            {
              label: "Layer",
              get: (row) => <span className="rounded-full bg-brand/10 px-2.5 py-1 text-xs font-medium text-brand">{layerName(row.layer)}</span>,
            },
            { label: "Why it is the right choice", get: (row) => row.why, className: "text-muted-foreground" },
            { label: "What it does for you", get: (row) => row.effect, className: "text-brand" },
          ]}
        />
      </GlowCard>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[7fr_5fr]">
        <GlowCard className="flex flex-col gap-4 p-6">
          <div>
            <h3 className="font-medium">Machine utilisation over the rollout</h3>
            <p className="mt-1 text-sm text-brand">The lift starts once the whole floor is on the live system.</p>
          </div>
          <LazyMount className="h-72 w-full">
            <ChartContainer config={curveConfig} className="aspect-auto size-full">
              <AreaChart data={UTILISATION_CURVE} margin={{ left: -12, right: 8 }}>
                <defs>
                  <linearGradient id="fill-system" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-withSystem)" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="var(--color-withSystem)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} strokeOpacity={0.3} />
                <XAxis dataKey="week" tickLine={false} axisLine={false} interval={2} tick={{ fontSize: 11 }} />
                <YAxis domain={[60, 90]} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}%`} />
                <ChartTooltip content={<ChartTooltipContent formatter={(value) => `${value}%`} />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Area type="monotone" dataKey="baseline" stroke="var(--color-baseline)" strokeWidth={2} fill="none" />
                <Area type="monotone" dataKey="withSystem" stroke="var(--color-withSystem)" strokeWidth={2.5} fill="url(#fill-system)" />
              </AreaChart>
            </ChartContainer>
          </LazyMount>
        </GlowCard>

        <ul className="grid content-start gap-4">
          {OUTCOMES.map((item, index) => (
            <GlowCard asChild lift index={index} key={item.title}>
              <li className="flex flex-col gap-1.5 p-5">
                <p className="font-medium">{item.title}</p>
                <p className="text-sm text-brand text-pretty">{item.body}</p>
              </li>
            </GlowCard>
          ))}
        </ul>
      </div>
    </div>
  )
}
