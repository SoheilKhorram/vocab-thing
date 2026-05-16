'use client'

import { Input } from "@/components/ui/input"
import Header from "./components/header"
import { Field, FieldDescription, FieldGroup, FieldLabel, FieldSet } from "@/components/ui/field"
import { Badge } from "@/components/ui/badge"
import { useState, useTransition } from "react"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Minus, Plus, Save, Loader2 } from "lucide-react"

// Import our server action
import { createWordAction } from "@/app/actions/word-actions"

type PartOfSpeechType = "noun" | "verb" | "adjective" | "adverb" | "pronoun" | "preposition" | "conjunction" | "interjection"

const PARTS_OF_SPEECH: { value: PartOfSpeechType; label: string }[] = [
  { value: "verb", label: "v" },
  { value: "noun", label: "n" },
  { value: "adjective", label: "adj" },
  { value: "adverb", label: "adv" },
  { value: "pronoun", label: "pron" },
  { value: "preposition", label: "prep" },
  { value: "conjunction", label: "conj" },
  { value: "interjection", label: "inter" },
]

const AddWordsPage = () => {
  const [selectedParts, setSelectedParts] = useState<Set<PartOfSpeechType>>(new Set())
  const [exampleSentences, setExampleSentences] = useState<string[]>([""])
  const [definitions, setDefinitions] = useState<string[]>([""])

  // useTransition gives us a loading state while the server action runs
  const [isPending, startTransition] = useTransition()

  const togglePartOfSpeech = (part: PartOfSpeechType) => {
    setSelectedParts((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(part)) newSet.delete(part)
      else newSet.add(part)
      return newSet
    })
  }

  const handleAddSentence = () => setExampleSentences([...exampleSentences, ""])
  const handleSentenceChange = (index: number, value: string) => {
    const newSentences = [...exampleSentences]
    newSentences[index] = value
    setExampleSentences(newSentences)
  }
  const handleRemoveSentence = (index: number) => {
    setExampleSentences(exampleSentences.filter((_, i) => i !== index))
  }

  const handleAddDefinition = () => setDefinitions([...definitions, ""])
  const handleDefinitionChange = (index: number, value: string) => {
    const newDefinition = [...definitions]
    newDefinition[index] = value
    setDefinitions(newDefinition)
  }
  const handleRemoveDefinition = (index: number) => {
    setDefinitions(definitions.filter((_, i) => i !== index))
  }

  // The modern Action handler
  const clientAction = (formData: FormData) => {
    startTransition(async () => {
      const payload = {
        englishTerm: formData.get("english-term") as string,
        persianTranslation: formData.get("persian-translation") as string,
        selectedParts: Array.from(selectedParts),
        exampleSentences,
        definitions,
      }

      // Call the Server Action directly
      const result = await createWordAction(payload)

      if (result.success) {
        alert('Word saved successfully!')
        // Optional: Reset form state here
      } else {
        alert('Failed to save word: ' + result.error)
      }
    })
  }

  return (
    <>
      <Header />
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        {/* Wire up the form action here */}
        <form action={clientAction} className="min-h-screen flex flex-col flex-1 rounded-xl bg-muted/50 md:min-h-min p-4">
          <FieldGroup className="min-h-min">
            <FieldSet>
              <div className="grid grid-cols-2 gap-4">
                <Field>
                  <FieldLabel htmlFor="english-term">English Term</FieldLabel>
                  <Input
                    name="english-term" // Added name attribute for FormData
                    id="english-term"
                    required
                  />
                  <FieldDescription className="flex flex-wrap gap-1">
                    {PARTS_OF_SPEECH.map((pos) => {
                      const isSelected = selectedParts.has(pos.value)
                      return (
                        <Badge
                          key={pos.value}
                          onClick={() => togglePartOfSpeech(pos.value)}
                          variant={isSelected ? "default" : "secondary"}
                          className="cursor-pointer hover:opacity-90 transition-all select-none"
                        >
                          {pos.label}
                        </Badge>
                      )
                    })}
                  </FieldDescription>
                </Field>
                <Field>
                  <FieldLabel htmlFor="persian-translation">Persian Translation</FieldLabel>
                  <Input
                    name="persian-translation" // Added name attribute for FormData
                    id="persian-translation"
                    required
                  />
                  <FieldDescription>
                    separate different meaning by &quot; - &quot;
                  </FieldDescription>
                </Field>
              </div>
              <Separator />
              <div className="grid grid-cols-2 gap-4">
                <Field>
                  <div className="flex items-center justify-between mb-2">
                    <FieldLabel>Example Sentences</FieldLabel>
                    <Button type="button" variant="text" onClick={handleAddSentence}>
                      <Plus className="h-4 w-4" />
                      Add Sentence
                    </Button>
                  </div>
                  <div className="flex flex-col gap-3">
                    {exampleSentences.map((sentence, index) => (
                      <div key={index} className="flex items-center">
                        <span className="text-sm text-muted-foreground min-w-6">
                          {(index + 1).toLocaleString('en-US', { minimumIntegerDigits: 2, useGrouping: false })}
                        </span>
                        <Input
                          value={sentence}
                          onChange={(e) => handleSentenceChange(index, e.target.value)}
                          className="w-full"
                        />
                        {exampleSentences.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:bg-destructive/10 hover:text-destructive ml-1"
                            onClick={() => handleRemoveSentence(index)}
                          >
                            <Minus />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </Field>
                <Field>
                  <div className="flex items-center justify-between mb-2">
                    <FieldLabel>Definitions</FieldLabel>
                    <Button type="button" variant="text" onClick={handleAddDefinition}>
                      <Plus className="h-4 w-4" />
                      Add Definition
                    </Button>
                  </div>
                  <div className="flex flex-col gap-3">
                    {definitions.map((sentence, index) => (
                      <div key={index} className="flex items-center">
                        <span className="text-sm text-muted-foreground min-w-6">
                          {(index + 1).toLocaleString('en-US', { minimumIntegerDigits: 2, useGrouping: false })}
                        </span>
                        <Input
                          value={sentence}
                          onChange={(e) => handleDefinitionChange(index, e.target.value)}
                          className="w-full"
                        />
                        {definitions.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:bg-destructive/10 hover:text-destructive ml-1"
                            onClick={() => handleRemoveDefinition(index)}
                          >
                            <Minus />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </Field>
              </div>
            </FieldSet>
          </FieldGroup>
          <Field orientation='horizontal' className="mt-auto justify-end">
            <Button type="submit" disabled={isPending}>
              {isPending ? <Loader2 className="animate-spin" /> : <Save />}
              {isPending ? "Saving..." : "Save"}
            </Button>
          </Field>
        </form>
      </div>
    </>
  )
}

export default AddWordsPage