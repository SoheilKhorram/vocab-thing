import {
  Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { BookOpen, ChevronRight, GraduationCap, Layers } from "lucide-react"
import Link from "next/link"
import prisma from "@/lib/prisma"

export default async function StudyDashboard() {
  // Fetch all lessons with word counts in one query
  const lessons = await prisma.lesson.findMany({
    orderBy: { createdAt: 'asc' },
    select: {
      id: true,
      name: true,
      _count: {
        select: { words: true },
      },
    },
  })

  const totalWords = lessons.reduce((sum, l) => sum + l._count.words, 0)

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 px-4">
        <SidebarTrigger className="-ms-1" />
        <Separator
          orientation="vertical"
          className="me-2 data-[orientation=vertical]:h-4 data-[orientation=vertical]:self-auto"
        />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbPage>Study</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </header>

      <div className="flex flex-1 flex-col gap-6 p-4 pt-0">
        {/* Hero Stats Bar */}
        <div className="rounded-2xl border bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-6 flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex items-center justify-center h-14 w-14 rounded-2xl bg-primary/15 text-primary shrink-0">
            <GraduationCap className="h-7 w-7" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold tracking-tight">Your Lessons</h1>
            <p className="text-muted-foreground text-sm mt-0.5">
              {totalWords} words across {lessons.length} lesson{lessons.length !== 1 ? "s" : ""}. Pick up where you left off.
            </p>
          </div>
          <div className="flex gap-4 text-center shrink-0">
            <div className="flex flex-col items-center px-4 py-2 rounded-xl bg-background/60 border min-w-[72px]">
              <span className="text-2xl font-bold text-primary">{lessons.length}</span>
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">Lessons</span>
            </div>
            <div className="flex flex-col items-center px-4 py-2 rounded-xl bg-background/60 border min-w-[72px]">
              <span className="text-2xl font-bold text-primary">{totalWords}</span>
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">Words</span>
            </div>
          </div>
        </div>

        {/* Lesson Grid */}
        {lessons.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
            <div className="h-20 w-20 rounded-2xl bg-muted/40 flex items-center justify-center">
              <Layers className="h-10 w-10 text-muted-foreground/40" />
            </div>
            <div>
              <p className="font-semibold text-lg">No lessons yet</p>
              <p className="text-muted-foreground text-sm mt-1">
                Add some words and assign them to a lesson to get started.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {lessons.map((lesson, index) => {
              const wordCount = lesson._count.words
              return (
                <Link href={`/study/lesson/${lesson.id}`} key={lesson.id} className="block group">
                  <div className="relative flex flex-col rounded-2xl border bg-card text-card-foreground shadow-sm p-5 hover:border-primary/40 hover:shadow-md transition-all duration-200 h-full overflow-hidden group-hover:-translate-y-0.5">
                    {/* Background decoration */}
                    <BookOpen className="absolute -bottom-5 -right-5 h-28 w-28 text-muted/10 group-hover:text-primary/8 transition-colors duration-500 pointer-events-none" />

                    {/* Lesson number badge */}
                    <div className="flex items-center mb-4 gap-3">
                      <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                        {index + 1}
                      </div>
                      <h3 className="font-semibold text-xl leading-snug mb-1 line-clamp-2">
                        {lesson.name}
                      </h3>
                      <ChevronRight className="h-4 w-4 ml-auto text-muted-foreground/50 group-hover:text-primary group-hover:translate-x-0.5 transition-all duration-200" />
                    </div>

                    {/* Word count */}
                    <p className="text-muted-foreground text-xs ml-1 mt-auto">
                      {wordCount} word{wordCount !== 1 ? "s" : ""}
                    </p>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </>
  )
}