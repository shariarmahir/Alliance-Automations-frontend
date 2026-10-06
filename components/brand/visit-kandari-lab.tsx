import { ArrowUpRight } from "lucide-react"
import type { ComponentProps } from "react"
import { AnimatedGlobe } from "@/components/brand/animated-globe"
import { BRAND } from "@/components/brand/logo"
import { Button } from "@/components/ui/button"

type VisitProps = Pick<ComponentProps<typeof Button>, "variant" | "size" | "className"> & {
  label?: string
  /** Shows only the icons on narrow screens. The label stays available to screen readers. */
  compact?: boolean
}

/** Opens the Kandari-Lab website in a new tab. The address itself is never shown. */
export function VisitKandariLab({ variant = "outline", size, className, compact, label = `Visit ${BRAND.company}` }: VisitProps) {
  return (
    <Button asChild variant={variant} size={size} className={className}>
      <a href={BRAND.website} target="_blank" rel="noopener noreferrer">
        <AnimatedGlobe />
        <span className={compact ? "max-sm:sr-only" : undefined}>{label}</span>
        <ArrowUpRight className={compact ? "max-sm:hidden" : undefined} />
      </a>
    </Button>
  )
}
