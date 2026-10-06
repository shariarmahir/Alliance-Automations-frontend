"use client"

import { createContext, useContext, type SVGProps } from "react"

/**
 * The scene is animated with declarative SVG animation (SMIL). It needs no JavaScript per frame,
 * and the whole layer switches off for people who prefer reduced motion, leaving a still pose.
 */
const MotionAllowed = createContext(true)
export const SceneMotionProvider = MotionAllowed.Provider

export function Animate(props: SVGProps<SVGAnimateElement>) {
  return useContext(MotionAllowed) ? <animate repeatCount="indefinite" {...props} /> : null
}

export function AnimateTransform(props: SVGProps<SVGAnimateTransformElement>) {
  return useContext(MotionAllowed) ? <animateTransform repeatCount="indefinite" {...props} /> : null
}

export function AnimateMotion(props: SVGProps<SVGAnimateMotionElement>) {
  return useContext(MotionAllowed) ? <animateMotion repeatCount="indefinite" {...props} /> : null
}

export interface Keyframe {
  /** Position in the loop, 0 to 1. */
  at: number
  value: number
}

const EASE = "0.45 0 0.55 1"

/** Attributes for a keyframed animation with smooth easing between every pair of keyframes. */
export function track(frames: Keyframe[], format: (value: number) => string = String) {
  return {
    values: frames.map((frame) => format(frame.value)).join(";"),
    keyTimes: frames.map((frame) => frame.at).join(";"),
    calcMode: "spline" as const,
    keySplines: Array(frames.length - 1).fill(EASE).join(";"),
  }
}
