import { Animate, AnimateTransform } from "@/components/landing/scene/anim"
import { FABRIC, SCENE } from "@/components/landing/scene/layout"

const BASE_X = 96
const LINK_1 = 48
const LINK_2 = 42
const LOOP = "6s"
/** Pause at the supply column, swing to the belt, pause to release, swing back. */
const TIMES = "0;0.1;0.65;0.78;1"

const rotate = (values: number[]) => ({ values: values.join(";"), keyTimes: TIMES, calcMode: "linear" as const, dur: LOOP })

/** Joint angles at supply, belt, belt and supply. The box counter-rotates by the sum so it stays level. */
const SHOULDER = [-20, -20, 35, 35, -20]
const ELBOW = [15, 15, 70, 70, 15]
const BOX_LEVEL = SHOULDER.map((angle, index) => -(angle + ELBOW[index]))

export function LoaderArm() {
  const base = SCENE.floorY - 4

  return (
    <g>
      <rect x={30} y={326} width={52} height={SCENE.floorY - 326} rx={5} className="fill-muted stroke-foreground/30" strokeWidth={2} />
      <rect x={BASE_X - 14} y={base - 4} width={28} height={12} rx={4} className="fill-foreground/60" />

      <g transform={`translate(${BASE_X} ${base})`}>
        <AnimateTransform attributeName="transform" type="rotate" additive="sum" {...rotate(SHOULDER)} />
        <rect x={-5} y={-LINK_1} width={10} height={LINK_1} rx={5} className="fill-foreground/55" />
        <g transform={`translate(0 ${-LINK_1})`}>
          <AnimateTransform attributeName="transform" type="rotate" additive="sum" {...rotate(ELBOW)} />
          <rect x={-4} y={-LINK_2} width={8} height={LINK_2} rx={4} className="fill-foreground/55" />
          <circle cy={0} r={5} className="fill-card stroke-foreground/50" strokeWidth={2} />
          <g transform={`translate(0 ${-LINK_2})`}>
            <AnimateTransform attributeName="transform" type="rotate" additive="sum" {...rotate(BOX_LEVEL)} />
            <path d="M-8 0 v16 M8 0 v16" strokeWidth={2.5} strokeLinecap="round" className="stroke-foreground/70" />
            <rect x={-8} y={0} width={16} height={16} rx={3} fill={FABRIC.raw} opacity={0}>
              <Animate attributeName="opacity" values="0;0;1;1;0;0" keyTimes="0;0.08;0.1;0.74;0.76;1" dur={LOOP} calcMode="linear" />
            </rect>
          </g>
        </g>
        <circle r={6} className="fill-card stroke-foreground/50" strokeWidth={2} />
      </g>
    </g>
  )
}
