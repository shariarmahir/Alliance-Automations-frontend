import { BRAND, Logo } from "@/components/brand/logo"
import { VisitKandariLab } from "@/components/brand/visit-kandari-lab"

export function SiteFooter() {
  return (
    <footer className="bg-brand text-brand-foreground">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-6 px-4 py-10 md:px-6">
        <div className="flex flex-col gap-4">
          <Logo size="xl" flush />
          <p className="text-sm opacity-75">
            © {new Date().getFullYear()} {BRAND.company}. {BRAND.product} · {BRAND.tagline}
          </p>
        </div>
        <VisitKandariLab variant="default" className="h-11 px-5 text-base bg-brand-foreground text-brand hover:bg-brand-foreground/85" />
      </div>
    </footer>
  )
}
