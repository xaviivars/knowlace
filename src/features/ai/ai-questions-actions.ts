"use server"

import { createHash } from "crypto"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { extractPdfPageText } from "@/lib/pdf/extractPdfText"
import { generateQuestionsFromText } from "@/features/ai/ai-questions-service"
import { generateQuestionsPreviewInputSchema } from "@/features/ai/ai-question.schema"

function createTextHash(text: string) {
  return createHash("sha256").update(text).digest("hex")
}

export async function generateQuestionsPreviewAction(input: unknown) {
  const parsedInput = generateQuestionsPreviewInputSchema.parse(input)

  const authSession = await auth.api.getSession({
    headers: await headers(),
  })

  if (!authSession?.user?.id) {
    throw new Error("Unauthorized")
  }

  const teachingSession = await prisma.teachingSession.findUnique({
    where: {
      id: parsedInput.sessionId,
    },
    select: {
      id: true,
      ownerId: true,
      pdfUrl: true,
      pdfKey: true,
      pdfPages: true,
    },
  })

  if (!teachingSession) {
    throw new Error("Session not found")
  }

  if (teachingSession.ownerId !== authSession.user.id) {
    throw new Error("Forbidden")
  }

  if (parsedInput.page > teachingSession.pdfPages) {
    throw new Error("Selected page does not exist in this PDF")
  }

  const cachedPageText = await prisma.pdfPageText.findUnique({
    where: {
      sessionId_page: {
        sessionId: teachingSession.id,
        page: parsedInput.page,
      },
    },
  })

  let sourceText: string

  if (
    cachedPageText &&
    cachedPageText.sourcePdfKey === teachingSession.pdfKey &&
    cachedPageText.text.trim().length > 0
  ) {
    sourceText = cachedPageText.text
  } else {
    sourceText = await extractPdfPageText(
      teachingSession.pdfUrl,
      parsedInput.page
    )

    if (!sourceText.trim()) {
      throw new Error("No readable text found on this PDF page")
    }

    await prisma.pdfPageText.upsert({
      where: {
        sessionId_page: {
          sessionId: teachingSession.id,
          page: parsedInput.page,
        },
      },
      create: {
        sessionId: teachingSession.id,
        page: parsedInput.page,
        text: sourceText,
        textHash: createTextHash(sourceText),
        sourcePdfKey: teachingSession.pdfKey,
      },
      update: {
        text: sourceText,
        textHash: createTextHash(sourceText),
        sourcePdfKey: teachingSession.pdfKey,
      },
    })
  }

  const questions = await generateQuestionsFromText({
    text: sourceText,
    amount: parsedInput.amount,
    type: parsedInput.type,
  })

  return {
    sourcePage: parsedInput.page,
    sourceText,
    questions,
  }
}