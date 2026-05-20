"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { createQuestionWithSlide } from "../session/slide-service"
import { QuestionType } from "@prisma/client"

  type CreateOptionInput = {
    content: string
    isCorrect: boolean
  }

  function validateQuestionInput({
    type,
    content,
    options,
  }: {
    type: QuestionType
    content: string
    options: CreateOptionInput[]
  }) {
    if (!content.trim()) {
      throw new Error("La pregunta no puede estar vacía")
    }

    if (type === "SHORT_ANSWER") {
      return
    }

    if (type === "MULTIPLE_CHOICE") {
      const filledOptions = options.filter((option) => option.content.trim() !== "")

      if (filledOptions.length < 2) {
        throw new Error("Debe haber al menos dos opciones")
      }

      if (!filledOptions.some((option) => option.isCorrect)) {
        throw new Error("Debe haber una opción correcta")
      }

      return
    }

    if (type === "TRUE_FALSE") {
      if (options.length !== 2) {
        throw new Error("La pregunta verdadero/falso debe tener exactamente dos opciones")
      }

      const correctCount = options.filter((option) => option.isCorrect).length
      if (correctCount !== 1) {
        throw new Error("Debe haber exactamente una respuesta correcta")
      }

      return
    }
  }

  // ---------------- CREATE ----------------

  export async function createQuestionAction({
    sessionId,
    content,
    type,
    options,
    insertAt,
  }: {
    sessionId: string
    content: string
    type: QuestionType
    options: { content: string; isCorrect: boolean }[]
    insertAt?: number
  }) {

    const sessionAuth = await auth.api.getSession({
      headers: await headers(),
    })

    if (!sessionAuth) throw new Error("Unauthorized")

    validateQuestionInput({
      type,
      content,
      options,
    })

    return createQuestionWithSlide({
      sessionId,
      content,
      type,
      options,
      insertAt,
    })

  }

  // ---------------- UPDATE  ----------------

  export async function updateQuestionAction({
    questionId,
    content,
    type,
    options,
  }: {
    questionId: string
    content: string
    type: QuestionType
    options: { content: string; isCorrect: boolean }[]
  }) {
    const sessionAuth = await auth.api.getSession({
      headers: await headers(),
    })

    if (!sessionAuth) throw new Error("Unauthorized")

    validateQuestionInput({
      type,
      content,
      options,
    })

    const question = await prisma.question.findUnique({
      where: {
        id: questionId,
      },
      include: {
        session: true,
      },
    })

    if (!question) {
      throw new Error("Pregunta no encontrada")
    }

    if (question.session.ownerId !== sessionAuth.user.id) {
      throw new Error("Forbidden")
    }

    const trimmedContent = content.trim()

    const finalOptions =
      type === "SHORT_ANSWER"
        ? []
        : options
            .map((option) => ({
              content: option.content.trim(),
              isCorrect: option.isCorrect,
            }))
            .filter((option) => option.content.length > 0)

    await prisma.$transaction(async (tx) => {
      await tx.option.deleteMany({
        where: {
          questionId,
        },
      })

      await tx.question.update({
        where: {
          id: questionId,
        },
        data: {
          content: trimmedContent,
          type,
          options: {
            create: finalOptions,
          },
        },
      })
    })
  }

  // ---------------- DELETE ----------------

  export async function deleteQuestionWithSlide(questionId: string) {

    const sessionAuth = await auth.api.getSession({
      headers: await headers(),
    })

    if (!sessionAuth) throw new Error("Unauthorized")

    const question = await prisma.question.findUnique({
      where: { id: questionId },
      include: {
        slide: true,
      },
    })

    if (!question) throw new Error("Not found")

    const session = await prisma.teachingSession.findUnique({
      where: { id: question.sessionId },
    })

    if (!session || session.ownerId !== sessionAuth.user.id) {
      throw new Error("Forbidden")
    }

    const slide = question.slide
    const slideOrder = slide?.order

    if (slide && slideOrder !== undefined) {

      await prisma.slide.delete({
        where: { id: slide.id }
      })
      
      await prisma.slide.updateMany({
        where: {
          sessionId: session.id,
          order: { gt: slide.order },
        },
        data: {
          order: { decrement: 1 },
        },
      })

    }

  }

  // ---------------- GET SLIDES ----------------
  // REVISAR: Pdte. mover a otro archivo

  export async function getSlidesBySessionAction(sessionId: string) {

    const sessionAuth = await auth.api.getSession({
      headers: await headers(),
    })

    if (!sessionAuth) throw new Error("Unauthorized")


    const session = await prisma.teachingSession.findUnique({
      where: { id: sessionId },
    })

    if (!session) throw new Error("Session not found")  

    const questionSlides = await prisma.slide.findMany({
      where: { sessionId },
      orderBy: { order: "asc" },
      include: {
        question: {
          include: {
            options: true,
          },
        },
      },
    })

    return buildSlides({
      pdfPages: session.pdfPages,
      questionSlides
    })
  }

  function buildSlides({
    pdfPages,
    questionSlides
  }: {
    pdfPages: number
    questionSlides: any[]
  }) {

    const slides: any[] = []

    for (let i = 1; i <= pdfPages; i++) {
      slides.push({
        type: "PDF",
        page: i
      }) 
    }

    questionSlides.sort((a,b) => a.order - b.order)
    
    questionSlides.forEach(q => {
      slides.splice(q.order, 0, {
        type: "QUESTION",
        question: q.question
      })
    })

    return slides
  }

  export async function getPublicSlidesBySessionAction(sessionId: string) {
  const session = await prisma.teachingSession.findUnique({
    where: { id: sessionId },
    select: {
      id: true,
      pdfPages: true,
      isArchived: true,
    },
  })

  if (!session) {
    throw new Error("Session not found")
  }

  if (session.isArchived) {
    throw new Error("Esta sesión ya no está disponible.")
  }

  const questionSlides = await prisma.slide.findMany({
    where: { sessionId },
    orderBy: { order: "asc" },
    include: {
      question: {
        include: {
          options: true,
        },
      },
    },
  })

  return buildSlides({
    pdfPages: session.pdfPages,
    questionSlides,
  })
}