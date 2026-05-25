'use client'

import { deleteWordAction, updateWordAction } from "@/app/actions/word-actions"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DialogHeader, DialogDescription, DialogTitle, DialogContent, DialogTrigger, Dialog, DialogClose, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { SentencesSection } from "@/app/add-words/components/sentences-section"
import { useSentence } from "@/app/add-words/hooks/use-sentence"
import { History, Loader2, Minus, Pencil, Plus, Trash2 } from "lucide-react"
import { useState, useEffect, useTransition } from "react"

// Define the shape of the data we expect based on your Prisma schema
type WordProps = {
  id: number
  englishTerm: string
  persianTranslations: string[]
  partsOfSpeech: { label: string; value: string }[]
  exampleSentences: { content: string }[]
  definitions: { content: string }[]
  createdAt: Date
}

const PARTS_OF_SPEECH: { value: string; label: string }[] = [
  { value: "verb", label: "v" }, { value: "noun", label: "n" },
  { value: "adjective", label: "adj" }, { value: "adverb", label: "adv" },
  { value: "pronoun", label: "pron" }, { value: "preposition", label: "prep" },
  { value: "conjunction", label: "conj" }, { value: "interjection", label: "inter" },
]

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

  const [isSaving, startSaveTransition] = useTransition()
  const [open, setOpen] = useState(false)
  const [englishTerm, setEnglishTerm] = useState(word.englishTerm)
  const [persianTranslation, setPersianTranslation] = useState(word.persianTranslations.join(" - "))
  const [selectedParts, setSelectedParts] = useState<Set<string>>(new Set(word.partsOfSpeech.map(p => p.value)))
  const editSentences = useSentence(word.exampleSentences.map(s => s.content))
  const editDefinitions = useSentence(word.definitions.map(d => d.content))

  useEffect(() => {
    if (open) {
      setEnglishTerm(word.englishTerm)
      setPersianTranslation(word.persianTranslations.join(" - "))
      setSelectedParts(new Set(word.partsOfSpeech.map(p => p.value)))
      editSentences.reset(word.exampleSentences.map(s => s.content))
      editDefinitions.reset(word.definitions.map(d => d.content))
    }
  }, [open])

  const togglePartOfSpeech = (part: string) => {
    setSelectedParts((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(part)) newSet.delete(part)
      else newSet.add(part)
      return newSet
    })
  }

  const handleSave = () => {
    startSaveTransition(async () => {
      const result = await updateWordAction({
        id: word.id,
        englishTerm,
        persianTranslation,
        selectedParts: Array.from(selectedParts),
        exampleSentences: editSentences.items,
        definitions: editDefinitions.items,
      })
      if (!result.success) {
        alert(result.error)
      } else {
        setOpen(false)
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
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-6.5 w-6.5 text-muted-foreground hover:opacity-100 rounded-md"
              >
                <Pencil className="h-3 w-3" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Edit word</DialogTitle>
                <DialogDescription>
                  Make changes to the word and its details.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={(e) => { e.preventDefault(); handleSave() }}>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="edit-english">English Term</Label>
                      <Input id="edit-english" value={englishTerm} onChange={(e) => setEnglishTerm(e.target.value)} />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="edit-persian">Persian Translation</Label>
                      <Input id="edit-persian" value={persianTranslation} onChange={(e) => setPersianTranslation(e.target.value)} />
                    </div>
                  </div>
                  <div>
                    <Label>Parts of Speech</Label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {PARTS_OF_SPEECH.map((pos) => (
                        <Badge
                          key={pos.value}
                          onClick={() => togglePartOfSpeech(pos.value)}
                          variant={selectedParts.has(pos.value) ? "default" : "secondary"}
                          className="cursor-pointer hover:opacity-90 transition-all select-none"
                        >
                          {pos.label}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <Separator />
                  <SentencesSection title="Example Sentences" sentences={editSentences} />
                  <SentencesSection title="Definitions" sentences={editDefinitions} />
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="ghost">Cancel</Button>
                  </DialogClose>
                  <Button type="submit" disabled={isSaving}>
                    {isSaving && <Loader2 className="h-3 w-3 animate-spin" />}
                    {isSaving ? "Saving..." : "Save"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
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