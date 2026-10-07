"use client"

import { ArrowRight, Check } from "lucide-react"
import { useState } from "react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { ResponsiveTable } from "@/components/blueprint/responsive-table"
import { StackDiagram } from "@/components/blueprint/stack-diagram"
import { GlowCard } from "@/components/glow-card"
import { LazyMount } from "@/components/lazy-mount"
import { Button } from "@/components/ui/button"
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import { layersFromBuild, PRESETS, type PackageId } from "@/lib/blueprint/build"
import { useBuild } from "@/lib/blueprint/build-store"
import { COMPARISON, PACKAGES, packageWeeks, SCORES } from "@/lib/blueprint/content"
import { cn } from "@/lib/utils"

const scoreConfig = {
  moderate: { label: "Moderate", color: "var(--chart-2)" },
  advanced: { label: "Advanced", color: "var(--primary)" },
} satisfies ChartConfig

export function OptionsDetail() {
  const [selected, setSelected] = useState<PackageId>("moderate")
  const applyPreset = useBuild((state) => state.applyPreset)

  return (
    <div className="flex flex-col gap-8">
      <div className="grid gap-4 md:grid-cols-2" role="radiogroup" aria-label="Build option">
        {PACKAGES.map((pkg, index) => {
          const active = selected === pkg.id
          return (
            <GlowCard
              key={pkg.id}
              index={index}
              lift
              role="radio"
              aria-checked={active}
              tabIndex={0}
              onClick={() => setSelected(pkg.id)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault()
                  setSelected(pkg.id)
                }
              }}
              className={cn("flex cursor-pointer flex-col gap-4 p-6 outline-none focus-visible:ring-3 focus-visible:ring-ring/50", active && "bg-primary/5")}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xl font-semibold">{pkg.name}</p>
                  <p className="mt-1 text-sm text-brand text-pretty">{pkg.tagline}</p>
                </div>
                <span
                  className={cn(
                    "rounded-full border px-3 py-1 text-xs font-medium whitespace-nowrap",
                    active ? "border-primary bg-primary text-primary-foreground" : "border-input text-muted-foreground",
                  )}
                >
                  {active ? "Showing" : "View structure"}
                </span>
              </div>
              <ul className="flex flex-col gap-2 text-sm">
                {pkg.highlights.map((item) => (
                  <li key={item} className="flex gap-2">
                    <Check className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
                    {item}
                  </li>
                ))}
              </ul>
              <dl className="grid grid-cols-2 gap-3 border-t pt-4 text-sm">
                <div>
                  <dt className="text-xs text-muted-foreground">Rollout at the standard pace</dt>
                  <dd className="font-medium tabular">{packageWeeks(pkg)} weeks</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Best for</dt>
                  <dd className="text-pretty">{pkg.suits}</dd>
                </div>
              </dl>
            </GlowCard>
          )
        })}
      </div>

      <GlowCard className="flex flex-col gap-5 p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="font-medium">{PACKAGES.find((pkg) => pkg.id === selected)?.name} structure</h3>
            <p className="text-sm text-brand">Machines to Edge to Platform to Screens.</p>
          </div>
          <Button asChild variant="outline" onClick={() => applyPreset(selected)}>
            <a href="#build">
              Use this as my starting point <ArrowRight />
            </a>
          </Button>
        </div>
        <StackDiagram layers={layersFromBuild(PRESETS[selected])} />
      </GlowCard>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[7fr_5fr]">
        <GlowCard className="flex flex-col gap-4 p-6">
          <h3 className="font-medium">Side by side</h3>
          <ResponsiveTable
            rows={COMPARISON}
            rowKey={(row) => row.aspect}
            columns={[
              { label: "", get: (row) => row.aspect },
              { label: "Moderate", get: (row) => row.moderate, className: "text-brand" },
              { label: "Advanced", get: (row) => row.advanced, className: "text-brand" },
            ]}
          />
        </GlowCard>

        <GlowCard className="flex flex-col gap-4 p-6">
          <div>
            <h3 className="font-medium">What each option gives you</h3>
            <p className="mt-1 text-sm text-brand">Rated 1 to 5. Higher is stronger.</p>
          </div>
          <LazyMount className="h-72 w-full">
            <ChartContainer config={scoreConfig} className="aspect-auto size-full">
              <BarChart data={SCORES} margin={{ left: -16, right: 4 }} barGap={2}>
                <CartesianGrid vertical={false} strokeOpacity={0.3} />
                <XAxis dataKey="factor" tickLine={false} axisLine={false} tick={{ fontSize: 10 }} interval={0} />
                <YAxis domain={[0, 5]} ticks={[1, 3, 5]} tickLine={false} axisLine={false} />
                <ChartTooltip cursor={{ fill: "var(--muted)", opacity: 0.4 }} content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Bar dataKey="moderate" fill="var(--color-moderate)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="advanced" fill="var(--color-advanced)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </LazyMount>
        </GlowCard>
      </div>
    </div>
  )
}
