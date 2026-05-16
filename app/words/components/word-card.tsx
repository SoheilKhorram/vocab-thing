'use client'

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { History, Minus, Pencil, Plus, Trash2 } from "lucide-react"
import { useState } from "react"

// Define the shape of the data we expect based on your Prisma schema
type WordProps = {
  id: number
  englishTerm: string
  persianTranslations: string[]
  partsOfSpeech: { label: string; value: string }[]
  createdAt: Date
}

export function WordCard({ word }: { word: WordProps }) {
  // Local state for the counter (you can later wire this up to a Server Action to save to DB)
  const [score, setScore] = useState(0)

  // Grab the primary translation
  // const mainTranslation = word.persianTranslations.join(" / ")

  return (
    <div className="group flex flex-col rounded-xl border bg-card text-card-foreground shadow-sm p-5 hover:border-border/80 transition-colors">
      {/* Top Row: Word & Part of Speech */}
      <div className="mb-auto">
        <div className="flex items-center gap-1 mb-1">
          <h3 className="text-3xl font-semibold tracking-tight text-foreground">
            {word.englishTerm}
          </h3>
          {!!word.partsOfSpeech.length && <Badge variant="ghost" className="font-normal px-2.5 py-0.5 rounded-full text-muted-foreground bg-secondary/40">
            {word.partsOfSpeech.map(pos => pos.label).join(' / ')}
          </Badge>}
        </div>

        {/* Middle: Translation Badge */}
        <div className="flex gap-0.5 justify-end mb-4">
          {word.persianTranslations?.map((pt, idx) =>
            <Badge key={idx} variant="outline" className="py-3 px-3 bg-background/50">
              {pt}
            </Badge>
          )}
        </div>
      </div>


      <Separator className="self-end" />
      {/* Bottom Footer: Review Status & Controls */}
      <div className="flex mt-4 items-center justify-between">
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-50 transition-opacity ml-auto">
          <Button
            variant="ghost"
            size="icon"
            className="h-6.5 w-6.5 text-muted-foreground hover:opacity-100 rounded-md"
          >
            <Pencil className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6.5 w-6.5 text-muted-foreground hover:text-destructive hover:opacity-100  rounded-md"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
  )
}