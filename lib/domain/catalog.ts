import type {
  Buyer,
  ControllerLink,
  Machine,
  MachineType,
  ReasonCode,
  RecipeStep,
  Shade,
  ShadeDepth,
} from "./types"

const ROBOT_NAMES = [
  "Dum-E", "Wall-E", "EVE", "Baymax", "Jarvis", "Friday", "TARS", "CASE", "Astro", "Atlas",
  "Optimus", "Bender", "Sonny", "Johnny-5", "Robby", "Gort", "Data", "Bishop", "KITT", "Marvin",
  "Rosie", "Chappie", "M-O", "BB-8", "R2-D2", "C-3PO", "K-2SO", "Chopper", "Huey", "Dewey",
  "Louie", "Vision", "Edith", "Ava", "Nova", "Spot", "Asimo", "Kismet", "Shakey", "Unimate",
  "Cog", "Tachikoma", "Gizmo", "Sprocket", "Rivet", "Servo", "Cypher", "Echo", "Pixel", "Titan",
] as const

const BAY_LAYOUT: { type: MachineType; capacities: number[] }[] = [
  { type: "Soft-flow Jet", capacities: [1500, 1000] },
  { type: "Soft-flow Jet", capacities: [750, 500] },
  { type: "Front Loader", capacities: [500, 300] },
  { type: "Rotary Drum", capacities: [250, 200] },
  { type: "Side Paddle", capacities: [150, 100] },
]

const LINKS: ControllerLink[] = ["OPC UA", "Modbus TCP", "Modbus TCP", "RS485 retrofit"]

const MACHINES_PER_BAY = 10

export const MACHINES: Machine[] = ROBOT_NAMES.map((name, i) => {
  const bay = Math.floor(i / MACHINES_PER_BAY) + 1
  const layout = BAY_LAYOUT[bay - 1]
  return {
    id: `D${String(i + 1).padStart(2, "0")}`,
    name,
    bay,
    type: layout.type,
    capacityKg: layout.capacities[i % 2],
    link: LINKS[i % LINKS.length],
  }
})

export const BAYS = Array.from({ length: BAY_LAYOUT.length }, (_, i) => ({
  bay: i + 1,
  label: `Bay ${i + 1}`,
  range: `${i * MACHINES_PER_BAY + 1}–${(i + 1) * MACHINES_PER_BAY}`,
}))

export const SHADES: Shade[] = [
  { code: "NV-19", name: "Navy", hex: "#1b2a4a", depth: "dark" },
  { code: "BK-01", name: "Jet Black", hex: "#141414", depth: "dark" },
  { code: "RD-18", name: "Scarlet", hex: "#c0272d", depth: "medium" },
  { code: "OL-34", name: "Olive", hex: "#6b6b3a", depth: "medium" },
  { code: "GR-11", name: "Grey Melange", hex: "#8a8d91", depth: "light" },
  { code: "MR-19", name: "Maroon", hex: "#6d1f2a", depth: "dark" },
  { code: "SK-14", name: "Sky Blue", hex: "#8cc4ec", depth: "light" },
  { code: "BG-53", name: "Bottle Green", hex: "#1f4d3a", depth: "dark" },
  { code: "LL-36", name: "Lilac", hex: "#b9a5d6", depth: "light" },
  { code: "EC-01", name: "Ecru", hex: "#e8e0cc", depth: "light" },
  { code: "CR-16", name: "Coral", hex: "#f2795e", depth: "medium" },
  { code: "MS-15", name: "Mustard", hex: "#d3a02a", depth: "medium" },
  { code: "TL-18", name: "Teal", hex: "#1f7a80", depth: "medium" },
  { code: "CH-19", name: "Charcoal", hex: "#3a3d42", depth: "dark" },
  { code: "BL-12", name: "Blush", hex: "#e8b4b0", depth: "light" },
  { code: "KH-16", name: "Khaki", hex: "#a8936a", depth: "medium" },
]

export const BUYERS: Buyer[] = [
  { id: "hm", name: "H&M", country: "Sweden", tier: "Strategic", accountManager: "Nadia Rahman", contact: "Elin Berg", paymentTermsDays: 60, ytdKg: 412_300, onTimeRate: 0.94, rightFirstTime: 0.91 },
  { id: "zara", name: "ZARA", country: "Spain", tier: "Strategic", accountManager: "Tanvir Ahmed", contact: "Lucía Moreno", paymentTermsDays: 45, ytdKg: 388_900, onTimeRate: 0.9, rightFirstTime: 0.88 },
  { id: "next", name: "NEXT", country: "United Kingdom", tier: "Key", accountManager: "Nadia Rahman", contact: "Oliver Hughes", paymentTermsDays: 60, ytdKg: 201_450, onTimeRate: 0.96, rightFirstTime: 0.93 },
  { id: "ca", name: "C&A", country: "Germany", tier: "Key", accountManager: "Farhan Kabir", contact: "Jonas Weber", paymentTermsDays: 75, ytdKg: 176_200, onTimeRate: 0.89, rightFirstTime: 0.9 },
  { id: "uniqlo", name: "UNIQLO", country: "Japan", tier: "Strategic", accountManager: "Tanvir Ahmed", contact: "Haruto Sato", paymentTermsDays: 30, ytdKg: 298_700, onTimeRate: 0.97, rightFirstTime: 0.95 },
  { id: "gap", name: "GAP", country: "United States", tier: "Key", accountManager: "Farhan Kabir", contact: "Megan Ross", paymentTermsDays: 60, ytdKg: 154_800, onTimeRate: 0.87, rightFirstTime: 0.86 },
  { id: "ms", name: "M&S", country: "United Kingdom", tier: "Growth", accountManager: "Sabrina Chowdhury", contact: "Amelia Clarke", paymentTermsDays: 60, ytdKg: 98_400, onTimeRate: 0.92, rightFirstTime: 0.92 },
  { id: "primark", name: "Primark", country: "Ireland", tier: "Growth", accountManager: "Sabrina Chowdhury", contact: "Ciara Byrne", paymentTermsDays: 45, ytdKg: 121_600, onTimeRate: 0.91, rightFirstTime: 0.89 },
]

export const GARMENTS = [
  { garment: "Crew Neck Tee", gsm: [160, 180] },
  { garment: "Pique Polo", gsm: [200, 220] },
  { garment: "Pullover Hoodie", gsm: [280, 320] },
  { garment: "Jogger Pant", gsm: [260, 300] },
  { garment: "Sweatshirt", gsm: [260, 280] },
  { garment: "Tank Top", gsm: [140, 160] },
  { garment: "Henley", gsm: [180, 200] },
  { garment: "Cargo Short", gsm: [240, 260] },
] as const

export const REASONS: Record<ReasonCode, { label: string; owner: string }> = {
  "shade-correction": { label: "Shade correction", owner: "Lab" },
  "waiting-chemicals": { label: "Waiting for chemicals", owner: "Dye house store" },
  "steam-pressure": { label: "Steam pressure low", owner: "Utilities" },
  "lab-approval": { label: "Waiting lab approval", owner: "Lab" },
  "machine-fault": { label: "Machine fault", owner: "Maintenance" },
  "power-cut": { label: "Power interruption", owner: "Utilities" },
  "waiting-batch": { label: "Waiting for batch", owner: "Batch section" },
  changeover: { label: "Cleaning & changeover", owner: "Production" },
  maintenance: { label: "Planned maintenance", owner: "Maintenance" },
}

/** Reasons an operator can raise on a running machine. */
export const HOLD_REASONS: ReasonCode[] = [
  "shade-correction",
  "waiting-chemicals",
  "steam-pressure",
  "lab-approval",
  "machine-fault",
  "power-cut",
]

const LIQUOR_RATIO = 8
const AMBIENT_C = 32

const HOLD_MINUTES: Record<ShadeDepth, { dye: number; fix: number; soaps: number }> = {
  light: { dye: 35, fix: 40, soaps: 1 },
  medium: { dye: 50, fix: 55, soaps: 1 },
  dark: { dye: 65, fix: 70, soaps: 2 },
}

/** Reactive cotton exhaust recipe, scaled to batch weight and shade depth. */
export function buildRecipe(depth: ShadeDepth, qtyKg: number): RecipeStep[] {
  const liquorL = Math.round((qtyKg * LIQUOR_RATIO) / 10) * 10
  const dyeTemp = depth === "dark" ? 80 : 60
  const holds = HOLD_MINUTES[depth]
  const heatMin = Math.round((dyeTemp - AMBIENT_C) / 1.5)

  const soaping: RecipeStep[] = Array.from({ length: holds.soaps }, () => [
    { kind: "hold", label: "Soaping", plannedMin: 20, target: 95 } as const,
    { kind: "drain", label: "Drain", plannedMin: 8, target: 0 } as const,
  ]).flat()

  return [
    { kind: "load", label: "Loading", plannedMin: 15, target: AMBIENT_C },
    { kind: "fill", label: "Filling", plannedMin: 12, target: liquorL },
    { kind: "dose", label: "Salt & dye dosing", plannedMin: 20, target: Math.round(qtyKg * 0.1) },
    { kind: "heat", label: "Heating", plannedMin: heatMin, target: dyeTemp },
    { kind: "hold", label: "Dyeing", plannedMin: holds.dye, target: dyeTemp },
    { kind: "dose", label: "Alkali dosing", plannedMin: 15, target: Math.round(qtyKg * 0.06) },
    { kind: "hold", label: "Fixation", plannedMin: holds.fix, target: dyeTemp },
    { kind: "cool", label: "Cooling", plannedMin: 12, target: 50 },
    { kind: "drain", label: "Drain", plannedMin: 8, target: 0 },
    { kind: "rinse", label: "Hot wash", plannedMin: 15, target: 70 },
    ...soaping,
    { kind: "rinse", label: "Cold rinse", plannedMin: 12, target: AMBIENT_C },
    { kind: "unload", label: "Unloading", plannedMin: 15, target: AMBIENT_C },
  ]
}

/** Inserted after a failed shade check: top-up dosing and a second dyeing hold. */
export function correctionSteps(recipe: RecipeStep[], qtyKg: number): RecipeStep[] {
  const dyeTemp = recipe.find((s) => s.label === "Dyeing")?.target ?? 60
  return [
    { kind: "dose", label: "Shade top-up dosing", plannedMin: 10, target: Math.round(qtyKg * 0.02) },
    { kind: "hold", label: "Correction dyeing", plannedMin: 30, target: dyeTemp },
  ]
}

export const plannedMinutes = (recipe: RecipeStep[]) =>
  recipe.reduce((sum, step) => sum + step.plannedMin, 0)

/** Bath temperature at the start and end of each step, chained through the recipe. */
export function temperatureProfile(recipe: RecipeStep[]): { from: number; to: number }[] {
  let current = AMBIENT_C
  return recipe.map((step) => {
    const from = current
    const to =
      step.kind === "heat" || step.kind === "hold" || step.kind === "cool" || step.kind === "rinse"
        ? step.target
        : step.kind === "drain"
          ? Math.max(AMBIENT_C, from - 6)
          : step.kind === "unload" || step.kind === "load"
            ? AMBIENT_C
            : from
    current = to
    return { from, to }
  })
}

export const machineById = new Map(MACHINES.map((m) => [m.id, m]))
export const buyerById = new Map(BUYERS.map((b) => [b.id, b]))
