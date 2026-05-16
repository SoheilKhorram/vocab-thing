'use client'

import { useState } from "react"
import { Check, Eye, EyeOff, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils" // <-- Make sure to import this

type FlashcardProps = {
  word: {
    id: number
    englishTerm: string
    persianTranslations: string[]
    definitions: { content: string }[]
    exampleSentences: { content: string }[]
    studyProgress: number[] // <-- Added this to the type
  }
  onNext: (knewIt: boolean) => void
}

export function Flashcard({ word, onNext }: FlashcardProps) {
  const [showTranslation, setShowTranslation] = useState(false)

  const highlightWord = (sentence: string, target: string) => {
    const regex = new RegExp(`(${target})`, 'gi')
    const parts = sentence.split(regex)
    return parts.map((part, i) =>
      regex.test(part) ? <strong key={i} className="text-foreground font-semibold">{part}</strong> : part
    )
  }

  // Fallback in case a word somehow doesn't have the array yet
  const progress = word.studyProgress || [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col items-center gap-12 mt-8 md:mt-16">

      {/* --- FLASHCARD --- */}
      <div className="relative w-full rounded-2xl border bg-card/40 p-8 sm:p-14 shadow-2xl backdrop-blur-sm">

        {/* Persian Translation Toggle */}
        <button
          onClick={() => setShowTranslation(!showTranslation)}
          className="absolute top-4 right-4 sm:top-6 sm:right-6 text-[10px] font-bold tracking-widest uppercase px-2 py-1.5 rounded-md text-muted-foreground hover:bg-muted/30 hover:text-foreground transition-colors"
        >
          {showTranslation ? <Eye size='20' /> : <EyeOff size='20' />}
        </button>

        {/* Word Title & Translation */}
        <div className="flex flex-col items-center justify-center mb-6">
          <h2 className="text-4xl sm:text-5xl font-bold text-center tracking-tight text-foreground">
            {word.englishTerm}
          </h2>

          {/* Revealed Translation */}
          <div className={`overflow-hidden transition-all duration-300 ease-in-out ${showTranslation ? 'max-h-20 opacity-100 mt-4' : 'max-h-0 opacity-0'}`}>
            <div className="flex gap-0.5 justify-center mb-4">
              {word.persianTranslations?.map((pt, idx) =>
                <Badge key={idx} variant="outline" className="py-3 px-3 bg-background/50 text-base">
                  {pt}
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* --- STUDY PROGRESS TRACKER --- */}
        <div className="flex items-center justify-center gap-1 sm:gap-1.5 mb-10">
          {progress.map((state, index) => {
            const isSpacedRepetitionStart = index === 8
            return (
              <div
                key={index}
                className={cn(
                  "h-6 w-6 sm:h-8 sm:w-8 rounded-md border flex items-center justify-center transition-colors",
                  state === 1 && "bg-emerald-500/10 border-emerald-500/50 text-emerald-500",
                  state === 2 && "bg-rose-500/10 border-rose-500/50 text-rose-500",
                  state === 0 && "bg-muted/30 border-border text-transparent",
                  isSpacedRepetitionStart && "ml-2 sm:ml-3" // The gap before spaced repetition
                )}
                title={index < 8 ? `Day ${index + 1}` : index === 8 ? "Day 23 (+15d)" : index === 9 ? "Day 53 (+30d)" : "Day 113 (+60d)"}
              >
                {state === 1 && <Check className="h-3 sm:h-4 w-3 sm:w-4" />}
                {state === 2 && <X className="h-3 sm:h-4 w-3 sm:w-4" />}
              </div>
            )
          })}
        </div>

        {/* Full Width Separator */}
        <div className="w-full h-[1px] bg-border mx-auto mb-10"></div>

        {/* Example Sentences */}
        <div className="space-y-8 max-w-2xl mx-auto">
          {word.exampleSentences?.slice(0, 2).map((sentence, index) => (
            <div key={index} className="flex gap-4 items-start">
              <div className="text-muted-foreground/40 font-serif text-3xl leading-none mt-1 shrink-0">
                &rdquo;
              </div>
              <p className="italic text-muted-foreground leading-relaxed text-base sm:text-lg">
                {highlightWord(sentence.content, word.englishTerm)}
              </p>
            </div>
          ))}
        </div>

      </div>

      {/* --- ACTION BUTTONS --- */}
      <div className="flex items-center gap-6">
        <Button
          variant="outline"
          size="icon"
          onClick={() => {
            setShowTranslation(false)
            onNext(false)
          }}
          className="w-16 h-16 rounded-2xl border-border bg-transparent hover:bg-destructive/10 hover:border-destructive/30 hover:text-destructive transition-all"
        >
          <X className="w-8 h-8 opacity-70" />
        </Button>

        <Button
          variant="outline"
          size="icon"
          onClick={() => {
            setShowTranslation(false)
            onNext(true)
          }}
          className="w-16 h-16 rounded-2xl border-border bg-transparent hover:bg-emerald-500/10 hover:border-emerald-500/30 hover:text-emerald-500 transition-all"
        >
          <Check className="w-8 h-8 opacity-70" />
        </Button>
      </div>

    </div>
  )
}