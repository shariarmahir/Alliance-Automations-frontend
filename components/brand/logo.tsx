import Image from "next/image"
import { cn } from "@/lib/utils"

export const BRAND = {
  company: "Kandari-Lab",
  product: "Alliance Automations",
  tagline: "Dyeing floor intelligence",
  website: "https://frontend-u1mk.vercel.app/",
} as const

const LOGO = { src: "/brand/kandari-lab-logo.png", width: 1600, height: 967 }
const MARK = { src: "/brand/kandari-lab-mark.png", size: 256 }

/**
 * The logo is transparent with black linework, so it needs a light-enough ground. It sits on a brand-blue
 * tile, which keeps it legible on dark surfaces; on a brand-blue bar the tile disappears.
 */
const TILE = "grid shrink-0 place-items-center rounded-lg bg-brand ring-1 ring-black/10"

/** Tile and artwork heights per size. Explicit, because a percentage height cannot resolve inside the grid tile. */
const MARK_SIZES = {
  sm: { tile: "h-8 px-1", image: "h-6" },
  md: { tile: "h-10 px-1.5", image: "h-8" },
  lg: { tile: "h-12 px-2", image: "h-10" },
  xl: { tile: "h-16", image: "h-16" },
} as const

/** Wide Kandari-Lab logo. The width follows the artwork. */
export function LogoMark({ size = "md", className }: { size?: keyof typeof MARK_SIZES; className?: string }) {
  const { tile, image } = MARK_SIZES[size]
  return (
    <span className={cn(TILE, tile, className)}>
      <Image src={LOGO.src} width={LOGO.width} height={LOGO.height} alt={BRAND.company} className={cn(image, "w-auto max-w-none")} priority />
    </span>
  )
}

/** Square mark for collapsed navigation and other tight spaces. */
export function LogoSquare({ className }: { className?: string }) {
  return (
    <span className={cn(TILE, "size-8 overflow-hidden", className)}>
      <Image src={MARK.src} width={MARK.size} height={MARK.size} alt={BRAND.company} className="size-8 object-cover" />
    </span>
  )
}

interface LogoProps {
  size?: keyof typeof MARK_SIZES
  /** On a brand-blue surface: drops the tile outline so the artwork sits directly on the bar. */
  flush?: boolean
  className?: string
}

export function Logo({ size, flush, className }: LogoProps) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <LogoMark size={size} className={flush ? "ring-0" : undefined} />
      <div className="leading-none">
        <div className="text-base font-semibold tracking-tight whitespace-nowrap">{BRAND.product}</div>
        <div className="mt-1 text-xs opacity-70">by {BRAND.company}</div>
      </div>
    </div>
  )
}
