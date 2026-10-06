import { Animate, AnimateTransform } from "@/components/landing/scene/anim"
import { SCENE, VATS } from "@/components/landing/scene/layout"

const HALF_WIDTH = 62
const WALL = 6
const LIQUID_TOP = 322
/** One full wave of the surface path, in drawing units. */
const WAVE_PERIOD = 40
const WAVE_PATH = `M0 0${" q10 -7 20 0 t20 0".repeat(7)} V90 H0 Z`
const BUBBLE_OFFSETS = [-34, -12, 12, 34]
const STEAM_OFFSETS = [-22, 0, 22]

type Vat = (typeof VATS)[number]

function Liquid({ vat }: { vat: Vat }) {
  const clipId = `vat-clip-${vat.x}`
  const left = vat.x - HALF_WIDTH + WALL
  const width = (HALF_WIDTH - WALL) * 2

  return (
    <g clipPath={`url(#${clipId})`}>
      <defs>
        <clipPath id={clipId}>
          <rect x={left} y={LIQUID_TOP - 10} width={width} height={SCENE.floorY - LIQUID_TOP + 6} rx={6} />
        </clipPath>
      </defs>
      <rect x={left} y={LIQUID_TOP} width={width} height={90} style={{ fill: vat.tone }} opacity={0.4} />
      <g transform={`translate(${left - WAVE_PERIOD} ${LIQUID_TOP})`}>
        <path d={WAVE_PATH} style={{ fill: vat.tone }} opacity={0.55} />
        <AnimateTransform attributeName="transform" type="translate" values={`${left - WAVE_PERIOD} ${LIQUID_TOP};${left} ${LIQUID_TOP}`} dur="2.4s" />
      </g>
      {BUBBLE_OFFSETS.map((offset, index) => (
        <circle key={offset} cx={vat.x + offset} cy={SCENE.floorY - 8} r={2.5} fill="white" opacity={0}>
          <Animate attributeName="cy" values={`${SCENE.floorY - 8};${LIQUID_TOP + 6}`} dur={`${2.2 + index * 0.45}s`} begin={`${index * 0.6}s`} />
          <Animate attributeName="opacity" values="0;0.7;0" dur={`${2.2 + index * 0.45}s`} begin={`${index * 0.6}s`} />
        </circle>
      ))}
    </g>
  )
}

function Steam({ x }: { x: number }) {
  return (
    <g>
      {STEAM_OFFSETS.map((offset, index) => (
        <circle key={offset} cx={x + offset} cy={SCENE.vatTopY - 6} r={5} opacity={0} className="fill-foreground">
          <Animate attributeName="cy" values={`${SCENE.vatTopY - 6};${SCENE.vatTopY - 52}`} dur="3s" begin={`${index * 0.9}s`} />
          <Animate attributeName="opacity" values="0;0.22;0" dur="3s" begin={`${index * 0.9}s`} />
          <Animate attributeName="r" values="4;9" dur="3s" begin={`${index * 0.9}s`} />
        </circle>
      ))}
    </g>
  )
}

export function DyeVat({ vat }: { vat: Vat }) {
  const { x } = vat
  const bottom = SCENE.floorY

  return (
    <g>
      <Liquid vat={vat} />
      <path
        d={`M${x - HALF_WIDTH} ${SCENE.vatTopY} V${bottom - 8} a8 8 0 0 0 8 8 H${x + HALF_WIDTH - 8} a8 8 0 0 0 8 -8 V${SCENE.vatTopY}`}
        fill="none"
        strokeWidth={3}
        strokeLinejoin="round"
        className="stroke-foreground/35"
      />
      <rect x={x - HALF_WIDTH - 6} y={SCENE.vatTopY - 5} width={HALF_WIDTH * 2 + 12} height={6} rx={3} className="fill-foreground/30" />
      {vat.hot && <Steam x={x} />}
      <g className="font-mono" fontSize={12}>
        <text x={x} y={SCENE.floorY - 14} textAnchor="middle" fill="white" fontWeight={600}>
          {vat.reading}
        </text>
        <text x={x} y={SCENE.floorY + 26} textAnchor="middle" letterSpacing={2} className="fill-muted-foreground">
          {vat.label}
        </text>
      </g>
      <circle cx={x + HALF_WIDTH - 14} cy={SCENE.vatTopY + 18} r={3.5} className="fill-running">
        <Animate attributeName="opacity" values="1;0.25;1" dur="1.6s" />
      </circle>
    </g>
  )
}
