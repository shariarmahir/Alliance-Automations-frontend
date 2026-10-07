import type { Format } from "@number-flow/react"

/**
 * NumberFlow re-measures its layout whenever it receives a different `format` object. Passing a fresh object literal on
 * every render therefore forces a reflow each time the surrounding component re-renders, even when the value is unchanged.
 * Use these shared instances instead.
 */
export const PERCENT_FORMAT: Format = { style: "percent", maximumFractionDigits: 1 }

