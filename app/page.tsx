import { ArrowRight, ArrowUpRight } from "lucide-react"
import Link from "next/link"
import { BRAND, Logo } from "@/components/brand/logo"
import { LiveCounters } from "@/components/landing/live-counters"
import { Reveal } from "@/components/reveal"
import { Button } from "@/components/ui/button"
import { NAV_ITEMS } from "@/lib/navigation"

const LAYERS = [
  { name: "Machines", detail: "PLC and dyeing controllers, PT100, level, flow and energy meters, QR batch cards" },
  { name: "Edge", detail: "Industrial gateway over Modbus and OPC UA, buffered offline, MQTT on wired LAN" },
  { name: "Platform", detail: "Ingestion, PostgreSQL + TimescaleDB, rules engine, AI agents, REST and WebSocket" },
  { name: "Screens", detail: "Control room, TV wallboards, operator tablets, CRM and ERP sync, mobile alerts" },
]

export default function HomePage() {
  return (
    <div className="min-h-dvh bg-blueprint">
      <div className="mx-auto flex max-w-6xl flex-col gap-16 px-4 py-8 md:px-6 md:py-12">
        <header className="flex items-center justify-between">
          <Logo />
          <Button asChild variant="outline">
            <Link href="/dashboard">
              Open console <ArrowRight />
            </Link>
          </Button>
        </header>

        <Reveal className="flex flex-col gap-6">
          <p className="text-sm font-medium tracking-widest text-primary uppercase">{BRAND.tagline}</p>
          <h1 className="max-w-4xl text-4xl font-semibold tracking-tight text-balance md:text-6xl">
            Every dyeing machine, every batch, live on one screen.
          </h1>
          <p className="max-w-2xl text-lg text-muted-foreground text-pretty">
            {BRAND.product} connects fifty dyeing machines to one live system: state from the machines, plans from the
            ERP, alerts before a delivery slips, and AI agents that learn from every batch.
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
        </Reveal>

        <Reveal order={1}>
          <LiveCounters />
          <p className="mt-2 text-xs text-muted-foreground">Live demo on a simulated feed of a 50-machine garment dyeing floor.</p>
        </Reveal>

        <Reveal order={2} className="flex flex-col gap-4">
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
        </Reveal>

        <Reveal order={3} className="flex flex-col gap-4">
          <h2 className="text-xl font-semibold tracking-tight">How it is built</h2>
          <ol className="grid gap-3 md:grid-cols-4">
            {LAYERS.map((layer, index) => (
              <li key={layer.name} className="rounded-xl bg-card p-4 ring-1 ring-foreground/10">
                <span className="font-mono text-xs text-primary">0{index + 1}</span>
                <p className="mt-1 font-medium">{layer.name}</p>
                <p className="mt-1 text-sm text-muted-foreground">{layer.detail}</p>
              </li>
            ))}
          </ol>
        </Reveal>

        <footer className="flex flex-wrap items-center justify-between gap-2 border-t pt-6 text-sm text-muted-foreground">
          <span>
            © {new Date().getFullYear()} {BRAND.company}
          </span>
          <span>{BRAND.product} · production demo</span>
        </footer>
      </div>
    </div>
  )
}
