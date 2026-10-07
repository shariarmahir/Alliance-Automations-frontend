import type { ReactNode } from "react"

/** Console page heading in the landing style: a live pill, a strong title and a blue subtitle. */
export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string
  title: string
  description?: string
  actions?: ReactNode
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        {eyebrow && (
          <p className="mb-2.5 inline-flex items-center gap-2 rounded-full bg-brand/10 px-2.5 py-1 text-xs font-medium text-brand ring-1 ring-brand/25">
            <span className="relative flex size-1.5">
              <span className="absolute inset-0 animate-pulse-ring rounded-full bg-brand" />
              <span className="relative size-1.5 rounded-full bg-brand" />
            </span>
            {eyebrow}
          </p>
        )}
        <h2 className="text-2xl font-semibold tracking-tight text-balance md:text-3xl">{title}</h2>
        {description && <p className="mt-1.5 max-w-2xl text-sm font-medium text-brand text-pretty md:text-base">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  )
}
