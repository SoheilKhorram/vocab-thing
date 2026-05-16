'use client'

import { useState, useTransition } from "react"
// Make sure you are importing your Flashcard component correctly based on what you named it!
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { CheckCircle2 } from "lucide-react"

// Import the server action we created earlier to save the progress
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

export function LessonSession({ words, lessonId }: { words: WordData[], lessonId: number }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPending, startTransition] = useTransition()

  // This fires when you click the X or Check button on the flashcard
  const handleNextWord = (knewIt: boolean) => {
    const currentWord = words[currentIndex]

    // 1. Get the current progress array, fallback to zeroes if it doesn't exist
    const currentProgress = currentWord.studyProgress || [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]

    // 2. Find the index of the FIRST empty box (the first 0)
    const nextEmptyBoxIndex = currentProgress.indexOf(0)

    // 3. If there is an empty box available, update it
    if (nextEmptyBoxIndex !== -1) {
      const newProgress = [...currentProgress]
      // Set to 1 if they knew it (Check), 2 if they forgot it (Cross)
      newProgress[nextEmptyBoxIndex] = knewIt ? 1 : 2

      // 4. Silently save to the database in the background without freezing the UI
      startTransition(async () => {
        await updateWordProgressAction(currentWord.id, newProgress)
      })
    }

    // 5. Instantly move to the next word
    setCurrentIndex(prev => prev + 1)
  }

  // If we have finished all words in this lesson
  if (currentIndex >= words.length) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-6 animate-in fade-in duration-700">
        <div className="h-24 w-24 rounded-full bg-emerald-500/10 flex items-center justify-center mb-4">
          <CheckCircle2 className="h-12 w-12 text-emerald-500" />
        </div>
        <h2 className="text-3xl font-bold">Lesson Complete!</h2>
        <p className="text-muted-foreground text-center max-w-sm">
          You have successfully reviewed all words in Lesson {lessonId}. Great job!
        </p>
        <Link href="/study" className="mt-4">
          <Button size="lg" className="rounded-full px-8">Back to Dashboard</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Progress Bar */}
      <div className="w-full h-1 bg-muted rounded-full overflow-hidden mb-4">
        <div
          className="h-full bg-primary transition-all duration-500 ease-out"
          style={{ width: `${(currentIndex / words.length) * 100}%` }}
        />
      </div>

      <Flashcard
        word={words[currentIndex]}
        onNext={handleNextWord}
      />
    </div>
  )
}