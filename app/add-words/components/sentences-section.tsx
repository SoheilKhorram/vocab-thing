import { Input } from "@/components/ui/input"
import { Field, FieldLabel } from "@/components/ui/field"
import { Button } from "@/components/ui/button"
import { Minus, Plus } from "lucide-react"
import { useSentence } from "../hooks/use-sentence"

interface SentencesSectionProps {
  title: string
  sentences: ReturnType<typeof useSentence>
}

export function SentencesSection({ title, sentences }: SentencesSectionProps) {
  return (
    <Field>
      <div className="flex items-center justify-between mb-2">
        <FieldLabel>{title}</FieldLabel>
        <Button type="button" variant="text" onClick={sentences.add}>
          <Plus className="h-4 w-4" />Add
        </Button>
      </div>
      <div className="flex flex-col gap-3">
        {sentences.items.map((item, index) => (
          <div key={index} className="flex items-center">
            <span className="text-sm text-muted-foreground min-w-6">
              {(index + 1).toLocaleString('en-US', { minimumIntegerDigits: 2, useGrouping: false })}
            </span>
            <Input
              value={item}
              onChange={(e) => sentences.update(index, e.target.value)}
              className="w-full"
            />
            {sentences.items.length > 1 && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="text-destructive hover:bg-destructive/10 hover:text-destructive ml-1"
                onClick={() => sentences.remove(index)}
              >
                <Minus />
              </Button>
            )}
          </div>
        ))}
      </div>
    </Field>
  )
}