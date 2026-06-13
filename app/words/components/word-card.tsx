'use client'

import { deleteWordAction, updateWordAction } from "@/app/actions/word-actions"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DialogHeader,
  DialogDescription,
  DialogTitle,
  DialogContent,
  DialogTrigger,
  Dialog,
  DialogClose,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { SentencesSection } from "@/app/add-words/components/sentences-section"
import { useSentence } from "@/app/add-words/hooks/use-sentence"
import { LessonCombobox } from "@/app/add-words/components/lesson-combobox"
import {
  Loader2,
  Pencil,
  Trash2,
  CheckCircle2,
  AlertCircle,
  X,
  BookOpen,
  Sparkles,
} from "lucide-react"
import { useState, useEffect, useTransition } from "react"
import { useRouter } from "next/navigation"

type WordProps = {
  id: number
  englishTerm: string
  persianTranslations: string[]
  partsOfSpeech: { label: string; value: string }[]
  exampleSentences: { content: string }[]
  definitions: { content: string }[]
  lessonId: string
  lessonName: string
  createdAt: Date
}

const PARTS_OF_SPEECH: { value: string; label: string }[] = [
  { value: "verb", label: "v" },
  { value: "noun", label: "n" },
  { value: "adjective", label: "adj" },
  { value: "adverb", label: "adv" },
  { value: "pronoun", label: "pron" },
  { value: "preposition", label: "prep" },
  { value: "conjunction", label: "conj" },
  { value: "interjection", label: "inter" },
]

const getBadgeStyles = (value: string, isActive: boolean) => {
  if (!isActive)
    return "bg-background text-muted-foreground border border-border/85 hover:bg-muted/40 transition-all select-none"
  switch (value) {
    case "verb":
      return "bg-emerald-500 text-white dark:bg-emerald-600 border border-emerald-500 dark:border-emerald-600 select-none shadow-xs font-semibold"
    case "noun":
      return "bg-sky-500 text-white dark:bg-sky-600 border border-sky-500 dark:border-sky-600 select-none shadow-xs font-semibold"
    case "adjective":
      return "bg-purple-500 text-white dark:bg-purple-600 border border-purple-500 dark:border-purple-600 select-none shadow-xs font-semibold"
    case "adverb":
      return "bg-amber-500 text-white dark:bg-amber-600 border border-amber-500 dark:border-amber-600 select-none shadow-xs font-semibold"
    default:
      return "bg-primary text-primary-foreground border border-primary select-none shadow-xs font-semibold"
  }
}

export function WordCard({ word }: { word: WordProps }) {
  const router = useRouter()
  const [isDeleting, startTransition] = useTransition()
  const [isSaving, startSaveTransition] = useTransition()

  const [open, setOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [englishTerm, setEnglishTerm] = useState(word.englishTerm)
  const [persianTranslation, setPersianTranslation] = useState(
    word.persianTranslations.join(" - ")
  )
  const [selectedParts, setSelectedParts] = useState<Set<string>>(
    new Set(word.partsOfSpeech.map((p) => p.value))
  )
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(
    word.lessonId
  )
  const [toasts, setToasts] = useState<
    { id: string; message: string; type: "success" | "error" }[]
  >([])

  const editSentences = useSentence(word.exampleSentences.map((s) => s.content))
  const editDefinitions = useSentence(word.definitions.map((d) => d.content))

  const showToast = (message: string, type: "success" | "error" = "success") => {
    const id = Math.random().toString(36).substring(2, 9)
    setToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 4000)
  }

  // Reset form state when dialog opens
  useEffect(() => {
    if (open) {
      setEnglishTerm(word.englishTerm)
      setPersianTranslation(word.persianTranslations.join(" - "))
      setSelectedParts(new Set(word.partsOfSpeech.map((p) => p.value)))
      setSelectedLessonId(word.lessonId)
      editSentences.reset(word.exampleSentences.map((s) => s.content))
      editDefinitions.reset(word.definitions.map((d) => d.content))
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

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteWordAction(word.id)
      if (!result.success) {
        showToast(result.error || "Failed to delete word", "error")
      } else {
        showToast("Word deleted successfully!")
        setDeleteDialogOpen(false)
        router.refresh()
      }
    })
  }

  const handleSave = () => {
    if (!englishTerm.trim()) {
      showToast("English term is required.", "error")
      return
    }
    if (!selectedLessonId) {
      showToast("Lesson selection is required.", "error")
      return
    }

    startSaveTransition(async () => {
      const result = await updateWordAction({
        id: word.id,
        englishTerm: englishTerm.trim(),
        persianTranslation: persianTranslation.trim(),
        selectedParts: Array.from(selectedParts),
        exampleSentences: editSentences.items,
        definitions: editDefinitions.items,
        lessonId: selectedLessonId,
      })
      if (!result.success) {
        showToast(result.error || "Failed to save changes", "error")
      } else {
        showToast("Word updated successfully!")
        setOpen(false)
        router.refresh()
      }
    })
  }

  // Keyboard shortcut Ctrl+Enter / Cmd+Enter to save inside dialog
  useEffect(() => {
    if (!open) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault()
        handleSave()
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [open, englishTerm, persianTranslation, selectedParts, editSentences.items, editDefinitions.items, selectedLessonId])

  // Real-time Persian translation parser
  const translationChips = persianTranslation
    .split("-")
    .map((t) => t.trim())
    .filter((t) => t.length > 0)

  return (
    <div className="group flex flex-col rounded-xl border bg-card text-card-foreground shadow-xs p-5 hover:border-border/80 hover:shadow-md transition-all relative overflow-hidden">
      <div className="absolute top-0 right-0 w-24 h-24 bg-primary/2 rounded-full blur-xl pointer-events-none" />

      {/* Toast Overlay */}
      <div className="fixed bottom-4 right-4 z-55 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center justify-between gap-3 p-4 rounded-xl border shadow-lg transition-all duration-300 translate-y-0 animate-in fade-in slide-in-from-bottom-5 ${toast.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/90 dark:border-emerald-900/50 dark:text-emerald-100"
              : "bg-destructive/10 border-destructive/20 text-destructive dark:bg-destructive/20 dark:border-destructive/30"
              }`}
          >
            <div className="flex items-center gap-2.5">
              {toast.type === "success" ? (
                <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              ) : (
                <AlertCircle className="h-5 w-5 text-destructive shrink-0" />
              )}
              <span className="text-sm font-semibold leading-none">{toast.message}</span>
            </div>
            <button
              onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
              className="text-muted-foreground/60 hover:text-foreground transition-colors p-0.5 rounded-md hover:bg-muted/10 shrink-0"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Top Row: Word & Part of Speech */}
      <div className="mb-auto">
        <div className="flex items-center flex-wrap gap-2 mb-1.5">
          <h3 className="text-3xl font-semibold tracking-tight text-foreground break-all font-heading">
            {word.englishTerm}
          </h3>
          <div className="flex flex-wrap gap-1">
            {word.partsOfSpeech.map((pos) => (
              <Badge
                key={pos.value}
                variant="ghost"
                className={`font-semibold px-2 py-0.5 rounded-full text-[10px] select-none ${getBadgeStyles(pos.value, true)}`}
              >
                {pos.label}
              </Badge>
            ))}
          </div>
        </div>

        {/* Persian Translations */}
        <div className="flex gap-1.5 justify-end mb-4 flex-wrap mt-3">
          {word.persianTranslations?.map((pt, idx) => (
            <Badge
              key={idx}
              variant="outline"
              className="py-1 px-3 bg-background/50 text-foreground border-border/80 shadow-xs font-medium text-xs"
            >
              {pt}
            </Badge>
          ))}
        </div>
      </div>

      <Separator className="self-end mt-2" />

      {/* Bottom Footer: Lesson & Controls */}
      <div className="flex mt-4 items-center justify-between gap-2">
        {/* Lesson badge */}
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground/70 select-none min-w-0">
          <BookOpen className="h-3 w-3 shrink-0" />
          <span className="truncate font-medium">{word.lessonName}</span>
        </div>

        <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity ml-auto shrink-0">
          {/* ── Edit Dialog ── */}
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-muted-foreground hover:bg-muted rounded-md transition-colors"
              >
                <Pencil className="h-3.5 w-3.5" />
              </Button>
            </DialogTrigger>

            <DialogContent showCloseButton={false} className="block p-0 gap-0 overflow-hidden rounded-2xl bg-card text-card-foreground shadow-2xl sm:max-w-5xl w-full max-h-[90vh]">
              {/* Dialog inner layout: form | preview */}
              <div className="flex flex-row" style={{maxHeight: '90vh'}}>

                {/* ── Left: Form ── */}
                <form
                  onSubmit={(e) => { e.preventDefault(); handleSave() }}
                  className="flex-1 min-w-0 flex flex-col overflow-y-auto max-h-[90vh]"
                >
                  {/* Form header */}
                  <div className="px-6 pt-6 pb-4 border-b bg-muted/20">
                    <DialogTitle className="text-lg font-bold tracking-tight text-foreground flex items-center gap-2 mb-0.5">
                      <Pencil className="h-4 w-4 text-primary" />
                      Edit Word
                    </DialogTitle>
                    <DialogDescription className="text-xs text-muted-foreground">
                      Update the word details, translations, lesson, and examples.
                    </DialogDescription>
                  </div>

                  {/* Form body */}
                  <div className="flex flex-col gap-5 px-6 py-5 flex-1">

                    {/* English + Persian */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <Label htmlFor="edit-english" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          English Term <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id="edit-english"
                          value={englishTerm}
                          onChange={(e) => setEnglishTerm(e.target.value)}
                          className="bg-background/60 hover:bg-background focus:bg-background transition-all font-medium"
                          placeholder="e.g. ephemeral"
                          required
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <Label htmlFor="edit-persian" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          Persian Translation
                        </Label>
                        <Input
                          id="edit-persian"
                          value={persianTranslation}
                          onChange={(e) => setPersianTranslation(e.target.value)}
                          className="bg-background/60 hover:bg-background focus:bg-background transition-all text-right"
                          dir="rtl"
                          placeholder="e.g. زودگذر - فانی"
                        />
                        {translationChips.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-0.5">
                            {translationChips.map((chip, idx) => (
                              <span
                                key={idx}
                                className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900/50 select-none"
                              >
                                {chip}
                              </span>
                            ))}
                          </div>
                        )}
                        <p className="text-[10.5px] text-muted-foreground leading-none">
                          Separate meanings with &quot; - &quot;
                        </p>
                      </div>
                    </div>

                    {/* Lesson + Parts of Speech */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
                      <div className="flex flex-col gap-1.5">
                        <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          Lesson <span className="text-destructive">*</span>
                        </Label>
                        <LessonCombobox
                          value={selectedLessonId}
                          onValueChange={setSelectedLessonId}
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          Parts of Speech
                        </Label>
                        <div className="flex flex-wrap gap-1.5">
                          {PARTS_OF_SPEECH.map((pos) => (
                            <Badge
                              key={pos.value}
                              onClick={() => togglePartOfSpeech(pos.value)}
                              className={`cursor-pointer text-xs px-2.5 py-1 font-medium transition-all ${getBadgeStyles(
                                pos.value,
                                selectedParts.has(pos.value)
                              )}`}
                            >
                              {pos.label}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* Sentences + Definitions */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <SentencesSection
                        title="Example Sentences"
                        sentences={editSentences}
                        placeholder="e.g. An example sentence..."
                      />
                      <SentencesSection
                        title="Definitions"
                        sentences={editDefinitions}
                        placeholder="e.g. A clear definition..."
                      />
                    </div>
                  </div>

                  {/* Form footer */}
                  <div className="flex items-center justify-between px-6 py-4 border-t bg-muted/10 shrink-0">
                    <span className="text-xs text-muted-foreground flex items-center gap-1.5 select-none">
                      <span className="font-semibold border rounded-sm px-1 py-0.5 bg-muted text-[10px]">Ctrl</span>
                      <span>+</span>
                      <span className="font-semibold border rounded-sm px-1 py-0.5 bg-muted text-[10px]">Enter</span>
                      <span>to save</span>
                    </span>
                    <div className="flex gap-2">
                      <DialogClose asChild>
                        <Button variant="ghost" type="button" size="sm">
                          Cancel
                        </Button>
                      </DialogClose>
                      <Button type="submit" size="sm" disabled={isSaving} className="shadow-xs min-w-[100px]">
                        {isSaving && <Loader2 className="h-3 w-3 animate-spin mr-1.5" />}
                        {isSaving ? "Saving…" : "Save Changes"}
                      </Button>
                    </div>
                  </div>
                </form>

                {/* ── Right: Live Preview ── */}
                <div className="w-72 shrink-0 border-l bg-muted/10 flex flex-col p-5 gap-5 overflow-y-auto max-h-[90vh]">
                  {/* Header */}
                  <div className="flex items-center gap-2 select-none">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80">
                      Live Preview
                    </span>
                  </div>

                  {/* Mini card preview */}
                  <div className="rounded-xl border bg-card shadow-xs p-4 relative overflow-hidden flex flex-col gap-3">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-primary/5 rounded-full blur-xl pointer-events-none" />

                    {/* Word + badges */}
                    <div className="flex items-baseline flex-wrap gap-1.5">
                      <h3 className="text-xl font-bold tracking-tight text-foreground break-all leading-tight">
                        {englishTerm.trim() || (
                          <span className="text-muted-foreground/30 italic font-normal text-base">
                            Untitled
                          </span>
                        )}
                      </h3>
                      {selectedParts.size > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {Array.from(selectedParts).map((part) => (
                            <Badge
                              key={part}
                              variant="ghost"
                              className={`font-semibold px-1.5 py-0.5 rounded-full text-[10px] select-none ${getBadgeStyles(part, true)}`}
                            >
                              {PARTS_OF_SPEECH.find((p) => p.value === part)?.label}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Persian translations */}
                    <div className="flex gap-1.5 flex-wrap justify-end">
                      {translationChips.length > 0 ? (
                        translationChips.map((pt, idx) => (
                          <Badge
                            key={idx}
                            variant="outline"
                            className="py-0.5 px-2.5 bg-background/50 text-foreground border-border/80 text-xs shadow-xs font-medium"
                          >
                            {pt}
                          </Badge>
                        ))
                      ) : (
                        <Badge
                          variant="outline"
                          className="py-0.5 px-2.5 bg-background/20 text-muted-foreground/30 border-dashed border-muted text-xs"
                        >
                          translation
                        </Badge>
                      )}
                    </div>

                    <Separator />

                    {/* Footer: lesson */}
                    <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground/60">
                      <BookOpen className="h-3 w-3 shrink-0" />
                      <span className="truncate italic">lesson preview</span>
                    </div>
                  </div>

                  {/* Tip */}
                  <div className="mt-auto p-3 rounded-lg border border-dashed text-xs text-muted-foreground/70 flex items-start gap-2 select-none">
                    <Sparkles className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                    <span>Edits reflect instantly. Save to update the card in your word list.</span>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* ── Delete Dialog ── */}
          <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                disabled={isDeleting}
                size="icon"
                className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-all"
              >
                {isDeleting ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Trash2 className="h-3.5 w-3.5" />
                )}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-sm">
              <DialogHeader>
                <DialogTitle>Delete word</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete &quot;{word.englishTerm}&quot;? This action
                  cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="mt-2">
                <DialogClose asChild>
                  <Button variant="ghost" size="sm">
                    Cancel
                  </Button>
                </DialogClose>
                <Button
                  onClick={handleDelete}
                  variant="destructive"
                  size="sm"
                  type="button"
                >
                  {isDeleting && <Loader2 className="h-3 w-3 animate-spin mr-2" />}
                  {isDeleting ? "Deleting…" : "Delete"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  )
}