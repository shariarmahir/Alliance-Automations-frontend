import { useSyncExternalStore } from "react"

const subscribe = () => () => {}

/** False on the server and during hydration, true afterwards. Use it to render client-only values. */
export function useHydrated() {
  return useSyncExternalStore(subscribe, () => true, () => false)
}
