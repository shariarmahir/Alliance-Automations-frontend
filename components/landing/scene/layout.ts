/** Coordinates of the process line, in the scene's 1000 × 440 drawing space. */
export const SCENE = {
  width: 1000,
  height: 440,
  floorY: 400,
  railY: 84,
  busY: 28,
  vatTopY: 300,
} as const

/** Where the gantry stops along the rail. */
export const STATIONS = {
  pick: 200,
  dye: 380,
  wash: 560,
  fix: 740,
  place: 910,
} as const

export const VATS = [
  { x: STATIONS.dye, label: "DYE", reading: "60.0 °C", tone: "#1f7a80", hot: true },
  { x: STATIONS.wash, label: "WASH", reading: "40.0 °C", tone: "var(--chart-1)", hot: false },
  { x: STATIONS.fix, label: "FIX", reading: "55.0 °C", tone: "var(--chart-4)", hot: true },
] as const

/** Garment colours: raw cotton, then dyed teal. */
export const FABRIC = { raw: "#e8e0cc", dyed: "#1f7a80", washed: "#3e9aa0" } as const
