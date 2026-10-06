import { ArrowRight, ArrowUpRight } from "lucide-react"
import Link from "next/link"
import { BRAND } from "@/components/brand/logo"
import { Button } from "@/components/ui/button"

export function Hero() {
  return (
    <div className="flex flex-col gap-6">
      <p className="text-sm font-medium tracking-widest text-primary uppercase">{BRAND.tagline}</p>
      <h1 className="max-w-4xl text-4xl font-semibold tracking-tight text-balance md:text-6xl">
        Every dyeing machine, every batch, live on one screen.
      </h1>
      <p className="max-w-2xl text-lg text-muted-foreground text-pretty">
        {BRAND.product} connects fifty dyeing machines to one live system: state from the machines, plans from the ERP,
        alerts before a delivery slips, and AI agents that learn from every batch.
      </p>
      <div className="flex flex-wrap gap-3">
        <Button asChild size="lg" className="h-11 px-5 text-base">
          <Link href="/dashboard">
            Open the control room <ArrowRight />
          </Link>
        </Button>
        <Button asChild size="lg" variant="outline" className="h-11 px-5 text-base">
          <Link href="/tv" target="_blank">
            Launch TV wallboard <ArrowUpRight />
          </Link>
        </Button>
      </div>
    </div>
  )
}
