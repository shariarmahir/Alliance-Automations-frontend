import { Animate, AnimateTransform } from "@/components/landing/scene/anim"
import { FABRIC, SCENE, STATIONS } from "@/components/landing/scene/layout"

const BELT_TOP = SCENE.floorY - 16
const BOX = 16

function Belt({ from, to }: { from: number; to: number }) {
  return (
    <g>
      <rect x={from} y={BELT_TOP} width={to - from} height={14} rx={7} className="fill-muted stroke-foreground/30" strokeWidth={2} />
      <line x1={from + 10} x2={to - 10} y1={BELT_TOP + 7} y2={BELT_TOP + 7} strokeWidth={3} strokeDasharray="8 8" className="stroke-foreground/35">
        <Animate attributeName="stroke-dashoffset" values="0;-16" dur="0.9s" />
      </line>
      {[from + 7, to - 7].map((cx) => (
        <circle key={cx} cx={cx} cy={BELT_TOP + 7} r={8} className="fill-card stroke-foreground/40" strokeWidth={2} />
      ))}
    </g>
  )
}

/** Raw boxes arrive from the loader arm and wait at the pick point until the gantry takes the batch. */
function IncomingBox() {
  const rest = STATIONS.pick
  return (
    <g opacity={0}>
      <Animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.03;0.9;1" dur="6s" begin="4.2s" calcMode="linear" />
      <AnimateTransform
        attributeName="transform"
        type="translate"
        values={`164 ${BELT_TOP};${rest} ${BELT_TOP};${rest} ${BELT_TOP}`}
        keyTimes="0;0.45;1"
        dur="6s"
        begin="4.2s"
        calcMode="linear"
      />
      <rect x={-BOX / 2} y={-BOX} width={BOX} height={BOX} rx={3} fill={FABRIC.raw} />
    </g>
  )
}

/** Dyed boxes leave on the outgoing belt in a steady stream. */
function OutgoingBox({ delay }: { delay: number }) {
  return (
    <g opacity={0}>
      <Animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.08;0.85;1" dur="4.5s" begin={`${delay}s`} calcMode="linear" />
      <AnimateTransform
        attributeName="transform"
        type="translate"
        values={`${STATIONS.place - 40} ${BELT_TOP};${STATIONS.place + 62} ${BELT_TOP}`}
        dur="4.5s"
        begin={`${delay}s`}
        calcMode="linear"
      />
      <rect x={-BOX / 2} y={-BOX} width={BOX} height={BOX} rx={3} fill={FABRIC.dyed} />
    </g>
  )
}

export function Conveyors() {
  return (
    <g>
      <Belt from={128} to={268} />
      <Belt from={STATIONS.place - 62} to={STATIONS.place + 80} />
      <IncomingBox />
      {[0, 1.5, 3].map((delay) => (
        <OutgoingBox key={delay} delay={delay} />
      ))}
    </g>
  )
}
