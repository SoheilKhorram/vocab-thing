'use client'

import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { CheckCircle2, ArrowLeft, RotateCcw } from "lucide-react"
import { updateWordProgressAction } from "@/app/actions/word-actions"
import { Flashcard } from "../components/flashcard"

type WordData = {
  id: number
  englishTerm: string
  persianTranslations: string[]
  definitions: { content: string }[]
  exampleSentences: { content: string }[]
  studyProgress: number[]
}

export function LessonSession({ words, lessonName }: { words: WordData[], lessonName: string }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPending, startTransition] = useTransition()

  const handleNextWord = (knewIt: boolean) => {
    const currentWord = words[currentIndex]
    const currentProgress = currentWord.studyProgress || [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    const nextEmptyBoxIndex = currentProgress.indexOf(0)

    if (nextEmptyBoxIndex !== -1) {
      const newProgress = [...currentProgress]
      newProgress[nextEmptyBoxIndex] = knewIt ? 1 : 2
      startTransition(async () => {
        await updateWordProgressAction(currentWord.id, newProgress)
      })
    }

    setCurrentIndex(prev => prev + 1)
  }

  const handleRestart = () => {
    setCurrentIndex(0)
  }

  // Lesson complete screen
  if (currentIndex >= words.length) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-5 py-16 animate-in fade-in duration-500">
        <div className="relative">
          <div className="h-28 w-28 rounded-3xl bg-emerald-500/10 flex items-center justify-center">
            <CheckCircle2 className="h-14 w-14 text-emerald-500" />
          </div>
          {/* Decorative rings */}
          <div className="absolute inset-0 rounded-3xl ring-1 ring-emerald-500/20 scale-110 animate-pulse" />
          <div className="absolute inset-0 rounded-3xl ring-1 ring-emerald-500/10 scale-125" />
        </div>

        <div className="text-center space-y-2 mt-2">
          <h2 className="text-3xl font-bold">Lesson Complete!</h2>
          <p className="text-muted-foreground max-w-sm">
            You reviewed all <strong className="text-foreground">{words.length}</strong> words in{" "}
            <strong className="text-foreground">{lessonName}</strong>. Great work!
          </p>
        </div>

        <div className="flex items-center gap-3 mt-2">
          <Link href="/study">
            <Button variant="outline" size="lg" className="rounded-full px-6 gap-2">
              <ArrowLeft className="h-4 w-4" />
              All Lessons
            </Button>
          </Link>
          <Button
            size="lg"
            className="rounded-full px-6 gap-2"
            onClick={handleRestart}
          >
            <RotateCcw className="h-4 w-4" />
            Practice Again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Progress Bar */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-500 ease-out"
            style={{ width: `${(currentIndex / words.length) * 100}%` }}
          />
        </div>
        <span className="text-xs font-medium text-muted-foreground shrink-0 tabular-nums">
          {currentIndex} / {words.length}
        </span>
      </div>

      <Flashcard
        word={words[currentIndex]}
        onNext={handleNextWord}
      />
    </div>
  )
}