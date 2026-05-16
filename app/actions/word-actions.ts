"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"

type CreateWordInput = {
  englishTerm: string
  persianTranslation: string
  selectedParts: string[]
  exampleSentences: string[]
  definitions: string[]
}

const PARTS_OF_SPEECH_MAP: Record<string, string> = {
  verb: "v", noun: "n", adjective: "adj", adverb: "adv",
  pronoun: "pron", preposition: "prep", conjunction: "conj", interjection: "inter",
}

export async function createWordAction(data: CreateWordInput) {
  try {
    // 1. Format the Persian translations (split by " - " as per your UI instructions)
    const persianTranslationsArray = data.persianTranslation
      .split("-")
      .map((t) => t.trim())
      .filter((t) => t.length > 0)

    // 2. Filter out any empty sentences or definitions
    const cleanSentences = data.exampleSentences.filter(s => s.trim().length > 0)
    const cleanDefinitions = data.definitions.filter(d => d.trim().length > 0)

    // 3. Save to database using Prisma's nested creates
    const newWord = await prisma.word.create({
      data: {
        englishTerm: data.englishTerm,
        persianTranslations: persianTranslationsArray,
        studyProgress: [0,0,0,0,0,0,0,0,0,0,0],
        partsOfSpeech: {
          create: data.selectedParts.map((part) => ({
            value: part,
            label: PARTS_OF_SPEECH_MAP[part] || part
          }))
        },
        exampleSentences: {
          create: cleanSentences.map((sentence) => ({
            content: sentence
          }))
        },
        definitions: {
          create: cleanDefinitions.map((def) => ({
            content: def
          }))
        }
      }
    })

    // Optional: Refresh the page cache if you display these words elsewhere
    revalidatePath('/') 

    return { success: true, wordId: newWord.id }
  } catch (error) {
    console.error("Failed to save word:", error)
    return { success: false, error: "Database error occurred" }
  }
}

export async function deleteWordAction(id: number) {
  try {
    await prisma.word.delete({
      where: { id },
    })

    // Refresh the page so the deleted word disappears from the grid
    revalidatePath('/words') // Note: Change this path if your page is located somewhere else (e.g., '/')

    return { success: true }
  } catch (error) {
    console.error("Failed to delete word:", error)
    return { success: false, error: "Could not delete word from database" }
  }
}

export async function updateWordProgressAction(id: number, studyProgress: number[]) {
  try {
    // Tell Prisma to update the specific word with the new progress array
    await prisma.word.update({
      where: { id },
      data: { studyProgress }
    })

    // Clear the Next.js cache so the updated boxes show up immediately
    revalidatePath('/words')
    revalidatePath('/study', 'layout') // The 'layout' flag clears all dynamic /study/lesson/[id] routes too

    return { success: true }
  } catch (error) {
    console.error("Failed to update progress:", error)
    return { success: false, error: "Failed to save study progress to database." }
  }
}