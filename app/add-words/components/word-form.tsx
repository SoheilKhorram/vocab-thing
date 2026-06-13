'use client'

import { useState, useTransition, useRef, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Field, FieldDescription, FieldGroup, FieldLabel, FieldSet } from "@/components/ui/field"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Save, Loader2, Plus, Sparkles, Trash2, CheckCircle2, AlertCircle, X } from "lucide-react"

import { createWordAction, deleteWordAction } from "@/app/actions/word-actions"
import { useSentence } from "../hooks/use-sentence"
import { SentencesSection } from './sentences-section'
import { LessonCombobox } from './lesson-combobox'

type PartOfSpeechType = "noun" | "verb" | "adjective" | "adverb" | "pronoun" | "preposition" | "conjunction" | "interjection"

const PARTS_OF_SPEECH: { value: PartOfSpeechType; label: string }[] = [
  { value: "verb", label: "v" }, { value: "noun", label: "n" },
  { value: "adjective", label: "adj" }, { value: "adverb", label: "adv" },
  { value: "pronoun", label: "pron" }, { value: "preposition", label: "prep" },
  { value: "conjunction", label: "conj" }, { value: "interjection", label: "inter" },
]

type WordProps = {
  id: number
  englishTerm: string
  persianTranslations: string[]
  partsOfSpeech: { label: string; value: string }[]
  exampleSentences: { content: string }[]
  definitions: { content: string }[]
  createdAt: Date
}

interface WordFormProps {
  initialRecentWords?: any[]
}

export function WordForm({ initialRecentWords = [] }: WordFormProps) {
  const formRef = useRef<HTMLFormElement>(null)
  const [isPending, startTransition] = useTransition()

  const [englishTerm, setEnglishTerm] = useState("")
  const [persianInput, setPersianInput] = useState("")
  const [selectedParts, setSelectedParts] = useState<Set<PartOfSpeechType>>(new Set())
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null)
  const [recentWords, setRecentWords] = useState<WordProps[]>(initialRecentWords)
  const [toasts, setToasts] = useState<{ id: string; message: string; type: "success" | "error" }[]>([])

  const sentences = useSentence()
  const definitions = useSentence()

  const showToast = (message: string, type: "success" | "error" = "success") => {
    const id = Math.random().toString(36).substring(2, 9)
    setToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 4000)
  }

  const togglePartOfSpeech = (part: PartOfSpeechType) => {
    setSelectedParts((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(part)) newSet.delete(part)
      else newSet.add(part)
      return newSet
    })
  }

  // Keyboard shortcut Ctrl+Enter or Cmd+Enter to submit
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault()
        if (formRef.current) {
          formRef.current.requestSubmit()
        }
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  const clientAction = (formData: FormData) => {
    if (!selectedLessonId) {
      showToast('Please select or create a lesson first.', 'error')
      return
    }

    if (!englishTerm.trim()) {
      showToast('English term is required.', 'error')
      return
    }

    startTransition(async () => {
      const payload = {
        englishTerm: englishTerm.trim(),
        persianTranslation: persianInput.trim(),
        selectedParts: Array.from(selectedParts),
        exampleSentences: sentences.items,
        definitions: definitions.items,
        lessonId: selectedLessonId,
      }

      const result = await createWordAction(payload)

      if (result.success && result.word) {
        showToast('Word saved successfully!')
        formRef.current?.reset()
        setEnglishTerm("")
        setPersianInput("")
        setSelectedParts(new Set())
        sentences.reset()
        definitions.reset()
        setRecentWords((prev) => [result.word as unknown as WordProps, ...prev].slice(0, 5))
      } else {
        showToast('Failed to save word: ' + (result.error || 'Unknown error'), 'error')
      }
    })
  }

  const handleDeleteRecent = async (id: number) => {
    const result = await deleteWordAction(id)
    if (result.success) {
      setRecentWords((prev) => prev.filter((w) => w.id !== id))
      showToast('Word deleted successfully!')
    } else {
      showToast(result.error || 'Failed to delete word', 'error')
    }
  }

  // Real-time parsed Persian translations
  const translationChips = persianInput
    .split('-')
    .map((t) => t.trim())
    .filter((t) => t.length > 0)

  const getBadgeStyles = (value: PartOfSpeechType, isActive: boolean) => {
    if (!isActive) return "bg-background text-muted-foreground border border-border/85 hover:bg-muted/40 transition-all select-none"
    switch (value) {
      case "verb":
        return "bg-emerald-500 text-white dark:bg-emerald-600 border border-emerald-500 dark:border-emerald-600 select-none shadow-xs"
      case "noun":
        return "bg-sky-500 text-white dark:bg-sky-600 border border-sky-500 dark:border-sky-600 select-none shadow-xs"
      case "adjective":
        return "bg-purple-500 text-white dark:bg-purple-600 border border-purple-500 dark:border-purple-600 select-none shadow-xs"
      case "adverb":
        return "bg-amber-500 text-white dark:bg-amber-600 border border-amber-500 dark:border-amber-600 select-none shadow-xs"
      default:
        return "bg-primary text-primary-foreground border border-primary select-none shadow-xs"
    }
  }

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Toast Overlay */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center justify-between gap-3 p-4 rounded-xl border shadow-lg transition-all duration-300 translate-y-0 animate-in fade-in slide-in-from-bottom-5 ${
              toast.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/90 dark:border-emerald-900/50 dark:text-emerald-100'
                : 'bg-destructive/10 border-destructive/20 text-destructive dark:bg-destructive/20 dark:border-destructive/30'
            }`}
          >
            <div className="flex items-center gap-2.5">
              {toast.type === 'success' ? (
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Form Panel */}
        <form
          ref={formRef}
          action={clientAction}
          className="lg:col-span-2 flex flex-col gap-6 rounded-xl border bg-card text-card-foreground shadow-xs p-6"
        >
          <div className="flex flex-col gap-1.5 mb-2">
            <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <Plus className="h-5 w-5 text-primary" />
              Add Vocabulary Word
            </h2>
            <p className="text-sm text-muted-foreground">
              Add a new word to your lessons. Live preview and recent edits update instantly.
            </p>
          </div>

          <FieldGroup className="flex flex-col gap-5">
            <FieldSet className="flex flex-col gap-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field>
                  <FieldLabel htmlFor="english-term" className="text-sm font-semibold">
                    English Term <span className="text-destructive">*</span>
                  </FieldLabel>
                  <Input
                    name="english-term"
                    id="english-term"
                    value={englishTerm}
                    onChange={(e) => setEnglishTerm(e.target.value)}
                    required
                    autoFocus
                    placeholder="e.g. ephemeral"
                    className="bg-background/50 hover:bg-background/80 focus:bg-background transition-all"
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor="persian-translation" className="text-sm font-semibold">
                    Persian Translation
                  </FieldLabel>
                  <Input
                    name="persian-translation"
                    id="persian-translation"
                    value={persianInput}
                    onChange={(e) => setPersianInput(e.target.value)}
                    placeholder="e.g. زودگذر - فانی - بی دوام"
                    className="bg-background/50 hover:bg-background/80 focus:bg-background transition-all text-right"
                    dir="rtl"
                  />
                  <div className="flex flex-col gap-1 mt-1">
                    <FieldDescription className="text-xs">
                      Separate meanings by &quot; - &quot; to create multiple translation chips.
                    </FieldDescription>
                    {translationChips.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {translationChips.map((chip, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900/50 select-none transition-all"
                          >
                            {chip}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </Field>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                <Field className="flex flex-col gap-2">
                  <FieldLabel className="text-sm font-semibold">Lesson</FieldLabel>
                  <LessonCombobox
                    value={selectedLessonId}
                    onValueChange={setSelectedLessonId}
                  />
                </Field>

                <Field>
                  <FieldLabel className="text-sm font-semibold">Parts of Speech</FieldLabel>
                  <div className="flex flex-wrap gap-1.5 mt-1">
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
                </Field>
              </div>

              <Separator className="my-2" />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <SentencesSection title="Example Sentences" sentences={sentences} placeholder="e.g. Life is ephemeral..." />
                <SentencesSection title="Definitions" sentences={definitions} placeholder="e.g. Lasting a very short time..." />
              </div>
            </FieldSet>
          </FieldGroup>

          <div className="mt-4 flex items-center justify-between border-t pt-4">
            <span className="text-xs text-muted-foreground flex items-center gap-1.5 select-none">
              <span className="font-semibold border rounded-sm px-1 py-0.5 bg-muted">Ctrl</span>
              <span>+</span>
              <span className="font-semibold border rounded-sm px-1 py-0.5 bg-muted">Enter</span>
              <span>to quick save</span>
            </span>

            <Button type="submit" size="lg" disabled={isPending} className="px-6 shadow-md hover:shadow-lg transition-all">
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Adding...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Add Word
                </>
              )}
            </Button>
          </div>
        </form>

        {/* Sidebar Panel */}
        <div className="flex flex-col gap-6">
          {/* Live Preview Card */}
          <div className="rounded-xl border bg-card text-card-foreground shadow-xs overflow-hidden">
            <div className="bg-muted/30 px-4 py-2 border-b flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80 flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                Live Preview
              </span>
            </div>
            <div className="p-4 bg-muted/10">
              <div className="group flex flex-col rounded-xl border bg-card text-card-foreground shadow-xs p-5 transition-all min-h-[140px] justify-between relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl pointer-events-none" />

                <div className="mb-auto">
                  <div className="flex items-baseline flex-wrap gap-2 mb-1">
                    <h3 className="text-2xl font-bold tracking-tight text-foreground break-all">
                      {englishTerm.trim() || <span className="text-muted-foreground/30 italic font-normal">Untitled Term</span>}
                    </h3>
                    {selectedParts.size > 0 && (
                      <Badge variant="ghost" className="font-normal px-2.5 py-0.5 rounded-full text-muted-foreground bg-secondary/40 select-none text-[10px]">
                        {Array.from(selectedParts)
                          .map((part) => PARTS_OF_SPEECH.find((p) => p.value === part)?.label)
                          .filter(Boolean)
                          .join(' / ')}
                      </Badge>
                    )}
                  </div>

                  <div className="flex gap-1 justify-end mt-4 mb-2 flex-wrap">
                    {translationChips.length > 0 ? (
                      translationChips.map((pt, idx) => (
                        <Badge key={idx} variant="outline" className="py-0.5 px-2.5 bg-background/50 text-foreground border-border/80 text-xs shadow-xs font-medium">
                          {pt}
                        </Badge>
                      ))
                    ) : (
                      <Badge variant="outline" className="py-0.5 px-2.5 bg-background/20 text-muted-foreground/30 border-dashed border-muted text-xs">
                        translation
                      </Badge>
                    )}
                  </div>
                </div>
                
                <Separator className="mt-4" />
                <div className="flex mt-3 items-center justify-between text-[10px] text-muted-foreground/50 italic">
                  <span>Card styling preview</span>
                  <span>new</span>
                </div>
              </div>
            </div>
          </div>

          {/* Recently Added Card */}
          <div className="rounded-xl border bg-card text-card-foreground shadow-xs">
            <div className="bg-muted/30 px-4 py-3 border-b flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground/80 flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-amber-500" />
                Recently Added
              </h3>
              <Badge variant="secondary" className="font-normal text-[10px] px-1.5 py-0">
                {recentWords.length} added
              </Badge>
            </div>
            <div className="p-4">
              {recentWords.length === 0 ? (
                <div className="text-center py-6 text-xs text-muted-foreground/60 italic">
                  No words added recently.
                </div>
              ) : (
                <div className="flex flex-col gap-3.5">
                  {recentWords.map((word) => (
                    <div
                      key={word.id}
                      className="flex items-center justify-between p-3 rounded-lg border bg-background/50 hover:bg-background/80 hover:border-border/80 transition-all group/recent-item"
                    >
                      <div className="flex flex-col gap-1 min-w-0 pr-2">
                        <div className="flex items-baseline gap-1.5 flex-wrap">
                          <span className="font-semibold text-sm text-foreground truncate max-w-[130px]" title={word.englishTerm}>
                            {word.englishTerm}
                          </span>
                          {word.partsOfSpeech && word.partsOfSpeech.length > 0 && (
                            <span className="text-[9px] text-muted-foreground bg-muted/60 px-1 py-0.2 rounded font-mono">
                              {word.partsOfSpeech.map(p => p.label).join(', ')}
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {word.persianTranslations && word.persianTranslations.slice(0, 3).map((t, idx) => (
                            <span
                              key={idx}
                              className="text-[10px] text-muted-foreground bg-background border border-border/60 px-1.5 py-0.1 rounded font-medium"
                            >
                              {t}
                            </span>
                          ))}
                          {word.persianTranslations && word.persianTranslations.length > 3 && (
                            <span className="text-[10px] text-muted-foreground/50 px-0.5">
                              +{word.persianTranslations.length - 3}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground/40 hover:text-destructive hover:bg-destructive/10 rounded-md transition-opacity opacity-0 group-hover/recent-item:opacity-100 shrink-0"
                        onClick={() => handleDeleteRecent(word.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}