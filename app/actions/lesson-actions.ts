'use server'

import prisma from '@/lib/prisma'

export async function createLessonAction(name: string) {
  try {
    // Check if a lesson with this name already exists to prevent duplicates
    const existingLesson = await prisma.lesson.findFirst({
      where: { name: { equals: name, mode: 'insensitive' } },
    })

    if (existingLesson) {
      return { success: true, data: existingLesson }
    }

    const newLesson = await prisma.lesson.create({
      data: { name },
    })

    return { success: true, data: newLesson }
  } catch (error) {
    console.error('Error creating lesson:', error)
    return { success: false, error: 'Failed to create lesson.' }
  }
}

export async function getLessonsAction() {
  try {
    const lessons = await prisma.lesson.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        name: true,
      },
    })

    return { success: true, data: lessons }
  } catch (error) {
    console.error('Error fetching lessons:', error)
    return { success: false, error: 'Failed to load lessons.' }
  }
}
