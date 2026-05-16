import prisma from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import { ChevronLeft } from "lucide-react"
import Link from "next/link"
import { LessonSession } from "../lesson-session"
// Import the Client-side session manager we will build next

export default async function LessonPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params
  const lessonNumber = parseInt(resolvedParams.id, 10)
  const WORDS_PER_LESSON = 2

  if (isNaN(lessonNumber) || lessonNumber < 1) {
    return (/* Invalid Lesson Error (from previous step) */ <div />)
  }

  // Fetch words WITH definitions and sentences
  const lessonWords = await prisma.word.findMany({
    orderBy: { createdAt: 'asc' },
    skip: (lessonNumber - 1) * WORDS_PER_LESSON,
    take: WORDS_PER_LESSON,
    include: {
      definitions: true,
      exampleSentences: true,
    }
  })

  if (lessonWords.length === 0) {
    return (/* Lesson not found Error (from previous step) */ <div />)
  }

  return (
    <div className="flex flex-col flex-1 p-6 max-w-5xl mx-auto w-full min-h-[calc(100vh-4rem)]">

      {/* Subtle Top Navigation */}
      <div className="flex items-center gap-4 mb-4">
        <Link href="/study">
          <Button variant="ghost" size="icon" className="rounded-full">
            <ChevronLeft className="h-5 w-5" />
          </Button>
        </Link>
        <span className="text-sm font-medium text-muted-foreground uppercase tracking-widest">
          Lesson {lessonNumber.toLocaleString('en-US', { minimumIntegerDigits: 2 })}
        </span>
      </div>

      {/* Hand off the data to our interactive Session Component */}
      <LessonSession words={lessonWords} lessonId={lessonNumber} />

    </div>
  )
}