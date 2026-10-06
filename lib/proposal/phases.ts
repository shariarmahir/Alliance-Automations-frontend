export interface Phase {
  id: number
  name: string
  goal: string
  deliverables: string[]
  output: string
  team: string[]
  /** The test that must pass before the next phase starts. */
  exit: string
  defaultWeeks: number
  /** Optional phases can be left out of the client's plan. */
  optional: boolean
}

export const MIN_WEEKS = 1
export const MAX_WEEKS = 52

export const PHASES: Phase[] = [
  {
    id: 0,
    name: "Discovery",
    goal: "Know the floor before writing integration code",
    deliverables: [
      "Walk the floor and map the dyeing process step by step",
      "Machine inventory: brand, model, controller, protocol, age",
      "ERP export format for orders, buyers and shades",
      "Four-week KPI baseline started",
      "Pilot scope and success measures agreed",
    ],
    output: "Process map, machine inventory, baseline KPIs",
    team: ["Kandari-Lab lead", "Industrial engineer"],
    exit: "Signed pilot scope and access to machines and ERP data",
    defaultWeeks: 3,
    optional: false,
  },
  {
    id: 1,
    name: "Digital batch tracking",
    goal: "Prove adoption without any hardware",
    deliverables: [
      "Backend for batches, steps and holds",
      "This control room connected to your data",
      "QR batch cards printed at batch preparation",
      "Operator tablet entry for steps, holds and reason codes",
      "Offline-first tablet sync for network drops",
    ],
    output: "Live dashboard fed by manual entry",
    team: ["Full-stack developer"],
    exit: "Operators log 90% of steps for two consecutive weeks",
    defaultWeeks: 5,
    optional: false,
  },
  {
    id: 2,
    name: "Pilot IoT",
    goal: "Replace manual entry with machine signals on 3–5 machines",
    deliverables: [
      "Industrial gateway with store-and-forward buffer",
      "Controllers read over Modbus or OPC UA, read-only",
      "Retrofit temperature, level and energy meters where needed",
      "MQTT broker, ingestion service and time-series database",
      "Status derived from signals and checked against operator entries",
    ],
    output: "Live temperatures, levels and steps without typing",
    team: ["IoT engineer", "Electrician"],
    exit: "Signal-derived status matches the floor 98% of the time",
    defaultWeeks: 8,
    optional: false,
  },
  {
    id: 3,
    name: "Scale to 50 machines",
    goal: "Every machine, every bay, on the wall",
    deliverables: [
      "Gateways rolled out to all five bays",
      "TV wallboards per bay",
      "WhatsApp, SMS and Telegram escalation",
      "Two-way ERP integration for orders and dispatch",
      "Energy, steam and water per batch",
    ],
    output: "The full floor dashboard",
    team: ["IoT engineer", "Full-stack developer", "Network technician"],
    exit: "Delay and idle-gap minutes measurably below baseline",
    defaultWeeks: 12,
    optional: false,
  },
  {
    id: 4,
    name: "AI agents",
    goal: "Predict and plan, once there is clean history",
    deliverables: [
      "Anomaly detection on step durations",
      "Unload-time prediction in shadow mode",
      "Light-to-dark batch sequencing",
      "Plant assistant that answers questions from live data",
    ],
    output: "Measured reduction in delays and re-dyes",
    team: ["Data scientist", "Full-stack developer"],
    exit: "Models beat the rule baseline on held-out weeks",
    defaultWeeks: 12,
    optional: true,
  },
  {
    id: 5,
    name: "Multi-site and buyer portal",
    goal: "Extend one factory's results across sites and to your buyers",
    deliverables: [
      "Multi-factory cloud with tenant isolation",
      "Buyer portal for ETAs and shade approvals",
      "Shade recipe correction and predictive maintenance",
    ],
    output: "One platform across factories, with buyer visibility",
    team: ["Kandari-Lab lead", "Product team"],
    exit: "Second site live on the same platform",
    defaultWeeks: 12,
    optional: true,
  },
]

export interface PacePreset {
  id: "accelerated" | "standard" | "relaxed"
  label: string
  /** Multiplier applied to each phase's default duration. */
  factor: number
  note: string
}

export const PACE_PRESETS: PacePreset[] = [
  { id: "accelerated", label: "Accelerated", factor: 0.75, note: "Larger team, earlier access to machines" },
  { id: "standard", label: "Standard", factor: 1, note: "Recommended sequence and staffing" },
  { id: "relaxed", label: "Relaxed", factor: 1.3, note: "Fits around production peaks" },
]

export const weeksForPace = (factor: number) =>
  PHASES.map((phase) => Math.min(MAX_WEEKS, Math.max(MIN_WEEKS, Math.round(phase.defaultWeeks * factor))))

export const RISKS = [
  { risk: "Closed or proprietary machine controllers", mitigation: "Retrofit sensors and start read-only" },
  { risk: "Operators resist manual entry", mitigation: "QR scans and one-tap reason codes; show them the wallboard" },
  { risk: "Network and electrical noise on the floor", mitigation: "Wired Ethernet or RS485, IP65 enclosures, local buffering" },
  { risk: "Buyer and order confidentiality", mitigation: "Role-based access, on-site server, encrypted cloud sync" },
  { risk: "Unproven return on investment", mitigation: "Four-week baseline and a paid single-bay pilot first" },
]
