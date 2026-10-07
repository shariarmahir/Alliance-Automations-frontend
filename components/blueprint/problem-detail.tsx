"use client"

import { Bar, BarChart, LabelList, XAxis, YAxis } from "recharts"
import { ResponsiveTable } from "@/components/blueprint/responsive-table"
import { GlowCard } from "@/components/glow-card"
import { LazyMount } from "@/components/lazy-mount"
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import { LOSS_SHARES, PROBLEM_MAP } from "@/lib/blueprint/content"

const config = { share: { label: "Share of lost machine time", color: "var(--primary)" } } satisfies ChartConfig

export function ProblemDetail() {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[5fr_7fr]">
      <GlowCard className="flex flex-col gap-4 p-6">
        <div>
          <h3 className="font-medium">Where a dyeing day loses machine time</h3>
          <p className="mt-1 text-sm text-brand">No single failure. Five small leaks that add up.</p>
        </div>
        <LazyMount className="h-64 w-full">
          <ChartContainer config={config} className="aspect-auto size-full">
            <BarChart data={LOSS_SHARES} layout="vertical" margin={{ left: 4, right: 36 }} barCategoryGap={6}>
              <XAxis type="number" hide domain={[0, 32]} />
              <YAxis type="category" dataKey="cause" tickLine={false} axisLine={false} width={150} tick={{ fontSize: 12 }} />
              <ChartTooltip cursor={{ fill: "var(--muted)", opacity: 0.4 }} content={<ChartTooltipContent formatter={(value) => `${value}% of lost time`} />} />
              <Bar dataKey="share" fill="var(--color-share)" radius={4}>
                <LabelList dataKey="share" position="right" formatter={(value) => `${String(value)}%`} className="fill-foreground" fontSize={12} />
              </Bar>
            </BarChart>
          </ChartContainer>
        </LazyMount>
      </GlowCard>

      <GlowCard className="flex flex-col gap-4 p-6">
        <h3 className="font-medium">Each problem, how we answer it, and what we measure</h3>
        <ResponsiveTable
          rows={PROBLEM_MAP}
          rowKey={(row) => row.problem}
          columns={[
            { label: "Problem", get: (row) => row.problem },
            { label: "How we fix it", get: (row) => row.fix, className: "text-brand" },
            { label: "What we measure", get: (row) => row.measure, className: "text-muted-foreground" },
          ]}
        />
      </GlowCard>
    </div>
  )
}
