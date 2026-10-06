/** The client's custom build: what they pick for each layer, and how it is read back to them. */

export type LayerId = "machines" | "edge" | "platform" | "screens"
export type GroupId =
  | "machineTypes"
  | "controllers"
  | "sensors"
  | "protocols"
  | "network"
  | "gateway"
  | "hosting"
  | "database"
  | "language"
  | "intelligence"
  | "integrations"
  | "screens"

export type BuildSelection = { machines: string } & Record<GroupId, string[]>

export interface OptionGroup {
  id: GroupId
  layer: LayerId
  label: string
  hint?: string
  mode: "single" | "multi"
  options: string[]
}

export const LAYER_META: { id: LayerId; name: string; summary: string }[] = [
  { id: "machines", name: "Machines", summary: "What we read from the floor" },
  { id: "edge", name: "Edge", summary: "How signals leave the machine" },
  { id: "platform", name: "Platform", summary: "Where data becomes decisions" },
  { id: "screens", name: "Screens", summary: "Who sees it, and where" },
]

export const OPTION_GROUPS: OptionGroup[] = [
  {
    id: "machineTypes",
    layer: "machines",
    label: "Machine types",
    mode: "multi",
    options: ["Jet", "Soft-flow", "Overflow", "Winch", "Package dyeing", "Beam dyeing"],
  },
  {
    id: "controllers",
    layer: "machines",
    label: "Controllers",
    hint: "Choose what you run today, or leave blank if you are not sure.",
    mode: "multi",
    options: ["Thies", "Fong's", "Then", "Dilmenler", "Sclavos", "Other or unknown"],
  },
  {
    id: "sensors",
    layer: "machines",
    label: "Sensors and meters to add",
    mode: "multi",
    options: ["Temperature", "Level", "Flow", "Pressure", "pH", "Conductivity", "Energy meter", "Steam meter", "Water meter"],
  },
  { id: "protocols", layer: "edge", label: "Protocols", mode: "multi", options: ["Modbus", "OPC UA", "MQTT", "Profinet"] },
  { id: "network", layer: "edge", label: "Floor network", mode: "multi", options: ["Wired LAN", "RS485", "Wi-Fi"] },
  { id: "gateway", layer: "edge", label: "Gateway", mode: "single", options: ["Single gateway", "Redundant gateways"] },
  { id: "hosting", layer: "platform", label: "Where it runs", mode: "single", options: ["On-site server", "Cloud", "Hybrid (on-site and cloud)"] },
  { id: "database", layer: "platform", label: "Data store", mode: "single", options: ["PostgreSQL", "PostgreSQL + TimescaleDB"] },
  {
    id: "language",
    layer: "platform",
    label: "Code language preference",
    hint: "Matters only if your team will maintain or extend the code.",
    mode: "single",
    options: ["TypeScript / Node.js", "Python", "Java", "C# / .NET", "Go", "No preference"],
  },
  { id: "intelligence", layer: "platform", label: "Intelligence", mode: "multi", options: ["Rules engine", "AI agents"] },
  {
    id: "integrations",
    layer: "platform",
    label: "Connect to",
    mode: "multi",
    options: ["SAP", "Oracle", "Odoo", "In-house ERP", "Excel files", "Nothing yet"],
  },
  {
    id: "screens",
    layer: "screens",
    label: "Screens",
    mode: "multi",
    options: ["Control room dashboard", "TV wallboard", "Operator tablet", "Mobile alerts", "CRM and buyer portal", "ERP sync", "Management reports"],
  },
]

const GROUP_IDS = OPTION_GROUPS.map((group) => group.id)

export const emptyBuild = (): BuildSelection => ({
  machines: "",
  ...(Object.fromEntries(GROUP_IDS.map((id) => [id, [] as string[]])) as unknown as Record<GroupId, string[]>),
})

export type PackageId = "moderate" | "advanced"

export const PRESETS: Record<PackageId, BuildSelection> = {
  moderate: {
    ...emptyBuild(),
    sensors: ["Temperature", "Level", "Flow"],
    protocols: ["Modbus"],
    network: ["Wired LAN"],
    gateway: ["Single gateway"],
    hosting: ["On-site server"],
    database: ["PostgreSQL"],
    intelligence: ["Rules engine"],
    screens: ["Control room dashboard", "TV wallboard", "Operator tablet"],
  },
  advanced: {
    ...emptyBuild(),
    sensors: ["Temperature", "Level", "Flow", "Pressure", "pH", "Conductivity", "Energy meter", "Steam meter", "Water meter"],
    protocols: ["Modbus", "OPC UA", "MQTT"],
    network: ["Wired LAN", "RS485"],
    gateway: ["Redundant gateways"],
    hosting: ["Hybrid (on-site and cloud)"],
    database: ["PostgreSQL + TimescaleDB"],
    intelligence: ["Rules engine", "AI agents"],
    screens: ["Control room dashboard", "TV wallboard", "Operator tablet", "Mobile alerts", "CRM and buyer portal", "ERP sync", "Management reports"],
  },
}

/** What each layer of the structure drawing holds for a given selection. */
export function layersFromBuild(build: BuildSelection): Record<LayerId, string[]> {
  const groups = (layer: LayerId) => OPTION_GROUPS.filter((group) => group.layer === layer).flatMap((group) => build[group.id])
  const count = build.machines.trim() ? [`${build.machines.trim()} machines`] : []
  return {
    machines: [...count, ...groups("machines")],
    edge: groups("edge"),
    platform: groups("platform"),
    screens: groups("screens"),
  }
}

export const chosenCount = (build: BuildSelection) => Object.values(layersFromBuild(build)).reduce((sum, items) => sum + items.length, 0)

/** Which ready-made package the choices sit closest to, judged by how many advanced-only items they include. */
export function closestPackage(build: BuildSelection): PackageId | null {
  if (!chosenCount(build)) return null
  const moderate = new Set(Object.values(PRESETS.moderate).flat())
  const advancedOnly = Object.entries(PRESETS.advanced)
    .filter(([key]) => key !== "machines")
    .flatMap(([, values]) => values as string[])
    .filter((item) => !moderate.has(item))
  const selected = new Set(GROUP_IDS.flatMap((id) => build[id]))
  const hits = advancedOnly.filter((item) => selected.has(item)).length
  return hits >= 3 ? "advanced" : "moderate"
}

export interface BuildContact {
  name: string
  company: string
  note: string
}

const LAYER_TITLE: Record<LayerId, string> = { machines: "Machines", edge: "Edge", platform: "Platform", screens: "Screens" }

/** Plain-text brief of the custom build, sent by email or WhatsApp. */
export function formatBuild(build: BuildSelection, contact: BuildContact): string {
  const layers = layersFromBuild(build)
  const closest = closestPackage(build)
  return [
    "Custom build request · Alliance Automations",
    "",
    contact.name ? `Name: ${contact.name}` : null,
    contact.company ? `Company: ${contact.company}` : null,
    closest ? `Closest package: ${closest === "advanced" ? "Advanced" : "Moderate"}` : null,
    "",
    ...(Object.keys(LAYER_TITLE) as LayerId[]).map((layer) => `${LAYER_TITLE[layer]}: ${layers[layer].length ? layers[layer].join(", ") : "not chosen yet"}`),
    contact.note ? `\nNotes:\n${contact.note}` : null,
  ]
    .filter((line): line is string => line !== null)
    .join("\n")
}
