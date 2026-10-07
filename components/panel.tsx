import type { ComponentProps } from "react"
import { GlowCard } from "@/components/glow-card"
import { cn } from "@/lib/utils"

/**
 * The console's card: the landing page's transparent glow card with the spacing of the shadcn `Card`, so
 * `CardHeader`, `CardTitle`, `CardContent` and `CardAction` work inside it unchanged.
 */
export function Panel({ className, ...props }: ComponentProps<typeof GlowCard>) {
  return (
    <GlowCard
      data-slot="card"
      className={cn(
        "group/card flex flex-col gap-(--card-spacing) bg-card/45 py-(--card-spacing) text-sm text-card-foreground [--card-spacing:--spacing(4)] md:[--card-spacing:--spacing(5)]",
        className,
      )}
      {...props}
    />
  )
}
