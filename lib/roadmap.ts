export type PhaseStatus = "done" | "active" | "next" | "later"

export interface Phase {
  id: number
  name: string
  startWeek: number
  endWeek: number
  status: PhaseStatus
  goal: string
  steps: { label: string; done: boolean }[]
  output: string
  team: string[]
  exit: string
}

/** Project start used to turn plan weeks into calendar dates. */
export const PROJECT_START = new Date(2026, 9, 5)
export const PLAN_WEEKS = 52

export const PHASES: Phase[] = [
  {
    id: 0,
    name: "Discovery",
    startWeek: 0,
    endWeek: 3,
    status: "active",
    goal: "Know the floor before writing integration code",
    steps: [
      { label: "Production-grade UI demo for the client pitch", done: true },
      { label: "Walk the floor and map the dyeing process step by step", done: false },
      { label: "Machine inventory: brand, model, controller, protocol, age", done: false },
      { label: "Get the ERP export format for orders, buyers and shades", done: false },
      { label: "Start a four-week KPI baseline", done: false },
      { label: "Agree a paid pilot on one bay", done: false },
    ],
    output: "Process map, machine inventory, baseline KPIs",
    team: ["Founder", "Industrial engineer"],
    exit: "Signed pilot scope and access to machines and ERP data",
  },
  {
    id: 1,
    name: "Digital batch tracking",
    startWeek: 3,
    endWeek: 8,
    status: "next",
    goal: "Prove adoption without any hardware",
    steps: [
      { label: "Django REST backend with the batch, step and hold model", done: false },
      { label: "Connect this frontend to the API instead of the simulator", done: false },
      { label: "QR batch cards printed at batch preparation", done: false },
      { label: "Operator tablet entry for steps, holds and reason codes", done: false },
      { label: "Offline-first tablet sync for network drops", done: false },
    ],
    output: "Live dashboard fed by manual entry",
    team: ["Full-stack developer"],
    exit: "Operators log 90% of steps for two consecutive weeks",
  },
  {
    id: 2,
    name: "Pilot IoT",
    startWeek: 8,
    endWeek: 16,
    status: "later",
    goal: "Replace manual entry with machine signals on 3–5 machines",
    steps: [
      { label: "Industrial gateway with store-and-forward buffer", done: false },
      { label: "Read controllers over Modbus or OPC UA, read-only", done: false },
      { label: "Retrofit PT100, level and energy meters where needed", done: false },
      { label: "MQTT broker, ingestion service, TimescaleDB", done: false },
      { label: "Derive status from signals; compare with operator entries", done: false },
    ],
    output: "Live temperatures, levels and steps without typing",
    team: ["IoT engineer", "Electrician"],
    exit: "Signal-derived status matches the floor 98% of the time",
  },
  {
    id: 3,
    name: "Scale to 50 machines",
    startWeek: 16,
    endWeek: 28,
    status: "later",
    goal: "Every machine, every bay, on the wall",
    steps: [
      { label: "Roll out gateways to all five bays", done: false },
      { label: "TV wallboards per bay", done: false },
      { label: "WhatsApp, SMS and Telegram escalation", done: false },
      { label: "Two-way ERP integration for orders and dispatch", done: false },
      { label: "Energy, steam and water per batch", done: false },
    ],
    output: "The full floor dashboard",
    team: ["IoT engineer", "Full-stack developer", "Network technician"],
    exit: "Delay and idle-gap minutes measurably below baseline",
  },
  {
    id: 4,
    name: "AI agents",
    startWeek: 28,
    endWeek: 40,
    status: "later",
    goal: "Predict and plan, once there is clean history",
    steps: [
      { label: "Argus anomaly detection on step durations", done: false },
      { label: "Chronos unload-ETA model in shadow mode", done: false },
      { label: "Maestro light-to-dark sequencing with OR-Tools", done: false },
      { label: "Foreman assistant on Claude over the read-only API", done: false },
    ],
    output: "Measured reduction in delays and re-dyes",
    team: ["Data scientist", "Full-stack developer"],
    exit: "Models beat the rule baseline on held-out weeks",
  },
  {
    id: 5,
    name: "Productize",
    startWeek: 40,
    endWeek: 52,
    status: "later",
    goal: "Turn one factory's results into a product",
    steps: [
      { label: "Multi-factory cloud with tenant isolation", done: false },
      { label: "Subscription pricing per machine", done: false },
      { label: "Buyer portal for ETAs and shade approvals", done: false },
      { label: "Chroma recipe correction and Medic maintenance", done: false },
    ],
    output: "Alliance Automations as SaaS",
    team: ["Founder", "Product team"],
    exit: "Second factory live on the same platform",
  },
]

export const RISKS = [
  { risk: "Closed or proprietary machine controllers", mitigation: "Retrofit sensors; start read-only" },
  { risk: "Operators resist manual entry", mitigation: "QR scans and one-tap reason codes; show them the wallboard" },
  { risk: "Network and electrical noise on the floor", mitigation: "Wired Ethernet or RS485, IP65 enclosures, local buffering" },
  { risk: "Buyer and order confidentiality", mitigation: "Role-based access, on-site server, encrypted cloud sync" },
  { risk: "Unproven ROI", mitigation: "Four-week baseline and a paid single-bay pilot first" },
]
