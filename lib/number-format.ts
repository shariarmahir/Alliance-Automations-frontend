import type { Format } from "@number-flow/react"

/**
 * NumberFlow re-measures its layout whenever it receives a different `format` object. Passing a fresh object literal on
 * every render therefore forces a reflow each time the surrounding component re-renders, even when the value is unchanged.
 * Use these shared instances instead.
 */
export const PERCENT_FORMAT: Format = { style: "percent", maximumFractionDigits: 1 }

const fixed = new Map<number, Format>()

/** A format with exactly `digits` decimals, one shared instance per digit count. */
export function fixedFormat(digits: number): Format {
  let format = fixed.get(digits)
  if (!format) {
    format = { maximumFractionDigits: digits, minimumFractionDigits: digits }
    fixed.set(digits, format)
  }
  return format
}
