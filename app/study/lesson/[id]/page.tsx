import prisma from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import { ChevronLeft } from "lucide-react"
import Link from "next/link"
import { LessonSession } from "../lesson-session"
import { notFound } from "next/navigation"

export default async function LessonPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params
  const lessonId = resolvedParams.id

  // Fetch lesson + its words with full data
  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: {
      words: {
        orderBy: { createdAt: 'asc' },
        include: {
          definitions: true,
          exampleSentences: true,
        },
      },
    },
  })

  if (!lesson) {
    notFound()
  }

  return (
    <div className="flex flex-col flex-1 p-6 max-w-5xl mx-auto w-full min-h-[calc(100vh-4rem)]">

      {/* Top Navigation */}
      <div className="flex items-center gap-3 mb-6">
        <Link href="/study">
          <Button variant="ghost" size="icon" className="rounded-full h-9 w-9">
            <ChevronLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex flex-col">
          <span className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground leading-none mb-0.5">
            Lesson
          </span>
          <span className="font-semibold text-base leading-tight">{lesson.name}</span>
        </div>
        <div className="ml-auto text-xs text-muted-foreground bg-muted/40 rounded-full px-3 py-1 font-medium">
          {lesson.words.length} word{lesson.words.length !== 1 ? "s" : ""}
        </div>
      </div>

      {/* Hand off to interactive Session Component */}
      <LessonSession words={lesson.words} lessonName={lesson.name} />

    </div>
  )
}