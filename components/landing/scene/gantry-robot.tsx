import { Animate, AnimateTransform, track, type Keyframe } from "@/components/landing/scene/anim"
import { FABRIC, SCENE, STATIONS } from "@/components/landing/scene/layout"

const LOOP = "30s"
/** Cable length with the batch lifted clear of the vats, lowered to the belt, and dipped in a vat. */
const UP = 112
const BELT = 246
const DIP = 250
/** Top of the cable, just under the carriage. */
const CABLE_TOP = SCENE.railY + 16

/** [loop position, rail x, cable length]. One full cycle: pick, dye, wash, fix, place, return. */
const STEPS: [number, number, number][] = [
  [0, STATIONS.pick, UP],
  [0.04, STATIONS.pick, BELT],
  [0.07, STATIONS.pick, BELT],
  [0.11, STATIONS.pick, UP],
  [0.19, STATIONS.dye, UP],
  [0.23, STATIONS.dye, DIP],
  [0.3, STATIONS.dye, DIP],
  [0.34, STATIONS.dye, UP],
  [0.42, STATIONS.wash, UP],
  [0.46, STATIONS.wash, DIP],
  [0.52, STATIONS.wash, DIP],
  [0.56, STATIONS.wash, UP],
  [0.64, STATIONS.fix, UP],
  [0.68, STATIONS.fix, DIP],
  [0.74, STATIONS.fix, DIP],
  [0.78, STATIONS.fix, UP],
  [0.84, STATIONS.place, UP],
  [0.87, STATIONS.place, BELT],
  [0.9, STATIONS.place, BELT],
  [0.93, STATIONS.place, UP],
  [1, STATIONS.pick, UP],
]

const frames = (pick: (step: [number, number, number]) => number): Keyframe[] => STEPS.map((step) => ({ at: step[0], value: pick(step) }))
const railX = track(frames((step) => step[1]), (x) => `${x} 0`)
const cable = track(frames((step) => step[2]))
const gripperY = track(frames((step) => step[2]), (length) => `0 ${CABLE_TOP + length}`)

/** The batch is raw cotton, turns teal in the dye vat, lightens in the wash and settles in the fix. */
const BUNDLE_COLOR = {
  values: [FABRIC.raw, FABRIC.raw, FABRIC.dyed, FABRIC.dyed, FABRIC.washed, FABRIC.washed, FABRIC.dyed, FABRIC.dyed].join(";"),
  keyTimes: "0;0.23;0.31;0.46;0.53;0.68;0.75;1",
}
/** Present from the moment it is gripped until it is released onto the outgoing belt. */
const BUNDLE_VISIBLE = { values: "0;0;1;1;0;0", keyTimes: "0;0.065;0.07;0.895;0.9;1" }

export function GantryRobot() {
  return (
    <g transform={`translate(${STATIONS.pick} 0)`}>
      <AnimateTransform attributeName="transform" type="translate" dur={LOOP} {...railX} />

      <rect x={-34} y={SCENE.railY - 8} width={68} height={24} rx={7} className="fill-card stroke-foreground/40" strokeWidth={2} />
      <circle cx={24} cy={SCENE.railY + 4} r={3} className="fill-running">
        <Animate attributeName="opacity" values="1;0.3;1" dur="1.2s" />
      </circle>

      <rect x={-1.5} y={CABLE_TOP} width={3} height={UP} className="fill-foreground/55">
        <Animate attributeName="height" dur={LOOP} {...cable} />
      </rect>

      <g transform={`translate(0 ${CABLE_TOP + UP})`}>
        <AnimateTransform attributeName="transform" type="translate" dur={LOOP} {...gripperY} />
        <rect x={-24} y={-11} width={48} height={11} rx={3} className="fill-foreground/70" />
        <path d="M-21 0 v16 M21 0 v16" strokeWidth={3} strokeLinecap="round" className="stroke-foreground/70" />
        <g opacity={0}>
          <Animate attributeName="opacity" dur={LOOP} calcMode="linear" {...BUNDLE_VISIBLE} />
          <rect x={-24} y={2} width={48} height={36} rx={8} fill={FABRIC.raw}>
            <Animate attributeName="fill" dur={LOOP} calcMode="linear" {...BUNDLE_COLOR} />
          </rect>
          <path d="M-18 12 h36 M-18 21 h36 M-18 30 h36" strokeWidth={1.5} className="stroke-black/20" />
        </g>
      </g>
    </g>
  )
}
