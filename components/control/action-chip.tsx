import { ArrowRight, CircleAlert, Info, Zap } from "lucide-react"
import type { ActionUrgency, NextAction } from "@/lib/domain/actions"
import { cn } from "@/lib/utils"

export const URGENCY_META: Record<ActionUrgency, { label: string; text: string; className: string; icon: typeof Zap }> = {
  critical: { label: "Critical", text: "text-delayed", className: "bg-delayed/12 text-delayed ring-delayed/30", icon: CircleAlert },
  high: { label: "Now", text: "text-held", className: "bg-held/12 text-held ring-held/30", icon: Zap },
  normal: { label: "Next", text: "text-brand", className: "bg-brand/10 text-brand ring-brand/25", icon: ArrowRight },
  info: { label: "Info", text: "text-muted-foreground", className: "bg-muted text-muted-foreground ring-foreground/10", icon: Info },
}

/** The machine's next best action as a compact line, coloured by urgency. `compact` drops the detail for narrow columns. */
export function ActionChip({ action, compact, className }: { action: NextAction; compact?: boolean; className?: string }) {
  const meta = URGENCY_META[action.urgency]
  const Icon = meta.icon
  return (
    <p className={cn("flex min-w-0 items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs ring-1 ring-inset", meta.className, className)}>
      <Icon className="size-3.5 shrink-0" aria-hidden />
      <span className="truncate font-medium">{action.title}</span>
      {!compact && <span className="ml-auto shrink-0 truncate opacity-75 max-[360px]:hidden">{action.detail.split(" · ").at(-1)}</span>}
    </p>
  )
}
