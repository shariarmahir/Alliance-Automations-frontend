"use client"

import { AnimatePresence, motion } from "motion/react"
import { Fragment } from "react"
import { LAYER_ICONS } from "@/components/landing/icons/layers"
import { LAYER_META, type LayerId } from "@/lib/blueprint/build"
import { cn } from "@/lib/utils"

interface StackDiagramProps {
  layers: Record<LayerId, string[]>
  /** Always stacks top to bottom, for a narrow side panel. */
  vertical?: boolean
}

/** An arrow whose dashes flow from one layer to the next. It turns downward when the layers stack on a phone. */
function Flow({ vertical }: { vertical?: boolean }) {
  return (
    <svg
      viewBox="0 0 32 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={cn("h-6 w-8 shrink-0 rotate-90 self-center text-primary", !vertical && "lg:rotate-0")}
    >
      <path d="M2 12h22" strokeDasharray="4 5" className="animate-layer-flow" />
      <path d="M22 7l6 5-6 5" />
    </svg>
  )
}

/** The structure drawing: Machines to Edge to Platform to Screens, filled with whatever has been chosen. */
export function StackDiagram({ layers, vertical }: StackDiagramProps) {
  return (
    <div className={cn("flex flex-col items-stretch gap-2", !vertical && "lg:flex-row")}>
      {LAYER_META.map((layer, index) => {
        const Icon = LAYER_ICONS[layer.name as keyof typeof LAYER_ICONS]
        const items = layers[layer.id]
        return (
          <Fragment key={layer.id}>
            {index > 0 && <Flow vertical={vertical} />}
            <div className="flex min-w-0 flex-1 flex-col gap-4 rounded-2xl p-4 ring-1 ring-foreground/10">
              <div className="flex items-center gap-3">
                <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-brand/10 text-brand">
                  <Icon className="size-9" />
                </span>
                <div className="min-w-0">
                  <p className="font-medium">{layer.name}</p>
                  <p className="text-xs text-muted-foreground">{layer.summary}</p>
                </div>
              </div>
              <ul className="flex flex-wrap content-start gap-1.5">
                <AnimatePresence initial={false} mode="popLayout">
                  {items.map((item) => (
                    <motion.li
                      key={item}
                      layout
                      initial={{ opacity: 0, scale: 0.85 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.85 }}
                      transition={{ duration: 0.2 }}
                      className="rounded-full bg-brand/10 px-2.5 py-1 text-xs font-medium text-brand"
                    >
                      {item}
                    </motion.li>
                  ))}
                </AnimatePresence>
                {!items.length && <li className="text-xs text-muted-foreground italic">Nothing chosen yet</li>}
              </ul>
            </div>
          </Fragment>
        )
      })}
    </div>
  )
}
