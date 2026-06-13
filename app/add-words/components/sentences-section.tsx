import { useEffect, useRef } from "react"
import { Input } from "@/components/ui/input"
import { Field, FieldLabel } from "@/components/ui/field"
import { Button } from "@/components/ui/button"
import { Minus, Plus } from "lucide-react"
import { useSentence } from "../hooks/use-sentence"

interface SentencesSectionProps {
  title: string
  sentences: ReturnType<typeof useSentence>
  placeholder?: string
}

export function SentencesSection({ title, sentences, placeholder }: SentencesSectionProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const prevLengthRef = useRef(sentences.items.length)

  useEffect(() => {
    if (sentences.items.length > prevLengthRef.current) {
      const inputs = containerRef.current?.querySelectorAll('input')
      if (inputs && inputs.length > 0) {
        const lastInput = inputs[inputs.length - 1] as HTMLInputElement
        lastInput.focus()
      }
    }
    prevLengthRef.current = sentences.items.length
  }, [sentences.items.length])

  return (
    <Field className="flex-1 bg-background/30 p-4 rounded-xl border border-border/50 shadow-xs">
      <div className="flex items-center justify-between mb-3">
        <FieldLabel className="text-sm font-semibold text-foreground/80">{title}</FieldLabel>
        <Button 
          type="button" 
          variant="outline" 
          size="sm" 
          className="h-7 text-xs px-2.5 hover:bg-primary/10 hover:text-primary transition-colors border-dashed"
          onClick={sentences.add}
        >
          <Plus className="h-3.5 w-3.5 mr-1" /> Add
        </Button>
      </div>
      <div ref={containerRef} className="flex flex-col gap-2.5">
        {sentences.items.map((item, index) => (
          <div key={index} className="flex items-center gap-2 group/item">
            <span className="text-xs font-mono text-muted-foreground/60 min-w-5">
              {(index + 1).toString().padStart(2, '0')}
            </span>
            <div className="relative flex-1">
              <Input
                value={item}
                placeholder={placeholder || `Enter ${title.toLowerCase().slice(0, -1)}...`}
                onChange={(e) => sentences.update(index, e.target.value)}
                className="w-full bg-background/50 hover:bg-background/80 focus:bg-background transition-colors pr-8"
              />
              {item && (
                <button
                  type="button"
                  onClick={() => sentences.update(index, "")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground/40 hover:text-muted-foreground transition-colors text-xs select-none"
                >
                  ✕
                </button>
              )}
            </div>
            {sentences.items.length > 1 && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-9 w-9 text-muted-foreground/50 hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors shrink-0"
                onClick={() => sentences.remove(index)}
              >
                <Minus className="h-4 w-4" />
              </Button>
            )}
          </div>
        ))}
      </div>
    </Field>
  )
}