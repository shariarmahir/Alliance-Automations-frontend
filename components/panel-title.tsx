import type { ComponentType, ReactNode } from "react"
import type { IconProps } from "@/components/landing/icons/frame"
import { CardTitle } from "@/components/ui/card"

/** A panel heading led by an animated icon on a brand tile, as on the landing page. */
export function PanelTitle({ icon: Icon, children }: { icon: ComponentType<IconProps>; children: ReactNode }) {
  return (
    <CardTitle className="flex items-center gap-2.5 font-semibold">
      <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-brand/10 text-brand ring-1 ring-brand/20">
        <Icon className="size-5" />
      </span>
      {children}
    </CardTitle>
  )
}
