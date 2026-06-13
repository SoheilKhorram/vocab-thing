import prisma from "@/lib/prisma"
import Header from "./components/header"
import { WordForm } from "./components/word-form"

export default async function AddWordsPage() {
  const recentWords = await prisma.word.findMany({
    take: 5,
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      partsOfSpeech: true,
      exampleSentences: true,
      definitions: true,
    },
  })

  return (
    <>
      <Header />
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <WordForm initialRecentWords={recentWords} />
      </div>
    </>
  )
}