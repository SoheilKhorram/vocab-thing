'use client'

import { deleteWordAction } from "@/app/actions/word-actions"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DialogHeader, DialogDescription, DialogTitle, DialogContent, DialogTrigger, Dialog, DialogClose, DialogFooter } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { History, Loader2, Minus, Pencil, Plus, Trash2 } from "lucide-react"
import { useTransition } from "react"

// Define the shape of the data we expect based on your Prisma schema
type WordProps = {
  id: number
  englishTerm: string
  persianTranslations: string[]
  partsOfSpeech: { label: string; value: string }[]
  createdAt: Date
}

export function WordCard({ word }: { word: WordProps }) {
  const [isDeleting, startTransition] = useTransition()

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteWordAction(word.id)
      if (!result.success) {
        alert(result.error)
      }
    })
  }

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
        <div className="flex gap-1">
          hi
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-50 transition-opacity ml-auto">
          <Button
            variant="ghost"
            size="icon"
            className="h-6.5 w-6.5 text-muted-foreground hover:opacity-100 rounded-md"
          >
            <Pencil className="h-3 w-3" />
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                disabled={isDeleting}
                size="icon"
                className="h-6.5 w-6.5 text-muted-foreground hover:text-destructive hover:opacity-100  rounded-md"
              >
                {isDeleting ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (<Trash2 className="h-3 w-3" />)}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-sm">
              <DialogHeader>
                <DialogTitle>Delete word</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete the word?
                </DialogDescription>
              </DialogHeader>

              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="ghost">Cancel</Button>
                </DialogClose>
                <Button onClick={handleDelete} variant="destructive" type="submit">
                  {isDeleting && <Loader2 className="h-3 w-3 animate-spin" />}
                  {isDeleting ? "Deleting..." : "Delete"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div >
    </div >
  )
}