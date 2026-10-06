import { BRAND } from "@/components/brand/logo"

export function SiteFooter() {
  return (
    <footer className="flex flex-wrap items-center justify-between gap-2 border-t pt-6 text-sm text-muted-foreground">
      <span>
        © {new Date().getFullYear()} {BRAND.company}
      </span>
      <span>{BRAND.product} · production demo</span>
    </footer>
  )
}
