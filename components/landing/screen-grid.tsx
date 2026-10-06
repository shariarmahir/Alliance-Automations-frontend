import { ArrowRight } from "lucide-react"
import Link from "next/link"
import { NAV_ITEMS } from "@/lib/navigation"

export function ScreenGrid() {
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-xl font-semibold tracking-tight">Screens</h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            target={item.external ? "_blank" : undefined}
            className="group flex items-start gap-3 rounded-xl bg-card p-4 ring-1 ring-foreground/10 transition-shadow hover:ring-primary/50"
          >
            <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-primary/12 text-primary">
              <item.icon className="size-5" aria-hidden />
            </span>
            <div className="min-w-0">
              <p className="flex items-center gap-1 font-medium">
                {item.title}
                <ArrowRight className="size-3.5 opacity-0 transition-opacity group-hover:opacity-100" aria-hidden />
              </p>
              <p className="text-sm text-muted-foreground">{item.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
