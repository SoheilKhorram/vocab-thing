import { useState } from "react"

export function useSentence(initialState: string[] = [""]) {
  const [items, setItems] = useState<string[]>(initialState)

  const add = () => setItems((prev) => [...prev, ""])
  
  const update = (index: number, value: string) => {
    setItems((prev) => {
      const newItems = [...prev]
      newItems[index] = value
      return newItems
    })
  }
  
  const remove = (index: number) => setItems((prev) => prev.filter((_, i) => i !== index))
  
  const reset = (newItems: string[] = [""]) => setItems(newItems)

  return { items, add, update, remove, reset }
}