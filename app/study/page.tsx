import {
  Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { BookOpen, ChevronRight } from "lucide-react"
import Link from "next/link"
import prisma from "@/lib/prisma"

export default async function StudyDashboard() {
  const WORDS_PER_LESSON = 2

  // 1. Get ONLY the total count of words (Lightning fast!)
  const totalWords = await prisma.word.count()

  // 2. Calculate how many lessons we have
  const totalLessons = Math.ceil(totalWords / WORDS_PER_LESSON)

  // 3. Create an array of lesson numbers (e.g., [1, 2, 3, 4])
  const lessonArray = Array.from({ length: totalLessons }, (_, i) => i + 1)

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 px-4">
        <SidebarTrigger className="-ms-1" />
        <Separator orientation="vertical" className="me-2 h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem className="hidden md:block">
              <BreadcrumbPage>Study</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </header>

      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="min-h-screen flex flex-col flex-1 rounded-xl bg-muted/30 p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold tracking-tight">Your Lessons</h1>
            <p className="text-muted-foreground text-sm mt-1">
              {totalWords} words divided into {totalLessons} lessons.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {lessonArray.map((lessonNumber) => (
              <Link href={`/study/lesson/${lessonNumber}`} key={lessonNumber} className="block group">
                <div className="flex flex-col rounded-xl border bg-card text-card-foreground shadow-sm p-5 hover:border-primary/50 transition-colors h-full relative overflow-hidden">
                  <BookOpen className="absolute -bottom-4 -right-4 h-24 w-24 text-muted/20 group-hover:text-primary/5 transition-colors duration-500 pointer-events-none" />

                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                        {lessonNumber}
                      </div>
                      <h3 className="font-semibold text-lg">
                        Lesson {lessonNumber.toLocaleString('en-US', { minimumIntegerDigits: 2 })}
                      </h3>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}