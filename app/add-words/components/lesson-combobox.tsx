'use client'

import { useEffect, useState } from "react"
import { Check, ChevronsUpDown, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { createLessonAction, getLessonsAction } from "@/app/actions/lesson-actions"
import { cn } from "@/lib/utils"

export type Lesson = {
  id: string
  name: string
}

interface LessonComboboxProps {
  value: string | null
  onValueChange: (value: string | null) => void
}

export function LessonCombobox({ value, onValueChange }: LessonComboboxProps) {
  const [open, setOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [sortingValue, setSortingValue] = useState(value)

  const [lessons, setLessons] = useState<Lesson[]>([])

  useEffect(() => {
    const fetchLessons = async () => {
      const result = await getLessonsAction()
      if (result.success && result.data) {
        setLessons(result.data)
        onValueChange(result.data[0].id)
        setSortingValue(result.data[0].id)
      }
    }
    fetchLessons()
  }, [])

  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen) {
      setSortingValue(value)
    }
    setOpen(newOpen)
  }

  const handleCreateLesson = async () => {
    if (!searchQuery.trim()) return

    const result = await createLessonAction(searchQuery.trim())

    if (result.success && result.data) {
      const newLesson = result.data

      setLessons((prev) => [...prev, { id: newLesson.id, name: newLesson.name }])
      onValueChange(newLesson.id)
      setOpen(false)
      setSearchQuery("")
    } else {
      alert(result.error)
    }
  }

  const selectedLesson = lessons.find((l) => l.id === value)

  const displayLessons = sortingValue
    ? [
      ...lessons.filter((l) => l.id === sortingValue),
      ...lessons.filter((l) => l.id !== sortingValue)
    ]
    : lessons

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between bg-background"
        >
          {selectedLesson ? selectedLesson.name : "Select or create lesson..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-(--radix-popover-trigger-width) p-0" align="start">
        <Command>
          <CommandInput
            placeholder="Search lessons..."
            value={searchQuery}
            onValueChange={setSearchQuery}
          />
          <CommandList>
            <CommandEmpty className="py-2 px-2">
              {searchQuery.length > 0 ? (
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full justify-start text-sm"
                  onClick={handleCreateLesson}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Create &quot;{searchQuery}&quot;
                </Button>
              ) : (
                "No lessons found."
              )}
            </CommandEmpty>

            <CommandGroup>
              {displayLessons.map((lesson) => (
                <CommandItem
                  key={lesson.id}
                  value={lesson.name}
                  className={cn(value === lesson.id ? "text-primary-foreground" : "text-muted-foreground", "cursor-pointer")}
                  onSelect={() => {
                    onValueChange(lesson.id)
                    setOpen(false)
                  }}
                >
                  <Check
                    className={`mr-2 h-4 w-4 ${value === lesson.id ? "opacity-100" : "opacity-0"}`}
                  />
                  {lesson.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}