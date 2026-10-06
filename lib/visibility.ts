type Listener = (visible: boolean) => void

const listeners = new Map<Element, Listener>()
let observer: IntersectionObserver | null = null

/** One observer serves every element, so dozens of animated cards cost one callback per scroll step, not dozens of observers. */
function shared() {
  observer ??= new IntersectionObserver((entries) => entries.forEach((entry) => listeners.get(entry.target)?.(entry.isIntersecting)), { rootMargin: "120px" })
  return observer
}

/** Calls `listener` as the element enters or leaves the viewport (with a small margin). Returns the cleanup. */
export function onVisibilityChange(element: Element, listener: Listener) {
  if (typeof IntersectionObserver === "undefined") return () => {}
  listeners.set(element, listener)
  shared().observe(element)
  return () => {
    shared().unobserve(element)
    listeners.delete(element)
  }
}
