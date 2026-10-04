import { cn } from "@/lib/utils"

export const BRAND = {
  company: "Kandari-lab",
  product: "Alliance Automations",
  tagline: "Dyeing floor intelligence",
} as const

/**
 * Kandari-lab mark: a dye droplet cut by a signal line.
 * To use the official logo, drop it in /public/brand and render it with next/image here.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={cn("size-9", className)} role="img" aria-label={BRAND.company}>
      <defs>
        <linearGradient id="kl-mark" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="var(--primary)" />
          <stop offset="1" stopColor="var(--chart-1)" />
        </linearGradient>
      </defs>
      <rect width="40" height="40" rx="11" fill="url(#kl-mark)" />
      <path
        d="M20 8.5c4.7 6 7.5 10.3 7.5 14a7.5 7.5 0 0 1-15 0c0-3.7 2.8-8 7.5-14Z"
        fill="none"
        stroke="var(--primary-foreground)"
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
      <path
        d="M9 24.5h6.2l2.3-4 3.4 7 2.4-4.4H31"
        fill="none"
        stroke="var(--primary-foreground)"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function Logo({ className, compact = false }: { className?: string; compact?: boolean }) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <LogoMark />
      {!compact && (
        <div className="leading-none">
          <div className="text-[15px] font-semibold tracking-tight">{BRAND.company}</div>
          <div className="mt-1 text-[11px] text-muted-foreground">{BRAND.product}</div>
        </div>
      )}
    </div>
  )
}
