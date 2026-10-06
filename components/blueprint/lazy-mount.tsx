"use client"

import { useEffect, useRef, useState, type ReactNode } from "react"
import { onVisibilityChange } from "@/lib/visibility"

interface LazyMountProps {
  /** Reserves the space, so nothing shifts when the content arrives. */
  className: string
  children: ReactNode
}

/** Mounts heavy content (charts) the first time it nears the viewport, instead of during the page's first render. */
export function LazyMount({ className, children }: LazyMountProps) {
  const [mounted, setMounted] = useState(false)
  const box = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const element = box.current
    if (!element) return
    const stop = onVisibilityChange(element, (visible) => {
      if (!visible) return
      setMounted(true)
      stop()
    })
    return stop
  }, [])

  return (
    <div ref={box} className={className}>
      {mounted && children}
    </div>
  )
}
