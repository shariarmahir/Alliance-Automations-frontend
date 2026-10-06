"use client"

import { motion } from "motion/react"

interface TitleLine {
  text: string
}

const WORD_DELAY = 0.07
const EASE = [0.22, 1, 0.36, 1] as const

/** Headline that reveals word by word, one line per row. MotionConfig in Providers skips the movement for reduced-motion users. */
export function HeroTitle({ lines }: { lines: TitleLine[] }) {
  // Words are numbered across lines so the reveal runs as one continuous sequence.
  const rows = lines.map((line, lineIndex) => {
    const words = line.text.split(" ")
    const firstIndex = lines.slice(0, lineIndex).reduce((count, previous) => count + previous.text.split(" ").length, 0)
    return { ...line, words, firstIndex }
  })

  return (
    <h1 className="text-2xl leading-[1.15] font-semibold tracking-tight text-white sm:text-4xl lg:text-3xl xl:text-[2rem]">
      {rows.map((line) => (
        <span key={line.text} className="block">
          {line.words.map((word, wordIndex) => (
            <span key={`${line.text}-${word}`} className="inline-block overflow-hidden pb-[0.12em] align-bottom">
              <motion.span
                className="inline-block"
                initial={{ y: "105%" }}
                animate={{ y: 0 }}
                transition={{ duration: 0.7, ease: EASE, delay: 0.1 + (line.firstIndex + wordIndex) * WORD_DELAY }}
              >
                {word}&nbsp;
              </motion.span>
            </span>
          ))}
        </span>
      ))}
    </h1>
  )
}
