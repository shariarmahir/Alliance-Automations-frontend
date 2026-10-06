import { ArrowRight } from "lucide-react"
import Link from "next/link"
import { GlowCard } from "@/components/glow-card"
import { SCREEN_ICONS } from "@/components/landing/icons/screens"
import { NAV_ITEMS } from "@/lib/navigation"

export function ScreenGrid() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
      {NAV_ITEMS.map((item, index) => {
        const AnimatedIcon = SCREEN_ICONS[item.title]
        return (
          <GlowCard asChild lift index={index} key={item.href}>
            <Link href={item.href} target={item.external ? "_blank" : undefined} className="group flex flex-col items-start gap-3 p-4 sm:flex-row sm:items-center sm:gap-4 sm:p-5">
              <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-brand/15 text-brand">
                {AnimatedIcon ? <AnimatedIcon className="size-7" /> : <item.icon className="size-5" aria-hidden />}
              </span>
              <div className="min-w-0">
                <p className="flex items-center gap-1 font-medium">
                  {item.title}
                  <ArrowRight className="size-3.5 opacity-0 transition-opacity group-hover:opacity-100" aria-hidden />
                </p>
                <p className="text-sm text-brand">{item.description}</p>
              </div>
            </Link>
          </GlowCard>
        )
      })}
    </div>
  )
}
