import { deliveryRisk } from "@/lib/domain/analytics"
import { REASONS } from "@/lib/domain/catalog"
import { DELAY_THRESHOLD_MIN } from "@/lib/domain/rules"
import type { Alert, MachineView, PlantKpis, PlantSnapshot, ReasonCode, ShadeDepth } from "@/lib/domain/types"
import { formatHm, formatInt, formatShortDate } from "@/lib/format"

/** live: acting on the floor · shadow: predicting, compared against actuals · planned: on the roadmap. */
export type AgentStage = "live" | "shadow" | "planned"

export interface AgentDefinition {
  id: string
  name: string
  role: string
  stage: AgentStage
  phase: number
  method: string
  needs: string
  inputs: string[]
  actions: string[]
}

/** Ordered by value delivered per unit of data needed, as in the build plan. */
export const AGENTS: AgentDefinition[] = [
  {
    id: "sentinel",
    name: "Sentinel",
    role: "Rules, alerts and escalation",
    stage: "live",
    phase: 2,
    method: "Deterministic rules: projected end − target, hold reasons, escalation ladder",
    needs: "Live machine signals",
    inputs: ["Step timings", "Hold reasons", "Recipe plan"],
    actions: ["Supervisor alert at +15 min", "Manager escalation at +60 min"],
  },
  {
    id: "argus",
    name: "Argus",
    role: "Delay and anomaly detection",
    stage: "shadow",
    phase: 4,
    method: "Control charts on step durations, isolation forest on sensor traces",
    needs: "1–2 months of history",
    inputs: ["Step durations", "Temperature and pressure traces", "Pump power"],
    actions: ["Flag drifting machines", "Open maintenance ticket"],
  },
  {
    id: "chronos",
    name: "Chronos",
    role: "Cycle-time and unload ETA",
    stage: "shadow",
    phase: 4,
    method: "Gradient boosting on recipe, shade depth, machine and load",
    needs: "3–6 months of history",
    inputs: ["Recipe", "Shade depth", "Machine pace", "Load kg"],
    actions: ["Unload ETA per batch", "Delivery risk per order"],
  },
  {
    id: "maestro",
    name: "Maestro",
    role: "Batch sequencing and machine assignment",
    stage: "planned",
    phase: 4,
    method: "Constraint solver (OR-Tools): light-to-dark sequencing, capacity fit, due dates",
    needs: "Clean planning data from ERP",
    inputs: ["Open orders", "Machine capacity", "Shade depth", "Due dates"],
    actions: ["Next-batch plan per machine", "Changeover reduction"],
  },
  {
    id: "chroma",
    name: "Chroma",
    role: "Shade and recipe correction",
    stage: "planned",
    phase: 5,
    method: "Regression from lab recipe and spectrophotometer ΔE to bulk correction",
    needs: "Spectrophotometer Lab/ΔE history",
    inputs: ["Lab dip recipe", "ΔE readings", "Water and dye lot"],
    actions: ["Suggest top-up dosing", "Raise right-first-time"],
  },
  {
    id: "medic",
    name: "Medic",
    role: "Predictive maintenance",
    stage: "planned",
    phase: 5,
    method: "Survival model on pump current, vibration and fault history",
    needs: "Extra current and vibration sensors",
    inputs: ["Pump current", "Vibration", "Fault codes"],
    actions: ["Schedule service before failure"],
  },
  {
    id: "foreman",
    name: "Foreman",
    role: "Plant assistant for managers",
    stage: "shadow",
    phase: 4,
    method: "Claude with tool use over the plant API: read-only queries, cited numbers",
    needs: "A stable plant API",
    inputs: ["Plant API", "Orders", "Alerts", "History"],
    actions: ["Answer questions in plain language", "Daily shift summary"],
  },
]

export interface Insight {
  headline: string
  detail: string
}

const DEPTH_RANK: Record<ShadeDepth, number> = { light: 0, medium: 1, dark: 2 }

export function agentInsights(views: MachineView[], snapshot: PlantSnapshot, kpis: PlantKpis, alerts: Alert[]): Record<string, Insight> {
  const delayed = views.filter((v) => v.status === "delayed").sort((a, b) => b.excessMin - a.excessMin)
  const slowSteps = views.filter((v) => v.step && v.step.progress >= 1 && !v.state.run?.hold)
  const dyeing = views.filter((v) => v.state.phase === "running")
  const predictedLate = dyeing.filter((v) => v.excessMin > 0)
  const darkToLight = views.filter((v) => {
    const next = v.state.next && snapshot.batches[v.state.next.batchId]
    const nextOrder = next && snapshot.orders.find((o) => o.id === next.orderId)
    return v.order && nextOrder && DEPTH_RANK[v.order.shade.depth] > DEPTH_RANK[nextOrder.shade.depth]
  })
  const today = snapshot.completed.filter((c) => c.endedAt >= snapshot.dayStart)
  const corrected = today.filter((c) => !c.rightFirstTime).length
  const faults = snapshot.events.filter((e) => e.kind === "hold" && e.message === REASONS["machine-fault"].label)

  return {
    sentinel: {
      headline: `${alerts.filter((a) => !a.acknowledged).length} open alerts · ${alerts.filter((a) => a.severity === "critical").length} escalated`,
      detail: delayed[0]
        ? `${delayed[0].machine.id} ${delayed[0].machine.name} is the largest overrun at +${formatHm(delayed[0].excessMin)}.`
        : "All batches are inside the 15-minute tolerance.",
    },
    argus: {
      headline: `${slowSteps.length} steps running past plan`,
      detail: slowSteps.length
        ? `Watching ${slowSteps.slice(0, 3).map((v) => v.machine.id).join(", ")} for drift before they cross the delay threshold.`
        : "No step is running past its planned duration.",
    },
    chronos: {
      headline: `${predictedLate.length} of ${dyeing.length} batches projected past target`,
      detail: `${delayed.length} exceed the ${DELAY_THRESHOLD_MIN}-minute tolerance. Average projected overrun ${formatHm(
        predictedLate.reduce((sum, v) => sum + v.excessMin, 0) / Math.max(1, predictedLate.length),
      )}.`,
    },
    maestro: {
      headline: `${darkToLight.length} dark-to-light changeovers queued`,
      detail: darkToLight.length
        ? `Swapping next batches on ${darkToLight.slice(0, 3).map((v) => v.machine.id).join(", ")} would avoid extra cleaning cycles.`
        : "Every queued batch follows light-to-dark order.",
    },
    chroma: {
      headline: `RFT ${(kpis.rightFirstTime * 100).toFixed(1)}% today`,
      detail: `${corrected} of ${today.length} batches needed a shade correction since 06:00.`,
    },
    medic: {
      headline: `${kpis.offline} machines out of service`,
      detail: `${faults.length} machine-fault holds in the event window. Current and vibration sensors are needed for prediction.`,
    },
    foreman: {
      headline: "Answers from live plant data",
      detail: "Ask about delays, losses, output or delivery risk. Every number comes from the plant API.",
    },
  }
}

export interface AssistantQuestion {
  id: string
  question: string
  answer: (context: { views: MachineView[]; snapshot: PlantSnapshot; kpis: PlantKpis; dailyKg: number }) => string[]
}

const reasonCounts = (views: MachineView[]) => {
  const counts = new Map<ReasonCode, number>()
  for (const view of views) {
    const reason = view.state.run?.hold?.reason
    if (reason) counts.set(reason, (counts.get(reason) ?? 0) + 1)
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1])
}

export const ASSISTANT_QUESTIONS: AssistantQuestion[] = [
  {
    id: "late",
    question: "Which batches will miss their target unload?",
    answer: ({ views }) => {
      const late = views.filter((v) => v.status === "delayed").sort((a, b) => b.excessMin - a.excessMin)
      if (!late.length) return ["No batch is projected more than 15 minutes past its target."]
      return [
        `${late.length} batches are projected past target by more than 15 minutes:`,
        ...late.slice(0, 6).map((v) => `${v.machine.id} ${v.machine.name} · ${v.batch?.id} for ${v.buyer?.name} · +${formatHm(v.excessMin)} · ${v.step?.step.label}`),
      ]
    },
  },
  {
    id: "slowing",
    question: "What is slowing the floor right now?",
    answer: ({ views, kpis }) => {
      const reasons = reasonCounts(views)
      return [
        `${kpis.held} machines on hold, ${kpis.delayed} delayed, ${kpis.offline} out of service.`,
        reasons.length ? `Hold reasons: ${reasons.map(([r, n]) => `${REASONS[r].label} (${n})`).join(", ")}.` : "No active holds.",
        `Utilization is ${(kpis.utilization * 100).toFixed(1)}% of available machines.`,
      ]
    },
  },
  {
    id: "output",
    question: "How much have we dyed since 06:00?",
    answer: ({ kpis }) => [
      `${formatInt(kpis.producedKg)} kg across ${kpis.batchesCompleted} batches.`,
      `Right first time ${(kpis.rightFirstTime * 100).toFixed(1)}%. Energy ${kpis.energyKwhPerKg.toFixed(2)} kWh/kg, steam ${kpis.steamKgPerKg.toFixed(2)} kg/kg, water ${kpis.waterLPerKg.toFixed(1)} L/kg.`,
    ],
  },
  {
    id: "orders",
    question: "Which orders are at risk of late delivery?",
    answer: ({ views, snapshot, dailyKg }) => {
      const risks = deliveryRisk(snapshot.orders, views, snapshot.now, dailyKg).filter((r) => r.slackHours < 48)
      if (!risks.length) return ["Every open order has more than two days of slack at today's run rate."]
      return [
        `${risks.length} orders have less than two days of slack:`,
        ...risks.slice(0, 5).map((r) => `${r.order.id} · ${formatInt(r.remainingKg)} kg left · due ${formatShortDate(r.order.dueAt)} · slack ${(r.slackHours / 24).toFixed(1)} days`),
      ]
    },
  },
  {
    id: "attention",
    question: "Which machines need a supervisor now?",
    answer: ({ views }) => {
      const urgent = views.filter((v) => v.status === "held" || v.status === "offline" || v.excessMin >= 60)
      if (!urgent.length) return ["No machine needs immediate attention."]
      return urgent.slice(0, 8).map((v) => `${v.machine.id} ${v.machine.name} · ${v.remark}`)
    },
  },
]
