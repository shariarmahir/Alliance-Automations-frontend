import { PHASES } from "@/lib/proposal/phases"
import type { LayerId, PackageId } from "@/lib/blueprint/build"

/** Copy and illustrative figures for the blueprint page. Charts built from these are labelled illustrative on the page. */

export interface PackageInfo {
  id: PackageId
  name: string
  tagline: string
  suits: string
  /** Phase ids the package covers; the weeks come from the same phase table the timeline planner uses. */
  phases: number[]
  highlights: string[]
}

export const PACKAGES: PackageInfo[] = [
  {
    id: "moderate",
    name: "Moderate",
    tagline: "Live visibility on every machine, with the least change to your floor.",
    suits: "Plants that want control of delays, holds and shade re-dyes first.",
    phases: [0, 1, 2, 3],
    highlights: [
      "Reads your controllers without replacing them",
      "Temperature, level and flow per machine",
      "One gateway, one on-site server",
      "Control room, TV wallboard and operator tablets",
    ],
  },
  {
    id: "advanced",
    name: "Advanced",
    tagline: "Predicts trouble early, measures every utility and reaches your buyers.",
    suits: "Plants chasing energy, water and right-first-time gains across more than one site.",
    phases: [0, 1, 2, 3, 4, 5],
    highlights: [
      "Full sensing, including pH, conductivity and utility meters",
      "Redundant gateways over Modbus, OPC UA and MQTT",
      "Time-series store and AI agents that learn your batches",
      "Mobile alerts, buyer portal, ERP sync and multi-site",
    ],
  },
]

export const packageWeeks = (pkg: PackageInfo) => PHASES.filter((phase) => pkg.phases.includes(phase.id)).reduce((sum, phase) => sum + phase.defaultWeeks, 0)

export interface ComparisonRow {
  aspect: string
  moderate: string
  advanced: string
}

export const COMPARISON: ComparisonRow[] = [
  { aspect: "Sensing per machine", moderate: "Temperature, level, flow", advanced: "Adds pressure, pH, conductivity, energy, steam and water" },
  { aspect: "Connectivity", moderate: "Modbus over wired LAN", advanced: "Modbus, OPC UA and MQTT, redundant gateways" },
  { aspect: "Data store", moderate: "PostgreSQL", advanced: "PostgreSQL + TimescaleDB for long time series" },
  { aspect: "Intelligence", moderate: "Rules engine: delay, hold, escalation", advanced: "Rules plus prediction, anomaly and scheduling agents" },
  { aspect: "Screens", moderate: "Control room, wallboard, tablet", advanced: "Adds mobile alerts, buyer portal, reports, ERP sync" },
  { aspect: "Hosting", moderate: "On-site server", advanced: "On-site with cloud sync, multi-site ready" },
  { aspect: "Best for", moderate: "Getting the floor under control", advanced: "Optimising cost, energy and delivery at scale" },
]

/** Indicative 1 to 5 ratings. A judgement, not a measurement. */
export const SCORES = [
  { factor: "Visibility", moderate: 4, advanced: 5 },
  { factor: "Predictive power", moderate: 2, advanced: 5 },
  { factor: "Utility insight", moderate: 2, advanced: 5 },
  { factor: "Scalability", moderate: 3, advanced: 5 },
  { factor: "Ease of rollout", moderate: 5, advanced: 3 },
  { factor: "Upfront effort", moderate: 5, advanced: 3 },
]

/** Illustrative split of lost machine time on a typical dyeing floor. */
export const LOSS_SHARES = [
  { cause: "Waiting for the next batch", share: 28 },
  { cause: "Shade correction and re-dye", share: 24 },
  { cause: "Late start or hold", share: 18 },
  { cause: "Cleaning and changeover", share: 16 },
  { cause: "Unplanned stops", share: 14 },
]

export const PROBLEM_MAP = [
  { problem: "Delays surface after the fact", fix: "Projected end times flag a late batch while there is time to act", measure: "Minutes from slip to alert" },
  { problem: "Shade corrections eat capacity", fix: "ΔE checks and reason codes show where right-first-time slips", measure: "Right-first-time %" },
  { problem: "Machines wait for batches", fix: "Next-batch readiness tracked per machine", measure: "Idle minutes between batches" },
  { problem: "Energy and water are guesses", fix: "Steam, power and water metered per batch", measure: "Kilowatt-hours and litres per kilo" },
]

export const ROLES = [
  { role: "Manager", gets: "Plant KPIs, output and delivery risk on one screen" },
  { role: "Supervisor", gets: "Every machine's state, delays and one-tap commands" },
  { role: "Operator", gets: "A touch screen for the batch in front of them" },
  { role: "Buyer", gets: "Order status and shade approvals, without a phone call" },
]

export interface TechReason {
  tech: string
  layer: LayerId
  why: string
  effect: string
}

export const TECH_REASONS: TechReason[] = [
  {
    tech: "PT100 and process sensors",
    layer: "machines",
    why: "Industrial standard: accurate, inexpensive and easy to replace.",
    effect: "Catches heating-curve drift before it becomes a shade failure.",
  },
  {
    tech: "QR batch cards",
    layer: "machines",
    why: "Operators scan instead of typing.",
    effect: "Cleaner batch data with less manual entry.",
  },
  {
    tech: "Modbus and OPC UA",
    layer: "edge",
    why: "Open standards that most dyeing controllers already speak.",
    effect: "We read your machines without replacing them, so rollout is faster and safer.",
  },
  {
    tech: "MQTT with local buffering",
    layer: "edge",
    why: "Lightweight messaging that stores data when the network drops.",
    effect: "No gaps in the record, even on a noisy floor.",
  },
  {
    tech: "PostgreSQL + TimescaleDB",
    layer: "platform",
    why: "Mature, standard SQL with compressed time series. You own the data.",
    effect: "Fast OEE and loss reports across months of history.",
  },
  {
    tech: "Rules engine",
    layer: "platform",
    why: "Deterministic, so every alert can be explained.",
    effect: "Supervisors trust the alerts and act on them.",
  },
  {
    tech: "AI agents (Advanced)",
    layer: "platform",
    why: "Learn from your own batch history instead of a generic model.",
    effect: "Earlier warnings and better batch sequencing.",
  },
  {
    tech: "TypeScript, React and WebSocket",
    layer: "screens",
    why: "One codebase serves the control room, wallboard and tablet, updating live.",
    effect: "Every role sees the same numbers at the same moment, in a screen built for them.",
  },
]

/** Illustrative machine utilisation over a 28-week rollout. The real baseline is measured in Discovery. */
export const UTILISATION_CURVE = Array.from({ length: 15 }, (_, index) => {
  const week = index * 2
  const baseline = 68 + (index % 3 === 0 ? 0.8 : -0.4)
  const lift = week < 14 ? 0 : Math.min(16, (week - 14) * 1.2)
  return { week: `Wk ${week}`, baseline: Number(baseline.toFixed(1)), withSystem: Number((baseline + lift * 0.9).toFixed(1)) }
})

export const WHY_US = [
  { title: "Built for dyeing, not adapted to it", body: "Every rule, screen and report speaks in batches, shades, vats and delivery dates." },
  { title: "Read-only first", body: "We watch your controllers before we ever write to them, so your floor is never put at risk." },
  { title: "You set the pace", body: "You choose the start date, the speed and the optional phases. The plan follows your calendar." },
  { title: "One team, sensor to screen", body: "Hardware, software and screens come from one team, so nothing is lost between suppliers." },
  { title: "Proof before scale", body: "We start with one bay and a baseline. Each phase ends with one exit test you can check yourself." },
  { title: "Your data, open standards", body: "PostgreSQL, MQTT and OPC UA mean your data stays yours and nothing locks you in." },
]
