import { ArrowRight } from "lucide-react"
import Link from "next/link"
import { LogoMark } from "@/components/brand/logo"
import { VisitKandariLab } from "@/components/brand/visit-kandari-lab"
import { Button } from "@/components/ui/button"

export interface HeaderLink {
  href: string
  label: string
}

const HOME_LINKS: HeaderLink[] = [
  { href: "#challenge", label: "The problem" },
  { href: "#solution", label: "Solution" },
  { href: "#demo", label: "Live demo" },
  { href: "#timeline", label: "Timeline" },
  { href: "#start", label: "Start" },
]

export function SiteHeader({ links = HOME_LINKS }: { links?: HeaderLink[] }) {
  return (
    <header className="sticky top-0 z-30 bg-brand text-brand-foreground shadow-[0_1px_0_rgb(0_0_0/0.12)]">
      <div className="mx-auto flex h-20 max-w-6xl items-center gap-4 px-4 md:px-6">
        <Link href="/" aria-label="Alliance Automations home" className="rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-brand-foreground">
          <LogoMark size="xl" className="ring-0" />
        </Link>
        <nav className="hidden flex-1 items-center justify-center gap-1 lg:flex" aria-label="Page sections">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="rounded-md px-3 py-1.5 text-[15px] font-bold text-brand-foreground transition-colors hover:bg-black/15"
            >
              {link.label}
            </a>
          ))}
        </nav>
        <div className="ml-auto flex shrink-0 items-center gap-2 lg:ml-0">
          <VisitKandariLab
            compact
            variant="ghost"
            className="border-black/30 text-brand-foreground hover:bg-black/10 hover:text-brand-foreground dark:hover:bg-black/10"
          />
          <Button asChild className="bg-brand-foreground text-brand hover:bg-brand-foreground/85">
            <Link href="/dashboard">
              <span className="sm:hidden">Console</span>
              <span className="max-sm:hidden">Open console</span> <ArrowRight />
            </Link>
          </Button>
        </div>
      </div>
    </header>
  )
}
