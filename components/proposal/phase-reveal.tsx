import { ChevronDown } from "lucide-react"
import { motion } from "motion/react"
import { cn } from "@/lib/utils"

interface PhaseRevealProps {
  expanded: boolean
  /** How many phases the button reveals. */
  hidden: number
  controls: string
  onToggle: () => void
}

/**
 * Opens and closes the phases after Discovery. While closed, the badge pulses and the arrow bobs to say there is more;
 * on open the arrow turns over. The global reduced-motion rule stills both pulses.
 */
export function PhaseReveal({ expanded, hidden, controls, onToggle }: PhaseRevealProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={expanded}
      aria-controls={controls}
      className="group mx-auto flex items-center gap-3 rounded-full border border-primary/40 py-2 pr-5 pl-2 text-sm font-medium transition-colors outline-none hover:bg-primary/10 focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      <span className="relative grid size-8 place-items-center rounded-full bg-primary text-primary-foreground">
        {!expanded && <span className="absolute inset-0 animate-pulse-ring rounded-full bg-primary" aria-hidden />}
        <motion.span animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }} className="grid place-items-center">
          <ChevronDown className={cn("size-4", !expanded && "animate-bounce")} aria-hidden />
        </motion.span>
      </span>
      {expanded ? "Hide the later phases" : `View the other ${hidden} phases`}
    </button>
  )
}
