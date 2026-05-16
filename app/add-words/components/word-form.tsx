'use client'

import { useState, useTransition, useRef } from "react"
import { Input } from "@/components/ui/input"
import { Field, FieldDescription, FieldGroup, FieldLabel, FieldSet } from "@/components/ui/field"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Save, Loader2 } from "lucide-react"

import { createWordAction } from "@/app/actions/word-actions"
import { useSentence } from "../hooks/use-sentence"
import { SentencesSection } from './sentences-section'

type PartOfSpeechType = "noun" | "verb" | "adjective" | "adverb" | "pronoun" | "preposition" | "conjunction" | "interjection"

const PARTS_OF_SPEECH: { value: PartOfSpeechType; label: string }[] = [
  { value: "verb", label: "v" }, { value: "noun", label: "n" },
  { value: "adjective", label: "adj" }, { value: "adverb", label: "adv" },
  { value: "pronoun", label: "pron" }, { value: "preposition", label: "prep" },
  { value: "conjunction", label: "conj" }, { value: "interjection", label: "inter" },
]

export function WordForm() {
  const formRef = useRef<HTMLFormElement>(null)
  const [isPending, startTransition] = useTransition()

  const [selectedParts, setSelectedParts] = useState<Set<PartOfSpeechType>>(new Set())
  const sentences = useSentence()
  const definitions = useSentence()

  const togglePartOfSpeech = (part: PartOfSpeechType) => {
    setSelectedParts((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(part)) newSet.delete(part)
      else newSet.add(part)
      return newSet
    })
  }

  const clientAction = (formData: FormData) => {
    startTransition(async () => {
      const payload = {
        englishTerm: formData.get("english-term") as string,
        persianTranslation: formData.get("persian-translation") as string,
        selectedParts: Array.from(selectedParts),
        exampleSentences: sentences.items,
        definitions: definitions.items,
      }

      const result = await createWordAction(payload)

      if (result.success) {
        alert('Word saved successfully!')
        formRef.current?.reset()
        setSelectedParts(new Set())
        sentences.reset()
        definitions.reset()
      } else {
        alert('Failed to save word: ' + result.error)
      }
    })
  }

  return (
    <form ref={formRef} action={clientAction} className="min-h-screen flex flex-col flex-1 rounded-xl bg-muted/50 md:min-h-min p-4">
      <FieldGroup className="min-h-min">
        <FieldSet>
          <div className="grid grid-cols-2 gap-4">
            <Field>
              <FieldLabel htmlFor="english-term">English Term</FieldLabel>
              <Input name="english-term" id="english-term" required />
              <FieldDescription className="flex flex-wrap gap-1">
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
              </FieldDescription>
            </Field>

            <Field>
              <FieldLabel htmlFor="persian-translation">Persian Translation</FieldLabel>
              <Input name="persian-translation" id="persian-translation" />
              <FieldDescription>Separate different meanings by &quot; - &quot;</FieldDescription>
            </Field>
          </div>

          <Separator />

          <div className="grid grid-cols-2 gap-4">
            <SentencesSection title="Example Sentences" sentences={sentences} />
            <SentencesSection title="Definitions" sentences={definitions} />
          </div>
        </FieldSet>
      </FieldGroup>

      <Field orientation='horizontal' className="mt-auto justify-end">
        <Button type="submit" size="lg" disabled={isPending}>
          {isPending ? <Loader2 className="animate-spin" /> : <Save />}
          {isPending ? "Adding..." : "Add"}
        </Button>
      </Field>
    </form>
  )
}