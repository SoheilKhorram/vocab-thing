import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Filter, ArrowUpDown, LayoutGrid, List } from "lucide-react"

// Import Prisma and your new component
import prisma from "@/lib/prisma"
import { WordCard } from "./components/word-card"

export default async function Page() {
  // 1. Fetch the data securely on the server
  const words = await prisma.word.findMany({
    include: {
      partsOfSpeech: true,
      exampleSentences: true,
      definitions: true,
      lesson: true,
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 px-4">
        <SidebarTrigger className="-ms-1" />
        <Separator
          orientation="vertical"
          className="me-2 data-[orientation=vertical]:h-4 data-[orientation=vertical]:self-auto" // Fixed standard radix classes
        />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem className="hidden md:block">
              <BreadcrumbPage>Words</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </header>

      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="min-h-screen flex flex-col flex-1 rounded-xl bg-muted/30 md:min-h-min p-6">

          {/* Top Toolbar (Matches your screenshot) */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Button variant="secondary" size="sm" className="h-8 text-xs bg-background/50">
                <Filter className="h-3.5 w-3.5 mr-2" />
                Filter
              </Button>
              <Button variant="secondary" size="sm" className="h-8 text-xs bg-background/50">
                <ArrowUpDown className="h-3.5 w-3.5 mr-2" />
                Sort: Newest
              </Button>
            </div>

            <div className="flex items-center gap-1 bg-background/50 p-1 rounded-md border">
              <Button variant="secondary" size="icon" className="h-6 w-6 rounded-sm bg-muted shadow-sm">
                <LayoutGrid className="h-3.5 w-3.5" />
              </Button>
              <Button variant="ghost" size="icon" className="h-6 w-6 rounded-sm text-muted-foreground">
                <List className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>

          {/* Word Grid */}
          {words.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              No words found. Add some words first!
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 3xl:grid-cols-5 gap-4 auto-rows-max">
              {words.map((word) => (
                <WordCard
                  key={word.id}
                  word={{
                    ...word,
                    lessonName: word.lesson.name,
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}