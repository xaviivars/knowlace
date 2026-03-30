"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { createQuestionWithSlide } from "../session/slide-service"

  // ---------------- CREATE ----------------

  export async function createQuestionAction({
    sessionId,
    content,
    options,
    insertAt,
  }: {
    sessionId: string
    content: string
    options: { content: string; isCorrect: boolean }[]
    insertAt?: number
  }) {

    const sessionAuth = await auth.api.getSession({
      headers: await headers(),
    })

    if (!sessionAuth) throw new Error("Unauthorized")

    if (!content.trim()) {
      throw new Error("La pregunta no puede estar vacía")
    }

    if (!options.some(o => o.isCorrect)) {
      throw new Error("Debe haber una opción correcta")
    }

    return createQuestionWithSlide({
      sessionId,
      content,
      options,
      insertAt,
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